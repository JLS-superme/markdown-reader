const { app, BrowserWindow, Menu, dialog, ipcMain, shell, screen } = require("electron");
const fsSync = require("fs");
const fs = require("fs/promises");
const path = require("path");
const { pathToFileURL, fileURLToPath } = require("url");
const { spawn } = require("child_process");
const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, BorderStyle, ShadingType, LevelFormat } = require("docx");
const JSZip = require("jszip");
const markdownSyntax = require("./markdown-syntax");
const { PDFDocument } = require("pdf-lib");
const { PDFName, PDFDict, PDFArray, PDFRawStream, decodePDFRawStream } = require("pdf-lib/cjs/core");

const EMBEDDED_MARKDOWN_FILE = "markdown-editor-source.md";

let mainWindow;
const pendingOpenFilePaths = [];
let watchedMarkdownFile = null;
let watchedMarkdownTimer = null;
const editorStates = new Map();
const closePromptWindows = new WeakSet();
const windowsAllowedToClose = new WeakSet();

const SUPPORTED_OPEN_EXTENSIONS = new Set([".md", ".markdown", ".txt", ".docx", ".html", ".htm", ".pdf"]);

const DEFAULT_WINDOW_STATE = {
  width: 1280,
  height: 820,
  isMaximized: false,
};
const MIN_WINDOW_WIDTH = 960;
const MIN_WINDOW_HEIGHT = 620;

function getWindowStatePath() {
  return path.join(app.getPath("userData"), "window-state.json");
}

function loadWindowState() {
  let savedState = {};
  try {
    savedState = JSON.parse(fsSync.readFileSync(getWindowStatePath(), "utf8"));
  } catch (_error) {
    // The first launch has no saved state yet.
  }

  const workArea = screen.getPrimaryDisplay().workAreaSize;
  return {
    width: clampWindowDimension(savedState.width, MIN_WINDOW_WIDTH, workArea.width),
    height: clampWindowDimension(savedState.height, MIN_WINDOW_HEIGHT, workArea.height),
    isMaximized: savedState.isMaximized === true,
  };
}

function clampWindowDimension(value, minimum, screenLimit) {
  const numericValue = Number(value);
  const fallback = minimum === MIN_WINDOW_WIDTH ? DEFAULT_WINDOW_STATE.width : DEFAULT_WINDOW_STATE.height;
  const safeValue = Number.isFinite(numericValue) ? Math.round(numericValue) : fallback;
  return Math.max(minimum, Math.min(safeValue, Math.max(minimum, screenLimit)));
}

function saveWindowState(window) {
  if (!window || window.isDestroyed()) {
    return;
  }

  const bounds = window.isMaximized() ? window.getNormalBounds() : window.getBounds();
  const state = {
    width: bounds.width,
    height: bounds.height,
    isMaximized: window.isMaximized(),
  };

  try {
    fsSync.writeFileSync(getWindowStatePath(), JSON.stringify(state, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to save window state:", error);
  }
}

function findFilePathInArguments(argumentsList, workingDirectory = process.cwd()) {
  for (const argument of argumentsList) {
    if (!argument || argument.startsWith("--")) {
      continue;
    }

    const candidate = path.isAbsolute(argument) ? argument : path.resolve(workingDirectory, argument);
    if (!SUPPORTED_OPEN_EXTENSIONS.has(path.extname(candidate).toLowerCase())) {
      continue;
    }

    try {
      if (fsSync.statSync(candidate).isFile()) {
        return candidate;
      }
    } catch (_error) {
      // Ignore arguments that are not accessible local files.
    }
  }

  return null;
}

function queueFileToOpen(filePath) {
  if (!filePath) {
    return;
  }

  if (!app.isReady()) {
    pendingOpenFilePaths.push(filePath);
    return;
  }

  // Explorer launches are separate documents, just like Ctrl-clicked MD links.
  // Give each request its own window and file payload, including rapid launches.
  if ([".md", ".markdown"].includes(path.extname(filePath).toLowerCase())) {
    openLinkedMarkdownInNewWindow(filePath).catch((error) => {
      dialog.showErrorBox("打开文件失败", `${filePath}\n${error.message}`);
    });
    return;
  }

  const ownerWindow = mainWindow && !mainWindow.isDestroyed() ? mainWindow : createWindow();
  if (ownerWindow.isMinimized()) {
    ownerWindow.restore();
  }
  ownerWindow.show();
  ownerWindow.focus();

  if (ownerWindow.webContents.isLoadingMainFrame()) {
    ownerWindow.webContents.once("did-finish-load", () => openFileInWindow(filePath, ownerWindow));
  } else {
    openFileInWindow(filePath, ownerWindow);
  }
}

async function openFileInWindow(filePath, ownerWindow) {
  try {
    const file = await prepareImportedFile(filePath);
    if (file && ownerWindow && !ownerWindow.isDestroyed()) {
      ownerWindow.webContents.send("open-file", file);
    }
  } catch (error) {
    if (ownerWindow && !ownerWindow.isDestroyed()) {
      ownerWindow.webContents.send("import-status", `\u6253\u5f00\u6587\u4ef6\u5931\u8d25\uff1a${error.message}`);
    }
  }
}

function stopWatchingMarkdownFile() {
  if (watchedMarkdownTimer) {
    clearTimeout(watchedMarkdownTimer);
    watchedMarkdownTimer = null;
  }
  watchedMarkdownFile?.watcher?.close();
  watchedMarkdownFile = null;
}

function sameFilePath(left, right) {
  return String(left || "").replace(/\\/g, "/").toLowerCase() === String(right || "").replace(/\\/g, "/").toLowerCase();
}

function watchMarkdownFile(filePath) {
  stopWatchingMarkdownFile();
  if (!filePath || ![".md", ".markdown"].includes(path.extname(filePath).toLowerCase())) {
    return { ok: true };
  }

  const normalizedPath = path.resolve(filePath);
  try {
    const content = fsSync.readFileSync(normalizedPath, "utf8");
    const directory = path.dirname(normalizedPath);
    const name = path.basename(normalizedPath);
    const watcher = fsSync.watch(directory, { persistent: false }, (_eventType, changedName) => {
      if (changedName && String(changedName).toLowerCase() !== name.toLowerCase()) {
        return;
      }
      if (watchedMarkdownTimer) {
        clearTimeout(watchedMarkdownTimer);
      }
      watchedMarkdownTimer = setTimeout(() => checkWatchedMarkdownFile(), 220);
    });

    watchedMarkdownFile = { path: normalizedPath, name, content, watcher };
    return { ok: true };
  } catch (error) {
    return { ok: false, message: `\u65e0\u6cd5\u76d1\u6d4b Markdown \u6587\u4ef6\uff1a${error.message}` };
  }
}

function checkWatchedMarkdownFile(retriesRemaining = 2) {
  watchedMarkdownTimer = null;
  if (!watchedMarkdownFile) {
    return;
  }

  const watchedFile = watchedMarkdownFile;

  try {
    const content = fsSync.readFileSync(watchedFile.path, "utf8");
    if (watchedFile !== watchedMarkdownFile || content === watchedFile.content) {
      return;
    }

    watchedFile.content = content;
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("external-file-changed", {
        path: watchedFile.path,
        name: watchedFile.name,
      });
    }
  } catch (_error) {
    // Atomic saves can briefly remove the original path before replacing it.
    if (retriesRemaining > 0 && watchedFile === watchedMarkdownFile) {
      watchedMarkdownTimer = setTimeout(() => checkWatchedMarkdownFile(retriesRemaining - 1), 250);
    }
  }
}

function createWindow(filePath = null) {
  const windowState = loadWindowState();
  const window = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    minWidth: MIN_WINDOW_WIDTH,
    minHeight: MIN_WINDOW_HEIGHT,
    title: "Markdown 编辑器",
    icon: path.join(__dirname, "image", "MD.ico"),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow = window;
  if (filePath) {
    window.webContents.once("did-finish-load", () => openFileInWindow(filePath, window));
  }
  window.loadFile(path.join(__dirname, "index.html"));
  window.setMenuBarVisibility(false);
  attachWindowCloseHandler(window, true);
  window.on("closed", () => {
    if (mainWindow === window) {
      stopWatchingMarkdownFile();
      mainWindow = null;
    }
  });

  if (windowState.isMaximized) {
    window.maximize();
  }
  return window;
}

async function openLinkedMarkdownInNewWindow(filePath) {
  const normalizedPath = path.resolve(filePath);
  const content = await fs.readFile(normalizedPath, "utf8");
  const file = { ok: true, ...fileInfo(normalizedPath, { content }), watch: false };
  const linkedWindow = new BrowserWindow({
    width: DEFAULT_WINDOW_STATE.width,
    height: DEFAULT_WINDOW_STATE.height,
    minWidth: MIN_WINDOW_WIDTH,
    minHeight: MIN_WINDOW_HEIGHT,
    title: "Markdown 编辑器",
    icon: path.join(__dirname, "image", "MD.ico"),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  linkedWindow.webContents.once("did-finish-load", () => linkedWindow.webContents.send("open-file", file));
  linkedWindow.setMenuBarVisibility(false);
  attachWindowCloseHandler(linkedWindow, false);
  await linkedWindow.loadFile(path.join(__dirname, "index.html"));
  return linkedWindow;
}

function attachWindowCloseHandler(window, persistWindowState) {
  const webContentsId = window.webContents.id;
  window.on("close", (event) => {
    if (persistWindowState) {
      saveWindowState(window);
    }
    if (windowsAllowedToClose.has(window)) {
      return;
    }

    const state = editorStates.get(webContentsId);
    if (!state?.dirty) {
      return;
    }

    event.preventDefault();
    promptToSaveBeforeClose(window, webContentsId);
  });
  window.on("closed", () => editorStates.delete(webContentsId));
}

async function promptToSaveBeforeClose(window, webContentsId) {
  if (closePromptWindows.has(window) || window.isDestroyed()) {
    return;
  }

  closePromptWindows.add(window);
  try {
    const state = editorStates.get(webContentsId);
    if (!state?.dirty) {
      windowsAllowedToClose.add(window);
      window.close();
      return;
    }

    const confirmation = await dialog.showMessageBox(window, {
      type: "question",
      title: "内容尚未保存",
      message: "当前内容已经编辑，是否保存？",
      detail: state.name ? `尚未保存对 ${state.name} 的修改。` : "尚未保存当前编辑内容。",
      buttons: ["保存", "不保存", "取消"],
      defaultId: 0,
      cancelId: 2,
      noLink: true,
    });

    if (confirmation.response === 2) {
      return;
    }

    if (confirmation.response === 0) {
      const latestState = editorStates.get(webContentsId) || state;
      const result = await saveMarkdownDocument(window, latestState);
      if (!result.ok) {
        return;
      }
    }

    windowsAllowedToClose.add(window);
    window.close();
  } catch (error) {
    await dialog.showMessageBox(window, {
      type: "error",
      title: "保存失败",
      message: `无法保存当前内容：${error.message}`,
      buttons: ["知道了"],
    });
  } finally {
    closePromptWindows.delete(window);
  }
}

const initialFilePath = findFilePathInArguments(process.argv);
if (initialFilePath) {
  pendingOpenFilePaths.push(initialFilePath);
}
const hasSingleInstanceLock = app.requestSingleInstanceLock();

if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, commandLine, workingDirectory) => {
    const filePath = findFilePathInArguments(commandLine, workingDirectory);
    if (filePath) {
      queueFileToOpen(filePath);
    } else {
      const window = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
      if (!window) return;
      if (window.isMinimized()) {
        window.restore();
      }
      window.show();
      window.focus();
    }
  });

  app.on("open-file", (event, filePath) => {
    event.preventDefault();
    queueFileToOpen(filePath);
  });

  app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    createWindow(pendingOpenFilePaths.shift() || null);
    pendingOpenFilePaths.splice(0).forEach(queueFileToOpen);
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (hasSingleInstanceLock && BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle("set-current-document", (_event, filePath) => watchMarkdownFile(String(filePath || "")));

ipcMain.on("update-editor-state", (event, state) => {
  editorStates.set(event.sender.id, {
    dirty: state?.dirty === true,
    content: String(state?.content || ""),
    currentPath: String(state?.currentPath || ""),
    name: String(state?.name || "\u672a\u547d\u540d.md"),
  });
});

ipcMain.handle("save-markdown-document", async (event, payload) => {
  const ownerWindow = BrowserWindow.fromWebContents(event.sender) || mainWindow;
  return saveMarkdownDocument(ownerWindow, payload);
});

ipcMain.handle("reload-current-document", async (_event, filePath) => {
  const normalizedPath = path.resolve(String(filePath || ""));
  if (!watchedMarkdownFile || !sameFilePath(normalizedPath, watchedMarkdownFile.path)) {
    return { ok: false, message: "\u5f53\u524d Markdown \u6587\u4ef6\u5df2\u53d8\u66f4，\u65e0\u6cd5\u91cd\u65b0\u52a0\u8f7d" };
  }

  const file = await prepareImportedFile(normalizedPath);
  if (file?.ok !== false && file) {
    watchMarkdownFile(normalizedPath);
  }
  return file;
});

ipcMain.handle("pick-import-file", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "\u5bfc\u5165\u6587\u4ef6",
    properties: ["openFile"],
    filters: [
      { name: "\u652f\u6301\u7684\u6587\u4ef6", extensions: ["md", "markdown", "txt", "docx", "html", "htm", "pdf"] },
      { name: "Markdown / Text", extensions: ["md", "markdown", "txt"] },
      { name: "Word / HTML / PDF", extensions: ["docx", "html", "htm", "pdf"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });

  if (result.canceled || !result.filePaths[0]) {
    return null;
  }

  return prepareImportedFile(result.filePaths[0]);
});

ipcMain.handle("import-dropped-file", async (_event, filePath) => prepareImportedFile(filePath));

ipcMain.handle("pick-markdown-file", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "导入 Markdown 文件",
    properties: ["openFile"],
    filters: [
      { name: "Markdown / Text", extensions: ["md", "markdown", "txt"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });

  if (result.canceled || !result.filePaths[0]) {
    return null;
  }

  const filePath = result.filePaths[0];
  const content = await fs.readFile(filePath, "utf8");
  return fileInfo(filePath, { content });
});

ipcMain.handle("pick-link-file", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "选择要链接的文件",
    properties: ["openFile"],
  });

  if (result.canceled || !result.filePaths[0]) {
    return null;
  }

  return fileInfo(result.filePaths[0]);
});

ipcMain.handle("pick-link-image", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "选择图片",
    properties: ["openFile"],
    filters: [
      { name: "Images", extensions: ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });

  if (result.canceled || !result.filePaths[0]) {
    return null;
  }

  return fileInfo(result.filePaths[0], { kind: "image" });
});

ipcMain.handle("pick-link-folder", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "选择要链接的文件夹",
    properties: ["openDirectory"],
  });

  if (result.canceled || !result.filePaths[0]) {
    return null;
  }

  return fileInfo(result.filePaths[0], { kind: "folder" });
});

ipcMain.handle("open-local-target", async (_event, target) => {
  const normalized = normalizeTarget(target);
  if (!normalized.path) {
    return { ok: false, message: "无法识别本地路径" };
  }

  let stats;
  try {
    stats = await fs.stat(normalized.path);
  } catch (error) {
    return { ok: false, message: `本地路径无法访问：${error.message}` };
  }

  if (normalized.kind === "folder" || stats.isDirectory()) {
    const error = await shell.openPath(normalized.path);
    return { ok: !error, message: error || "已打开文件夹" };
  }

  if ([".md", ".markdown"].includes(path.extname(normalized.path).toLowerCase())) {
    await openLinkedMarkdownInNewWindow(normalized.path);
    return { ok: true, message: `已在新窗口打开 ${path.basename(normalized.path)}` };
  }

  shell.showItemInFolder(normalized.path);
  return { ok: true, message: "已在资源管理器中定位文件" };
});

ipcMain.handle("save-export-file", async (_event, payload) => {
  const format = String(payload?.format || "html");
  const extension = format === "jpg" ? "jpg" : format;
  const result = await dialog.showSaveDialog(mainWindow, {
    title: "导出文件",
    defaultPath: payload?.name || `markdown-export.${extension}`,
    filters: [exportFilter(format), { name: "All Files", extensions: ["*"] }],
  });

  if (result.canceled || !result.filePath) {
    return { ok: false, message: "已取消导出" };
  }

  const outputPath = ensureOutputExtension(result.filePath, extension);
  if (payload?.disallowPath && sameFilePath(outputPath, payload.disallowPath)) {
    return { ok: false, message: "\u53e6\u5b58\u4e3a\u4f4d\u7f6e\u4e0d\u80fd\u662f\u5f53\u524d\u5df2\u88ab\u4fee\u6539\u7684\u539f\u6587\u4ef6\uff0c\u8bf7\u9009\u62e9\u5176\u4ed6\u4f4d\u7f6e" };
  }

  if (format === "md" || format === "html") {
    await fs.writeFile(outputPath, String(payload?.content || ""), "utf8");
  } else if (format === "pdf") {
    await fs.writeFile(outputPath, await renderHtmlToPdf(
      String(payload?.content || ""),
      String(payload?.sourceMarkdown || ""),
    ));
  } else if (["png", "jpg", "webp"].includes(format)) {
    await fs.writeFile(outputPath, await renderHtmlToImage(String(payload?.content || ""), format));
  } else if (format === "docx") {
    await fs.writeFile(outputPath, await renderMarkdownToDocx(String(payload?.sourceMarkdown || "")));
  } else {
    return { ok: false, message: "不支持的导出格式" };
  }

  return { ok: true, path: outputPath, message: `已导出 ${outputPath}` };
});

async function saveMarkdownDocument(ownerWindow, payload) {
  const content = String(payload?.content || "");
  const currentPath = String(payload?.currentPath || "");
  const currentName = String(payload?.name || "\u672a\u547d\u540d.md");
  let outputPath = currentPath;

  if (![".md", ".markdown"].includes(path.extname(currentPath).toLowerCase())) {
    const baseName = path.parse(currentName).name || "\u672a\u547d\u540d";
    const result = await dialog.showSaveDialog(ownerWindow, {
      title: "保存 Markdown 文件",
      defaultPath: `${baseName}.md`,
      filters: [
        { name: "Markdown", extensions: ["md", "markdown"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });

    if (result.canceled || !result.filePath) {
      return { ok: false, canceled: true, message: "已取消保存" };
    }
    outputPath = ensureOutputExtension(result.filePath, "md");
  }

  await fs.writeFile(outputPath, content, "utf8");
  if (ownerWindow === mainWindow) {
    watchMarkdownFile(outputPath);
  }
  if (ownerWindow && !ownerWindow.isDestroyed()) {
    editorStates.set(ownerWindow.webContents.id, {
      dirty: false,
      content,
      currentPath: outputPath,
      name: path.basename(outputPath),
    });
  }
  return {
    ok: true,
    path: outputPath,
    name: path.basename(outputPath),
    message: `已保存 ${outputPath}`,
  };
}

async function prepareImportedFile(filePath) {
  const normalizedPath = path.resolve(String(filePath || ""));
  const extension = path.extname(normalizedPath).toLowerCase();
  const textExtensions = new Set([".md", ".markdown", ".txt"]);
  const convertibleExtensions = new Set([".docx", ".html", ".htm", ".pdf"]);

  if (!textExtensions.has(extension) && !convertibleExtensions.has(extension)) {
    return {
      ok: false,
      message: "\u8bf7\u9009\u62e9 Markdown\u3001TXT\u3001DOCX\u3001HTML \u6216 PDF \u6587\u4ef6",
    };
  }

  if (textExtensions.has(extension)) {
    const content = await fs.readFile(normalizedPath, "utf8");
    return { ok: true, ...fileInfo(normalizedPath, { content }) };
  }

  const originalName = path.basename(normalizedPath);
  const embeddedMarkdown = await extractEmbeddedMarkdown(normalizedPath, extension);
  if (embeddedMarkdown !== null) {
    return {
      ok: true,
      kind: "file",
      name: `${path.basename(normalizedPath, extension)}.md`,
      originalName,
      path: normalizedPath,
      fileUrl: pathToFileURL(normalizedPath).href,
      content: embeddedMarkdown,
      converted: true,
      sourceFormat: extension.slice(1).toUpperCase(),
      message: `已恢复 ${originalName} 中保留的 Markdown 源结构`,
    };
  }

  const confirmation = await dialog.showMessageBox(mainWindow, {
    type: "question",
    title: "\u8f6c\u6362\u4e3a Markdown",
    message: `${originalName} \u4e0d\u662f Markdown \u6587\u4ef6`,
    detail: "\u5c06\u5148\u8f6c\u6362\u4e3a Markdown\uff0c\u518d\u5728\u7f16\u8f91\u5668\u4e2d\u6253\u5f00\u3002\u539f\u6587\u4ef6\u4e0d\u4f1a\u88ab\u4fee\u6539\u3002",
    buttons: ["\u8f6c\u6362\u5e76\u5bfc\u5165", "\u53d6\u6d88"],
    defaultId: 0,
    cancelId: 1,
    noLink: true,
  });

  if (confirmation.response !== 0) {
    return null;
  }

  mainWindow?.webContents.send("import-status", `\u6b63\u5728\u5c06 ${originalName} \u8f6c\u6362\u4e3a Markdown...`);
  try {
    const content = await convertDocumentToMarkdown(normalizedPath);
    const convertedName = `${path.basename(normalizedPath, extension)}.md`;
    return {
      ok: true,
      kind: "file",
      name: convertedName,
      originalName,
      path: normalizedPath,
      fileUrl: pathToFileURL(normalizedPath).href,
      content,
      converted: true,
      sourceFormat: extension.slice(1).toUpperCase(),
      message: `\u5df2\u5c06 ${originalName} \u8f6c\u6362\u4e3a Markdown \u5e76\u5bfc\u5165`,
    };
  } catch (error) {
    const message = formatConversionError(error);
    await dialog.showMessageBox(mainWindow, {
      type: "error",
      title: "\u6587\u4ef6\u8f6c\u6362\u5931\u8d25",
      message,
      buttons: ["\u77e5\u9053\u4e86"],
    });
    return { ok: false, message };
  }
}

async function extractEmbeddedMarkdown(filePath, extension) {
  try {
    if (extension === ".pdf") {
      return extractMarkdownFromPdf(await fs.readFile(filePath));
    }
    if (extension === ".docx") {
      const archive = await JSZip.loadAsync(await fs.readFile(filePath));
      const source = archive.file(EMBEDDED_MARKDOWN_FILE);
      return source ? source.async("string") : null;
    }
    if (extension === ".html" || extension === ".htm") {
      const html = await fs.readFile(filePath, "utf8");
      const match = html.match(/<script\s+type=["']application\/x-markdown-editor-source["'][^>]*>([\s\S]*?)<\/script>/i);
      return match ? Buffer.from(match[1].trim(), "base64").toString("utf8") : null;
    }
  } catch (error) {
    console.warn("Unable to restore embedded Markdown source:", error.message);
  }
  return null;
}

async function extractMarkdownFromPdf(pdfBytes) {
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const names = pdf.catalog.lookupMaybe(PDFName.of("Names"), PDFDict);
  const embeddedFiles = names?.lookupMaybe(PDFName.of("EmbeddedFiles"), PDFDict);
  const entries = embeddedFiles?.lookupMaybe(PDFName.of("Names"), PDFArray);
  if (!entries) {
    return null;
  }

  for (let index = 0; index + 1 < entries.size(); index += 2) {
    const name = entries.lookup(index);
    if (!name || typeof name.decodeText !== "function" || name.decodeText() !== EMBEDDED_MARKDOWN_FILE) {
      continue;
    }
    const fileSpec = entries.lookup(index + 1, PDFDict);
    const files = fileSpec?.lookupMaybe(PDFName.of("EF"), PDFDict);
    const stream = files?.lookupMaybe(PDFName.of("F"), PDFRawStream)
      || files?.lookupMaybe(PDFName.of("UF"), PDFRawStream);
    if (stream) {
      return Buffer.from(decodePDFRawStream(stream).decode()).toString("utf8");
    }
  }
  return null;
}

async function convertDocumentToMarkdown(filePath) {
  const configuredPython = String(process.env.MARKITDOWN_PYTHON || "").trim();
  const candidates = configuredPython
    ? [{ executable: configuredPython, prefix: [] }]
    : process.platform === "win32"
      ? [
          { executable: "python", prefix: [] },
          { executable: "py", prefix: ["-3"] },
        ]
      : [
          { executable: "python3", prefix: [] },
          { executable: "python", prefix: [] },
        ];
  let lastError = null;

  for (const candidate of candidates) {
    try {
      return await runConversionProcess(candidate.executable, candidate.prefix, filePath);
    } catch (error) {
      lastError = error;
      if (!error.spawnFailed) {
        throw error;
      }
    }
  }

  throw lastError || new Error("Python was not found");
}

function runConversionProcess(executable, prefixArgs, filePath) {
  return new Promise((resolve, reject) => {
    const scriptPath = app.isPackaged
      ? path.join(
          process.resourcesPath,
          "app.asar.unpacked",
          "convert_to_markdown.py",
        )
      : path.join(__dirname, "convert_to_markdown.py");
    const child = spawn(executable, [...prefixArgs, scriptPath, filePath], {
      windowsHide: true,
      shell: false,
      env: {
        ...process.env,
        PYTHONIOENCODING: "utf-8",
        PYTHONUTF8: "1",
      },
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        child.kill();
        reject(new Error("Conversion timed out"));
      }
    }, 120000);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      if (stdout.length > 64 * 1024 * 1024 && !settled) {
        settled = true;
        clearTimeout(timeout);
        child.kill();
        reject(new Error("Converted document is too large"));
      }
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      error.spawnFailed = true;
      reject(error);
    });
    child.on("close", (code) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(stderr.trim() || `Conversion process exited with code ${code}`));
      }
    });
  });
}

function formatConversionError(error) {
  const detail = String(error?.message || error || "");
  if (/No module named|MissingDependency|dependencies for this feature/i.test(detail)) {
    return "\u8f6c\u6362\u7ec4\u4ef6\u672a\u5b89\u88c5\u5b8c\u6574\u3002\u8bf7\u5728 markdown-editor \u6587\u4ef6\u5939\u8fd0\u884c npm run setup-converter\uff0c\u7136\u540e\u91cd\u8bd5\u3002";
  }
  if (/ENOENT|Python was not found/i.test(detail)) {
    return "\u672a\u627e\u5230 Python 3.10 \u6216\u66f4\u9ad8\u7248\u672c\uff0c\u65e0\u6cd5\u8f6c\u6362\u6587\u6863\u3002";
  }
  if (/timed out/i.test(detail)) {
    return "\u6587\u4ef6\u8f6c\u6362\u8d85\u65f6\uff0c\u8bf7\u68c0\u67e5\u6587\u4ef6\u662f\u5426\u8fc7\u5927\u6216\u635f\u574f\u3002";
  }

  const finalLine = detail.split(/\r?\n/).filter(Boolean).pop() || "\u672a\u77e5\u9519\u8bef";
  return `\u8f6c\u6362\u5931\u8d25\uff1a${finalLine}`;
}

function fileInfo(filePath, extra = {}) {
  return {
    kind: extra.kind || "file",
    name: path.basename(filePath),
    path: filePath,
    fileUrl: pathToFileURL(filePath).href,
    content: extra.content,
  };
}

function normalizeTarget(target) {
  if (!target) {
    return { path: "", kind: "" };
  }

  const kind = target.kind || "";
  let value = decodeMarkdownLinkTarget(String(target.path || target.fileUrl || target.href || ""));
  const basePath = String(target.basePath || "");

  if (/^file:/i.test(value)) {
    value = fileURLToPath(value);
  } else if (basePath && isRelativeLocalTarget(value)) {
    value = path.resolve(path.dirname(basePath), value);
  }

  return { path: value, kind };
}

function decodeMarkdownLinkTarget(value) {
  const unescaped = String(value || "").replace(/\\([!"#$%&'()*+,./:;<=>?@[\\\]^_`{|}~-])/g, "$1");
  try {
    return decodeURIComponent(unescaped);
  } catch (_error) {
    return unescaped;
  }
}

function isRelativeLocalTarget(value) {
  return Boolean(value) &&
    !value.startsWith("#") &&
    !value.startsWith("//") &&
    !/^[A-Za-z][A-Za-z\d+.-]*:/.test(value) &&
    !path.isAbsolute(value);
}

function exportFilter(format) {
  const filters = {
    md: { name: "Markdown", extensions: ["md"] },
    html: { name: "HTML", extensions: ["html"] },
    pdf: { name: "PDF", extensions: ["pdf"] },
    png: { name: "PNG", extensions: ["png"] },
    jpg: { name: "JPEG", extensions: ["jpg", "jpeg"] },
    webp: { name: "WebP", extensions: ["webp"] },
    docx: { name: "Word", extensions: ["docx"] },
  };
  return filters[format] || { name: "File", extensions: ["*"] };
}

function ensureOutputExtension(filePath, extension) {
  return path.extname(filePath) ? filePath : `${filePath}.${extension}`;
}

async function renderHtmlToPdf(html, sourceMarkdown) {
  const win = await createExportWindow(html);
  try {
    const pdf = await win.webContents.printToPDF({
      printBackground: true,
      pageSize: "A4",
      preferCSSPageSize: true,
      margins: { marginType: "default" },
    });
    return embedMarkdownInPdf(pdf, sourceMarkdown);
  } finally {
    win.destroy();
  }
}

async function embedMarkdownInPdf(pdfBytes, markdown) {
  const pdf = await PDFDocument.load(pdfBytes);
  await pdf.attach(Buffer.from(markdown, "utf8"), EMBEDDED_MARKDOWN_FILE, {
    mimeType: "text/markdown",
    description: "Original Markdown source preserved by Markdown 编辑器",
    creationDate: new Date(),
    modificationDate: new Date(),
  });
  return Buffer.from(await pdf.save());
}

async function renderHtmlToImage(html, format) {
  const win = await createExportWindow(html);
  try {
    const size = await win.webContents.executeJavaScript(`
      ({
        width: Math.min(2200, Math.max(900, document.documentElement.scrollWidth, document.body.scrollWidth)),
        height: Math.min(12000, Math.max(900, document.documentElement.scrollHeight, document.body.scrollHeight))
      })
    `);
    win.setContentSize(size.width, size.height);
    const image = await win.webContents.capturePage();
    if (format === "jpg") {
      return image.toJPEG(92);
    }
    if (format === "webp") {
      const webpDataUrl = await win.webContents.executeJavaScript(`
        (() => {
          const source = ${JSON.stringify(image.toDataURL())};
          return new Promise((resolve, reject) => {
            const picture = new Image();
            picture.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = picture.naturalWidth;
              canvas.height = picture.naturalHeight;
              canvas.getContext("2d").drawImage(picture, 0, 0);
              const output = canvas.toDataURL("image/webp", 0.92);
              resolve(output);
            };
            picture.onerror = () => reject(new Error("WebP \u56fe\u50cf\u7f16\u7801\u5931\u8d25"));
            picture.src = source;
          });
        })()
      `);
      return Buffer.from(webpDataUrl.replace(/^data:image\/webp;base64,/, ""), "base64");
    }
    return image.toPNG();
  } finally {
    win.destroy();
  }
}

async function renderMarkdownToDocx(markdown) {
  const document = new Document({
    styles: {
      default: {
        document: {
          run: { font: "宋体", size: 24, sizeComplexScript: 24 },
          paragraph: { spacing: { after: 120, line: 360 } },
        },
      },
    },
    creator: "Markdown 编辑器",
    title: "Markdown 导出文档",
    numbering: {
      config: [{
        reference: "markdown-ordered",
        levels: [{
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: "left",
        }],
      }],
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
        },
      },
      children: markdownToDocxChildren(markdown),
    }],
  });
  const output = await Packer.toBuffer(document);
  return embedMarkdownInDocx(output, markdown);
}

async function embedMarkdownInDocx(docxBytes, markdown) {
  const archive = await JSZip.loadAsync(docxBytes);
  archive.file(EMBEDDED_MARKDOWN_FILE, markdown);

  const contentTypes = archive.file("[Content_Types].xml");
  if (contentTypes) {
    const xml = await contentTypes.async("string");
    if (!xml.includes(`PartName=\"/${EMBEDDED_MARKDOWN_FILE}\"`)) {
      archive.file(
        "[Content_Types].xml",
        xml.replace(
          "</Types>",
          `<Override PartName=\"/${EMBEDDED_MARKDOWN_FILE}\" ContentType=\"text/markdown\"/></Types>`,
        ),
      );
    }
  }
  return archive.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

function markdownToDocxChildren(markdown) {
  const lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
  const children = [];
  let paragraph = [];
  let codeLines = [];
  let codeLanguage = "";
  let inCode = null;

  const flushParagraph = () => {
    if (!paragraph.length) {
      return;
    }
    children.push(new Paragraph({ children: markdownInlineToRuns(paragraph.join(" ")) }));
    paragraph = [];
  };

  const flushCode = () => {
    if (!codeLines.length && !codeLanguage) {
      return;
    }
    children.push(new Paragraph({
      shading: { type: ShadingType.CLEAR, color: "auto", fill: "F2F4F7" },
      spacing: { before: 120, after: 120 },
      children: [new TextRun({ text: codeLines.join("\n"), font: "Consolas", size: 20 })],
    }));
    codeLines = [];
    codeLanguage = "";
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    if (inCode) {
      if (markdownSyntax.closesFence(line, inCode)) {
        flushCode();
        inCode = null;
      } else {
        codeLines.push(line);
      }
      continue;
    }
    const opening = markdownSyntax.openFence(line);
    if (opening) {
      flushParagraph();
      codeLanguage = opening.info;
      inCode = opening;
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      children.push(new Paragraph({
        heading: HeadingLevel[`HEADING_${heading[1].length}`],
        children: markdownInlineToRuns(heading[2]),
      }));
      continue;
    }

    if (isMarkdownTableStart(lines, index)) {
      flushParagraph();
      const rows = [];
      while (index < lines.length && /^\s*\|.*\|\s*$/.test(lines[index])) {
        if (index !== lines.length - 1 && isMarkdownTableDivider(lines[index])) {
          index += 1;
          continue;
        }
        rows.push(splitMarkdownTableRow(lines[index]));
        index += 1;
      }
      index -= 1;
      children.push(createDocxTable(rows));
      continue;
    }

    const list = trimmed.match(/^([-*+]|\d+\.)\s+(.*)$/);
    if (list) {
      flushParagraph();
      const isOrdered = /\d+\./.test(list[1]);
      children.push(new Paragraph({
        ...(isOrdered ? { numbering: { reference: "markdown-ordered", level: 0 } } : { bullet: { level: 0 } }),
        children: markdownInlineToRuns(list[2].replace(/^\[[ xX]\]\s+/, "")),
      }));
      continue;
    }

    if (trimmed.startsWith("> ")) {
      flushParagraph();
      children.push(new Paragraph({
        indent: { left: 480 },
        border: { left: { color: "22858C", space: 8, style: BorderStyle.SINGLE, size: 16 } },
        children: markdownInlineToRuns(trimmed.slice(2)),
      }));
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    paragraph.push(trimmed);
  }

  if (inCode) {
    flushCode();
  }
  flushParagraph();
  return children.length ? children : [new Paragraph("")];
}

function markdownInlineToRuns(value) {
  const text = String(value || "");
  const tokens = text.split(/(\*\*[^*]+\*\*|(?<!~)~~[^~]+~~(?!~)|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*)/g).filter((token) => token !== "");
  return tokens.map((token) => {
    if (/^\*\*[^*]+\*\*$/.test(token)) {
      return new TextRun({ text: token.slice(2, -2), bold: true });
    }
    if (/^~~[^~]+~~$/.test(token)) {
      return new TextRun({ text: token.slice(2, -2), strike: true });
    }
    if (/^`[^`]+`$/.test(token)) {
      return new TextRun({ text: token.slice(1, -1), font: "Consolas", shading: { type: ShadingType.CLEAR, color: "auto", fill: "F2F4F7" } });
    }
    if (/^\[[^\]]+\]\([^)]+\)$/.test(token)) {
      const match = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      return new TextRun({ text: match[1], color: "1469F2", underline: {} });
    }
    if (/^\*[^*]+\*$/.test(token)) {
      return new TextRun({ text: token.slice(1, -1), italics: true });
    }
    return new TextRun({ text: token });
  });
}

function isMarkdownTableStart(lines, index) {
  return /^\s*\|.*\|\s*$/.test(lines[index] || "") && isMarkdownTableDivider(lines[index + 1] || "");
}

function isMarkdownTableDivider(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function splitMarkdownTableRow(row) {
  return String(row || "").trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function createDocxTable(rows) {
  const border = { style: BorderStyle.SINGLE, size: 4, color: "DDE3EA" };
  return new Table({
    rows: rows.map((row, rowIndex) => new TableRow({
      children: row.map((cell) => new TableCell({
        shading: rowIndex === 0 ? { type: ShadingType.CLEAR, color: "auto", fill: "F1F5F7" } : undefined,
        borders: { top: border, bottom: border, left: border, right: border },
        children: [new Paragraph({ children: markdownInlineToRuns(cell) })],
      })),
    })),
  });
}

function createExportWindow(html) {
  return new Promise((resolve, reject) => {
    const win = new BrowserWindow({
      width: 1100,
      height: 1400,
      show: false,
      webPreferences: {
        offscreen: true,
        sandbox: false,
      },
    });

    win.webContents.once("did-finish-load", async () => {
      try {
        await win.webContents.executeJavaScript(`document.fonts.ready.then(() => Promise.all(Array.from(document.images, image => image.decode().catch(() => {}))))`);
        resolve(win);
      } catch (error) {
        win.destroy();
        reject(error);
      }
    });
    win.webContents.once("did-fail-load", (_event, _code, description) => reject(new Error(description)));
    win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  });
}
