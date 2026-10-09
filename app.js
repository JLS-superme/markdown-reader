const appShell = document.querySelector(".app-shell");
const workspace = document.querySelector(".workspace");
const editor = document.querySelector("#editor");
const editorHighlight = document.querySelector("#editorHighlight");
const editorPane = document.querySelector(".editor-pane");
const preview = document.querySelector("#preview");
const previewContent = document.querySelector("#previewContent");
const splitter = document.querySelector("#splitter");
const fileInput = document.querySelector("#fileInput");
const importButton = document.querySelector("#importButton");
const fileName = document.querySelector("#fileName");
const statusLabel = document.querySelector("#status");
const wordCount = document.querySelector("#wordCount");
const tocToggleButton = document.querySelector("#tocToggleButton");
const tocPanel = document.querySelector("#tocPanel");
const tocCloseButton = document.querySelector("#tocCloseButton");
const tocList = document.querySelector("#tocList");
const tocEmpty = document.querySelector("#tocEmpty");
const newButton = document.querySelector("#newButton");
const copyButton = document.querySelector("#copyButton");
const formatRepairButton = document.querySelector("#formatRepairButton");
const saveButton = document.querySelector("#saveButton");
const saveConfirmDialog = document.querySelector("#saveConfirmDialog");
const saveConfirmDescription = document.querySelector("#saveConfirmDescription");
const saveCancelButton = document.querySelector("#saveCancelButton");
const saveConfirmButton = document.querySelector("#saveConfirmButton");
const exportButton = document.querySelector("#exportButton");
const exportDialog = document.querySelector("#exportDialog");
const exportCloseButton = document.querySelector("#exportCloseButton");
const exportFormat = document.querySelector("#exportFormat");
const exportStartButton = document.querySelector("#exportStartButton");
const exportHint = document.querySelector("#exportHint");
const linkFileInput = document.querySelector("#linkFileInput");
const linkImageInput = document.querySelector("#linkImageInput");
const linkFolderInput = document.querySelector("#linkFolderInput");
const previewOnlyButton = document.querySelector("#previewOnlyButton");
const editOnlyButton = document.querySelector("#editOnlyButton");
const fullscreenButton = document.querySelector("#fullscreenButton");
const fullscreenIcon = document.querySelector("#fullscreenIcon");
const syncScrollToggle = document.querySelector("#syncScrollToggle");
const findReplaceButton = document.querySelector("#findReplaceButton");
const findReplacePanel = document.querySelector("#findReplacePanel");
const findInput = document.querySelector("#findInput");
const replaceInput = document.querySelector("#replaceInput");
const findMatchCount = document.querySelector("#findMatchCount");
const findPreviousButton = document.querySelector("#findPreviousButton");
const findNextButton = document.querySelector("#findNextButton");
const findCloseButton = document.querySelector("#findCloseButton");
const replaceButton = document.querySelector("#replaceButton");
const replaceAllButton = document.querySelector("#replaceAllButton");
const externalChangeDialog = document.querySelector("#externalChangeDialog");
const externalChangeFileName = document.querySelector("#externalChangeFileName");
const externalChangeCancelButton = document.querySelector("#externalChangeCancelButton");
const externalChangeSaveButton = document.querySelector("#externalChangeSaveButton");
const externalChangeReloadButton = document.querySelector("#externalChangeReloadButton");
const PREVIEW_HEADING_SELECTOR = "h1[data-source-line], h2[data-source-line], h3[data-source-line], h4[data-source-line], h5[data-source-line], h6[data-source-line]";

window.addEventListener("error", (event) => {
  appShell.dataset.enhanced = "false";
  setStatus(`\u811a\u672c\u9519\u8bef\uff1a${event.message}`);
});

window.addEventListener("unhandledrejection", (event) => {
  appShell.dataset.enhanced = "false";
  setStatus(`\u811a\u672c\u9519\u8bef\uff1a${event.reason?.message || event.reason}`);
});

const sampleMarkdown = [
  "# Markdown \u7f16\u8f91\u5668",
  "",
  "\u6b22\u8fce\u4f7f\u7528 Markdown \u7f16\u8f91\u5668\u3002\u8fd9\u91cc\u53ef\u4ee5\u7f16\u8f91\u3001\u9884\u89c8\u548c\u6574\u7406 Markdown \u6587\u6863\u3002",
  "",
  "## \u5f53\u524d\u7248\u672c\u529f\u80fd",
  "",
  "- \u62d6\u5165\u6216\u5bfc\u5165 Markdown\u3001TXT\u3001DOCX\u3001HTML \u548c PDF \u6587\u4ef6",
  "- \u5de6\u4fa7\u8bed\u6cd5\u9ad8\u4eae\u7f16\u8f91\uff0c\u53f3\u4fa7\u5b9e\u65f6\u9884\u89c8",
  "- \u62d6\u52a8\u5206\u9694\u7ebf\u8c03\u6574\u7f16\u8f91\u533a\u548c\u9884\u89c8\u533a\u5927\u5c0f",
  "- \u5f00\u542f\u6216\u5173\u95ed\u7f16\u8f91\u4e0e\u9884\u89c8\u7684\u540c\u6b65\u6eda\u52a8",
  "- \u5728\u9884\u89c8\u533a\u67e5\u770b\u6587\u6863\u76ee\u5f55\uff0c\u5e76\u5feb\u901f\u8df3\u8f6c\u5230\u5404\u7ea7\u6807\u9898",
  "- \u67e5\u627e\u3001\u66ff\u6362\u4ee5\u53ca\u5168\u90e8\u66ff\u6362\u6587\u672c",
  "- \u4e00\u952e\u81ea\u52a8\u4fee\u590d Markdown \u683c\u5f0f",
  "- \u63d2\u5165\u7f51\u9875\u94fe\u63a5\u3001\u672c\u5730\u6587\u4ef6\u3001\u6587\u4ef6\u5939\u548c\u56fe\u7247",
  "- \u5bfc\u51fa Markdown\u3001HTML\u3001PDF\u3001Word \u548c\u56fe\u7247",
  "",
  "## \u4e30\u5bcc\u5185\u5bb9\u9884\u89c8",
  "",
  "### \u4ee3\u7801\u9ad8\u4eae",
  "",
  "```js",
  "const message = \"Hello, Markdown!\";",
  "console.log(message);",
  "```",
  "",
  "### Mermaid \u56fe\u8868",
  "",
  "```mermaid",
  "graph LR",
  "  A[\u7f16\u8f91] --> B[\u9884\u89c8]",
  "  B --> C[\u5bfc\u51fa]",
  "```",
  "",
  "### \u6570\u5b66\u516c\u5f0f",
  "",
  "$$",
  "E = mc^2",
  "$$",
  "",
  "> \u63d0\u793a\uff1a\u5c06\u9f20\u6807\u60ac\u6d6e\u5728\u5de5\u5177\u680f\u56fe\u6807\u4e0a\uff0c\u53ef\u4ee5\u67e5\u770b\u5bf9\u5e94\u7684\u529f\u80fd\u540d\u79f0\u3002",
].join("\n");

let currentFileName = "\u672a\u547d\u540d.md";
let currentFilePath = "";
let savedContent = sampleMarkdown;
let documentDirty = false;
let saveBusy = false;
let dragDepth = 0;
let isResizing = false;
let scrollSyncEnabled = true;
let syncingScroll = false;
let scrollSyncFrame = null;
let scrollSyncSource = null;
let scrollSyncTarget = null;
let scrollSyncReleaseTimer = null;
let activeScrollSource = null;
let activeScrollSourceTimer = null;
let searchMatches = [];
let activeSearchIndex = -1;
let externalChangeBusy = false;
let documentWatchEnabled = true;
let previewZoom = 1;
let mermaidRenderSequence = 0;
let mermaidRenderGeneration = 0;
let mermaidRenderPromise = Promise.resolve();
const localAssetUrls = new Set();
const localAssetMeta = new Map();
const desktopApi = window.markdownDesktop || null;

desktopApi?.onImportStatus?.((message) => setStatus(message));
desktopApi?.onOpenFile?.((file) => {
  if (file) {
    loadDesktopFile(file);
  }
});
desktopApi?.onExternalFileChanged?.((change) => {
  if (!change?.path || !sameLocalPath(change.path, currentFilePath)) {
    return;
  }
  externalChangeFileName.textContent = change.name || currentFileName;
  if (!externalChangeBusy) {
    externalChangeDialog.hidden = false;
  }
});

editor.value = sampleMarkdown;
restoreSplitterSize();
initializeMermaid();
render();
restorePreviewZoom();
appShell.dataset.enhanced = "true";

editor.addEventListener("input", () => render());
editor.addEventListener("scroll", () => {
  syncEditorScroll();
  syncPaneScroll(editor, preview);
});
preview.addEventListener("scroll", () => {
  syncPaneScroll(preview, editor);
  updateActiveTocItem();
});
preview.addEventListener("wheel", (event) => {
  if (!isZoomModifier(event)) {
    return;
  }

  event.preventDefault();
  setPreviewZoom(previewZoom + (event.deltaY < 0 ? 0.1 : -0.1), event);
}, { passive: false });
["wheel", "pointerdown", "touchstart"].forEach((eventName) => {
  editor.addEventListener(eventName, () => markActiveScrollSource(editor), { passive: true });
  preview.addEventListener(eventName, () => markActiveScrollSource(preview), { passive: true });
});
editor.addEventListener("keydown", () => markActiveScrollSource(editor));

syncScrollToggle.addEventListener("change", () => {
  scrollSyncEnabled = syncScrollToggle.checked;
  cancelPendingScrollSync();
  setStatus(scrollSyncEnabled ? "\u5df2\u5f00\u542f\u540c\u6b65\u6eda\u52a8" : "\u5df2\u5173\u95ed\u540c\u6b65\u6eda\u52a8");
});

tocToggleButton.addEventListener("click", () => {
  if (tocPanel.hidden) {
    openTableOfContents();
  } else {
    closeTableOfContents();
  }
});
tocCloseButton.addEventListener("click", () => closeTableOfContents());
tocList.addEventListener("click", (event) => {
  const item = event.target.closest(".toc-item");
  if (!item) {
    return;
  }
  navigateToTocLine(Number(item.dataset.sourceLine));
});
document.addEventListener("pointerdown", (event) => {
  if (!tocPanel.hidden && !tocPanel.contains(event.target) && !tocToggleButton.contains(event.target)) {
    closeTableOfContents();
  }
});

importButton.addEventListener("click", async (event) => {
  if (!desktopApi) {
    return;
  }

  event.preventDefault();
  try {
    const file = await desktopApi.pickImportFile();
    if (file) {
      loadDesktopFile(file);
    }
  } catch (error) {
    setStatus(`\u5bfc\u5165\u5931\u8d25\uff1a${error.message}`);
  }
});

fileInput.addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (file) {
    await loadFile(file);
  }
  fileInput.value = "";
});

newButton.addEventListener("click", () => {
  closeExternalChangeDialog();
  currentFileName = "\u672a\u547d\u540d.md";
  currentFilePath = "";
  updateCurrentDocumentWatch("");
  fileName.textContent = currentFileName;
  editor.value = "";
  savedContent = "";
  render("\u5df2\u65b0\u5efa\u7a7a\u767d\u6587\u6863");
  editor.focus();
});

externalChangeCancelButton.addEventListener("click", () => {
  closeExternalChangeDialog();
  setStatus("\u5df2\u4fdd\u7559\u5f53\u524d\u7f16\u8f91\u5185\u5bb9");
});
externalChangeSaveButton.addEventListener("click", () => saveConflictCopyAndReload());
externalChangeReloadButton.addEventListener("click", () => reloadChangedDocument());

copyButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(editor.value);
  setStatus("\u5df2\u590d\u5236 Markdown");
});

formatRepairButton.addEventListener("click", () => repairMarkdownFormatting());
saveButton.addEventListener("click", () => openSaveConfirmDialog());
saveCancelButton.addEventListener("click", () => closeSaveConfirmDialog());
saveConfirmButton.addEventListener("click", () => saveCurrentDocument());
saveConfirmDialog.addEventListener("click", (event) => {
  if (event.target === saveConfirmDialog && !saveBusy) {
    closeSaveConfirmDialog();
  }
});
exportButton.addEventListener("click", () => openExportDialog());
exportCloseButton.addEventListener("click", () => closeExportDialog());
exportFormat.addEventListener("change", () => updateExportHint());
exportDialog.addEventListener("click", (event) => {
  if (event.target === exportDialog) {
    closeExportDialog();
  }
});
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    openSaveConfirmDialog();
    return;
  }

  if ((event.ctrlKey || event.metaKey) && isPreviewZoomContext()) {
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      setPreviewZoom(previewZoom + 0.1);
      return;
    }
    if (event.key === "-") {
      event.preventDefault();
      setPreviewZoom(previewZoom - 0.1);
      return;
    }
    if (event.key === "0") {
      event.preventDefault();
      setPreviewZoom(1);
      return;
    }
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
    event.preventDefault();
    openFindReplacePanel(false);
    return;
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "h") {
    event.preventDefault();
    openFindReplacePanel(true);
    return;
  }

  if (event.key === "Escape" && !saveConfirmDialog.hidden && !saveBusy) {
    closeSaveConfirmDialog();
  } else if (event.key === "Escape" && !externalChangeDialog.hidden) {
    closeExternalChangeDialog();
  } else if (event.key === "Escape" && !exportDialog.hidden) {
    closeExportDialog();
  } else if (event.key === "Escape" && !tocPanel.hidden) {
    closeTableOfContents();
  } else if (event.key === "Escape" && !findReplacePanel.hidden) {
    closeFindReplacePanel();
  }
});
exportStartButton.addEventListener("click", () => exportCurrentDocument());

findReplaceButton.addEventListener("click", () => openFindReplacePanel(false));
findCloseButton.addEventListener("click", () => closeFindReplacePanel());
findInput.addEventListener("input", () => {
  refreshSearchMatches(editor.selectionStart);
  revealActiveSearchMatch();
});
findInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    moveSearchMatch(event.shiftKey ? -1 : 1);
  } else if (event.key === "Escape") {
    event.preventDefault();
    closeFindReplacePanel();
  }
});
replaceInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    replaceCurrentMatch();
  } else if (event.key === "Escape") {
    event.preventDefault();
    closeFindReplacePanel();
  }
});
findPreviousButton.addEventListener("click", () => moveSearchMatch(-1));
findNextButton.addEventListener("click", () => moveSearchMatch(1));
replaceButton.addEventListener("click", () => replaceCurrentMatch());
replaceAllButton.addEventListener("click", () => replaceAllMatches());

previewOnlyButton.addEventListener("click", () => {
  setViewMode(appShell.dataset.viewMode === "preview" ? "" : "preview");
});

editOnlyButton.addEventListener("click", () => {
  setViewMode(appShell.dataset.viewMode === "edit" ? "" : "edit");
});

fullscreenButton.addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await appShell.requestFullscreen();
    }
  } catch (error) {
    setStatus(`\u5168\u5c4f\u5207\u6362\u5931\u8d25\uff1a${error.message}`);
  }
});

document.addEventListener("fullscreenchange", updateFullscreenButton);

document.querySelectorAll(".toolbar button").forEach((button) => {
  button.addEventListener("click", () => {
    const wrap = button.dataset.wrap;
    const wrapEnd = button.dataset.wrapEnd || wrap;
    const prefix = button.dataset.prefix;
    const insert = button.dataset.insert;
    const block = button.dataset.block;
    const pick = button.dataset.pick;

    if (!wrap && !prefix && !insert && !block && !pick) {
      return;
    }

    if (pick === "file") {
      if (desktopApi) {
        pickDesktopFile();
        return;
      }
      linkFileInput.click();
      return;
    }
    if (pick === "folder") {
      if (desktopApi) {
        pickDesktopFolder();
        return;
      }
      linkFolderInput.click();
      return;
    }
    if (pick === "image") {
      if (desktopApi) {
        pickDesktopImage();
        return;
      }
      linkImageInput.click();
      return;
    }

    if (wrap) {
      wrapSelection(wrap, wrapEnd);
    } else if (prefix) {
      prefixSelection(prefix);
    } else if (insert) {
      insertAtCursor(insert);
    } else if (block === "code") {
      wrapSelection("```\n", "\n```");
    } else if (block === "table") {
      insertAtCursor("\n| \u5217\u4e00 | \u5217\u4e8c |\n| --- | --- |\n| \u5185\u5bb9 | \u5185\u5bb9 |\n");
    }

    render("\u5df2\u63d2\u5165\u683c\u5f0f");
    button.closest(".toolbar-menu")?.removeAttribute("open");
    editor.focus();
  });
});

linkFileInput.addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (file) {
    insertPickedFile(file, false);
  }
  linkFileInput.value = "";
});

linkImageInput.addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (file) {
    insertPickedFile(file, true);
  }
  linkImageInput.value = "";
});

linkFolderInput.addEventListener("change", (event) => {
  const files = Array.from(event.target.files || []);
  if (files.length) {
    insertPickedFolder(files);
  }
  linkFolderInput.value = "";
});

preview.addEventListener("click", async (event) => {
  const copyButton = event.target.closest(".code-copy");
  const collapseButton = event.target.closest(".code-collapse");
  const localAsset = event.target.closest("a[data-local-asset], img[data-local-asset], a[data-open-folder]");

  if (localAsset) {
    event.preventDefault();
    if (!event.ctrlKey && !event.metaKey) {
      setStatus("\u6309\u4f4f Ctrl \u5e76\u5de6\u952e\u5355\u51fb\u53ef\u6253\u5f00\u672c\u5730\u94fe\u63a5");
      return;
    }

    const folderTarget = localAsset.dataset.openFolder;
    if (folderTarget) {
      await openLocalTarget({ fileUrl: folderTarget, kind: "folder" });
      return;
    }

    const url = localAsset.dataset.localAsset || localAsset.getAttribute("href") || localAsset.getAttribute("src");
    const kind = localAsset.dataset.localKind || localAssetMeta.get(url)?.kind;
    const path = localAsset.dataset.localPath || localAssetMeta.get(url)?.path || "";
    if (desktopApi && (path || /^file:/i.test(url))) {
      await openLocalTarget({ path, fileUrl: url, kind });
    } else if (desktopApi && isRelativeLocalLink(url)) {
      await openLocalTarget({ href: url, basePath: currentFilePath, kind });
    } else if (kind === "image") {
      window.open(url, "_blank", "noopener");
      setStatus("\u5df2\u6253\u5f00\u672c\u5730\u4e34\u65f6\u56fe\u7247");
    } else {
      setStatus("\u6d4f\u89c8\u5668\u9009\u62e9\u5668\u6ca1\u6709\u63d0\u4f9b\u771f\u5b9e\u8def\u5f84\uff0c\u65e0\u6cd5\u8df3\u8f6c\u5230\u8d44\u6e90\u7ba1\u7406\u5668");
    }
    return;
  }

  if (copyButton) {
    const code = copyButton.closest(".code-card")?.querySelector("code")?.innerText || "";
    await navigator.clipboard.writeText(code);
    copyButton.textContent = "\u5df2\u590d\u5236";
    setTimeout(() => {
      copyButton.textContent = "\u590d\u5236\u4ee3\u7801";
    }, 1200);
    return;
  }

  if (collapseButton) {
    const card = collapseButton.closest(".code-card");
    const collapsed = card.classList.toggle("is-collapsed");
    collapseButton.textContent = collapsed ? "\u5c55\u5f00" : "\u6536\u8d77";
  }
});

window.addEventListener("dragenter", (event) => {
  event.preventDefault();
  dragDepth += 1;
  appShell.dataset.dragging = "true";
});

window.addEventListener("dragover", (event) => {
  event.preventDefault();
});

window.addEventListener("dragleave", (event) => {
  event.preventDefault();
  dragDepth = Math.max(0, dragDepth - 1);
  if (dragDepth === 0) {
    appShell.dataset.dragging = "false";
  }
});

window.addEventListener("drop", async (event) => {
  event.preventDefault();
  dragDepth = 0;
  appShell.dataset.dragging = "false";

  const [file] = event.dataTransfer.files;
  if (file) {
    if (desktopApi?.importDroppedFile) {
      try {
        const imported = await desktopApi.importDroppedFile(file);
        if (imported) {
          loadDesktopFile(imported);
        }
      } catch (error) {
        setStatus(`\u5bfc\u5165\u5931\u8d25\uff1a${error.message}`);
      }
    } else {
      await loadFile(file);
    }
  }
});

splitter.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  isResizing = true;
  splitter.setPointerCapture(event.pointerId);
  appShell.dataset.resizing = "true";
  document.body.classList.add("is-resizing");
});

splitter.addEventListener("pointermove", (event) => {
  if (!isResizing) {
    return;
  }

  const rect = workspace.getBoundingClientRect();
  const isNarrow = window.matchMedia("(max-width: 860px)").matches;
  const rawSize = isNarrow ? event.clientY - rect.top : event.clientX - rect.left;
  const total = isNarrow ? rect.height : rect.width;
  const min = isNarrow ? 220 : 260;
  const max = Math.max(min, total - min - 8);
  const size = Math.min(Math.max(rawSize, min), max);
  const percent = (size / total) * 100;

  setSplitterSize(percent);
});

splitter.addEventListener("pointerup", finishResize);
splitter.addEventListener("pointercancel", finishResize);

window.addEventListener("resize", () => {
  restoreSplitterSize();
});

async function loadFile(file) {
  const extension = getFileExtension(file.name);
  if (!["md", "markdown", "txt", "html", "htm", "docx", "pdf"].includes(extension)) {
    setStatus("\u8bf7\u9009\u62e9 Markdown\u3001TXT\u3001DOCX\u3001HTML \u6216 PDF \u6587\u4ef6");
    return;
  }

  if (["docx", "pdf"].includes(extension)) {
    setStatus("DOCX \u548c PDF \u8f6c\u6362\u9700\u8981\u4f7f\u7528 Electron \u684c\u9762\u7248");
    return;
  }

  if (["html", "htm"].includes(extension)) {
    const shouldConvert = window.confirm(
      `${file.name} \u4e0d\u662f Markdown \u6587\u4ef6\u3002\n\n\u662f\u5426\u8f6c\u6362\u4e3a Markdown \u5e76\u5bfc\u5165\uff1f\u539f\u6587\u4ef6\u4e0d\u4f1a\u88ab\u4fee\u6539\u3002`
    );
    if (!shouldConvert) {
      setStatus("\u5df2\u53d6\u6d88\u5bfc\u5165");
      return;
    }

    const html = await file.text();
    const markdown = convertHtmlToMarkdown(html);
    loadConvertedContent(toMarkdownFileName(file.name), markdown, `\u5df2\u5c06 ${file.name} \u8f6c\u6362\u4e3a Markdown \u5e76\u5bfc\u5165`);
    return;
  }

  loadConvertedContent(file.name, await file.text(), `\u5df2\u5bfc\u5165 ${file.name}`);
}

function loadDesktopFile(file) {
  if (file.ok === false) {
    setStatus(file.message || "\u5bfc\u5165\u5931\u8d25");
    return;
  }

  closeExternalChangeDialog();
  currentFileName = file.name;
  currentFilePath = file.path || "";
  documentWatchEnabled = file.watch !== false;
  updateCurrentDocumentWatch(currentFilePath);
  fileName.textContent = currentFileName;
  editor.value = String(file.content || "");
  savedContent = editor.value;
  render(file.message || `\u5df2\u5bfc\u5165 ${file.name}`);
  editor.scrollTop = 0;
  preview.scrollTop = 0;
}

function loadConvertedContent(name, content, message) {
  closeExternalChangeDialog();
  currentFileName = name;
  currentFilePath = "";
  updateCurrentDocumentWatch("");
  fileName.textContent = currentFileName;
  editor.value = String(content || "");
  savedContent = editor.value;
  render(message);
  editor.scrollTop = 0;
  preview.scrollTop = 0;
}

function sameLocalPath(left, right) {
  if (!left || !right) {
    return false;
  }
  return String(left).replace(/\\/g, "/").toLowerCase() === String(right).replace(/\\/g, "/").toLowerCase();
}

function updateCurrentDocumentWatch(filePath) {
  if (!documentWatchEnabled) {
    return;
  }

  const watcherRequest = desktopApi?.setCurrentDocument?.(filePath);
  if (!watcherRequest || typeof watcherRequest.then !== "function") {
    return;
  }

  watcherRequest.then((result) => {
    if (result?.ok === false) {
      setStatus(result.message || "\u65e0\u6cd5\u76d1\u6d4b\u5f53\u524d Markdown \u6587\u4ef6");
    }
  }).catch((error) => setStatus(`\u65e0\u6cd5\u76d1\u6d4b\u5f53\u524d Markdown \u6587\u4ef6\uff1a${error.message}`));
}

function closeExternalChangeDialog() {
  externalChangeDialog.hidden = true;
  setExternalChangeBusy(false);
}

function setExternalChangeBusy(isBusy) {
  externalChangeBusy = isBusy;
  externalChangeCancelButton.disabled = isBusy;
  externalChangeSaveButton.disabled = isBusy;
  externalChangeReloadButton.disabled = isBusy;
}

async function reloadChangedDocument() {
  if (!currentFilePath || !desktopApi?.reloadCurrentDocument) {
    closeExternalChangeDialog();
    return;
  }

  setExternalChangeBusy(true);
  try {
    const file = await desktopApi.reloadCurrentDocument(currentFilePath);
    if (file?.ok !== false && file) {
      closeExternalChangeDialog();
      loadDesktopFile(file);
      setStatus(`\u5df2\u76f4\u63a5\u91cd\u65b0\u52a0\u8f7d ${file.name}`);
    } else {
      setStatus(file?.message || "\u91cd\u65b0\u52a0\u8f7d\u5931\u8d25");
      setExternalChangeBusy(false);
    }
  } catch (error) {
    setStatus(`\u91cd\u65b0\u52a0\u8f7d\u5931\u8d25\uff1a${error.message}`);
    setExternalChangeBusy(false);
  }
}

async function saveConflictCopyAndReload() {
  if (!currentFilePath || !desktopApi?.saveExportFile) {
    closeExternalChangeDialog();
    return;
  }

  setExternalChangeBusy(true);
  try {
    const backupName = `${stripExtension(currentFileName)}-\u672c\u5730\u4fee\u6539.md`;
    const result = await desktopApi.saveExportFile({
      format: "md",
      name: backupName,
      content: editor.value,
      disallowPath: currentFilePath,
    });
    if (!result?.ok) {
      setStatus(result?.message || "\u53e6\u5b58\u4e3a\u5df2\u53d6\u6d88");
      setExternalChangeBusy(false);
      return;
    }

    await reloadChangedDocument();
  } catch (error) {
    setStatus(`\u53e6\u5b58\u5931\u8d25\uff1a${error.message}`);
    setExternalChangeBusy(false);
  }
}

function getFileExtension(name) {
  const match = String(name || "").toLowerCase().match(/\.([^.]+)$/);
  return match ? match[1] : "";
}

function toMarkdownFileName(name) {
  return String(name || "document").replace(/\.[^.]+$/, "") + ".md";
}

function convertHtmlToMarkdown(html) {
  const documentNode = new DOMParser().parseFromString(String(html || ""), "text/html");
  documentNode.querySelectorAll("script, style, noscript, template").forEach((node) => node.remove());
  const root = documentNode.body || documentNode.documentElement;
  return renderHtmlChildren(root)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function renderHtmlChildren(element) {
  return Array.from(element.childNodes, (node) => renderHtmlNode(node)).join("");
}

function renderHtmlNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return String(node.nodeValue || "").replace(/\s+/g, " ");
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const element = node;
  const tag = element.tagName.toLowerCase();
  const content = () => renderHtmlChildren(element);
  if (/^h[1-6]$/.test(tag)) {
    return `\n\n${"#".repeat(Number(tag[1]))} ${content().trim()}\n\n`;
  }
  if (["p", "div", "section", "article", "main", "header", "footer", "aside", "nav"].includes(tag)) {
    return `\n\n${content().trim()}\n\n`;
  }
  if (tag === "br") {
    return "  \n";
  }
  if (["strong", "b"].includes(tag)) {
    return `**${content().trim()}**`;
  }
  if (["em", "i"].includes(tag)) {
    return `*${content().trim()}*`;
  }
  if (["del", "s", "strike"].includes(tag)) {
    return `~~${content().trim()}~~`;
  }
  if (tag === "u") {
    return `<u>${content().trim()}</u>`;
  }
  if (tag === "sup") {
    return `^${content().trim()}^`;
  }
  if (tag === "sub") {
    return `~${content().trim()}~`;
  }
  if (tag === "code" && element.parentElement?.tagName.toLowerCase() !== "pre") {
    return `\`${element.textContent || ""}\``;
  }
  if (tag === "pre") {
    const codeElement = element.querySelector("code");
    const languageMatch = codeElement?.className.match(/(?:language-|lang-)([\w+-]+)/i);
    return `\n\n\`\`\`${languageMatch ? languageMatch[1] : ""}\n${codeElement?.textContent || element.textContent || ""}\n\`\`\`\n\n`;
  }
  if (tag === "a") {
    const label = content().trim() || element.getAttribute("href") || "\u94fe\u63a5";
    const href = element.getAttribute("href") || "";
    return href ? `[${label}](${href})` : label;
  }
  if (tag === "img") {
    const alt = element.getAttribute("alt") || "\u56fe\u7247";
    const src = element.getAttribute("src") || "";
    return src ? `![${alt}](${src})` : "";
  }
  if (tag === "blockquote") {
    const quote = content().trim().replace(/^/gm, "> ");
    return `\n\n${quote}\n\n`;
  }
  if (tag === "ul" || tag === "ol") {
    return renderHtmlList(element, tag === "ol");
  }
  if (tag === "table") {
    return renderHtmlTable(element);
  }
  if (tag === "hr") {
    return "\n\n---\n\n";
  }
  if (tag === "input" && element.getAttribute("type") === "checkbox") {
    return element.checked ? "[x] " : "[ ] ";
  }

  return content();
}

function renderHtmlList(list, ordered) {
  const items = Array.from(list.children).filter((child) => child.tagName.toLowerCase() === "li");
  const lines = items.map((item, index) => {
    const marker = ordered ? `${index + 1}. ` : "- ";
    const mainContent = Array.from(item.childNodes)
      .filter((child) => !(child.nodeType === Node.ELEMENT_NODE && ["ul", "ol"].includes(child.tagName.toLowerCase())))
      .map((child) => renderHtmlNode(child))
      .join("")
      .trim();
    const nested = Array.from(item.children)
      .filter((child) => ["ul", "ol"].includes(child.tagName.toLowerCase()))
      .map((child) => renderHtmlNode(child).trim().replace(/^/gm, "  "))
      .join("\n");
    return `${marker}${mainContent}${nested ? `\n${nested}` : ""}`;
  });
  return `\n\n${lines.join("\n")}\n\n`;
}

function renderHtmlTable(table) {
  const rows = Array.from(table.rows || []);
  if (!rows.length) {
    return "";
  }

  const values = rows.map((row) =>
    Array.from(row.cells || [], (cell) => renderHtmlChildren(cell).trim().replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " "))
  );
  const columnCount = Math.max(...values.map((row) => row.length));
  const normalizeRow = (row) => `| ${Array.from({ length: columnCount }, (_, index) => row[index] || "").join(" | ")} |`;
  const header = normalizeRow(values[0]);
  const separator = `| ${Array.from({ length: columnCount }, () => "---").join(" | ")} |`;
  return `\n\n${[header, separator, ...values.slice(1).map(normalizeRow)].join("\n")}\n\n`;
}

async function pickDesktopFile() {
  const file = await desktopApi.pickLinkFile();
  if (file) {
    insertDesktopLink(file, false);
  }
}

async function pickDesktopImage() {
  const file = await desktopApi.pickLinkImage();
  if (file) {
    insertDesktopLink(file, true);
  }
}

async function pickDesktopFolder() {
  const folder = await desktopApi.pickLinkFolder();
  if (folder) {
    insertDesktopLink(folder, false);
  }
}

function insertDesktopLink(target, forceImage) {
  const label = sanitizeMarkdownLabel(target.kind === "folder" ? `${target.name}/` : target.name);
  const isImage = forceImage || target.kind === "image";
  const markdown = isImage ? `![${label}](${target.fileUrl})` : `[${label}](${target.fileUrl})`;

  localAssetMeta.set(target.fileUrl, { kind: target.kind || (isImage ? "image" : "file"), name: target.name, path: target.path });
  insertAtCursor(markdown);
  render(target.kind === "folder" ? `\u5df2\u63d2\u5165\u6587\u4ef6\u5939 ${target.name}` : `\u5df2\u63d2\u5165\u672c\u5730\u94fe\u63a5 ${target.name}`);
  editor.focus();
}

async function openLocalTarget(target) {
  if (!desktopApi) {
    return;
  }

  try {
    const result = await desktopApi.openLocalTarget(target);
    setStatus(result?.message || "\u5df2\u5c1d\u8bd5\u6253\u5f00\u672c\u5730\u8def\u5f84");
  } catch (error) {
    setStatus(`\u6253\u5f00\u672c\u5730\u94fe\u63a5\u5931\u8d25\uff1a${error.message}`);
  }
}

function openSaveConfirmDialog() {
  if (saveBusy) {
    return;
  }

  const savesInPlace = isMarkdownFilePath(currentFilePath);
  saveConfirmDescription.textContent = savesInPlace
    ? `\u662f\u5426\u5c06\u5f53\u524d\u5185\u5bb9\u4fdd\u5b58\u5230 ${currentFileName}\uff1f`
    : "\u70b9\u51fb\u201c\u4fdd\u5b58\u201d\u540e\uff0c\u8bf7\u5728\u7cfb\u7edf\u7a97\u53e3\u4e2d\u9009\u62e9 Markdown \u6587\u4ef6\u7684\u4fdd\u5b58\u4f4d\u7f6e\u3002";
  saveConfirmDialog.hidden = false;
  saveConfirmButton.focus();
}

function closeSaveConfirmDialog() {
  if (!saveBusy) {
    saveConfirmDialog.hidden = true;
  }
}

function setSaveBusy(isBusy) {
  saveBusy = isBusy;
  saveButton.disabled = isBusy;
  saveCancelButton.disabled = isBusy;
  saveConfirmButton.disabled = isBusy;
}

async function saveCurrentDocument() {
  if (saveBusy) {
    return;
  }

  setSaveBusy(true);
  setStatus("\u6b63\u5728\u4fdd\u5b58...");
  try {
    if (desktopApi?.saveMarkdownDocument) {
      const result = await desktopApi.saveMarkdownDocument(buildEditorState());
      if (!result?.ok) {
        setStatus(result?.message || "\u5df2\u53d6\u6d88\u4fdd\u5b58");
        return;
      }

      currentFilePath = result.path || currentFilePath;
      currentFileName = result.name || currentFileName;
      documentWatchEnabled = true;
      savedContent = editor.value;
      updateCurrentDocumentWatch(currentFilePath);
      updateDocumentState();
      saveConfirmDialog.hidden = true;
      setStatus(result.message || `\u5df2\u4fdd\u5b58 ${currentFileName}`);
      return;
    }

    const name = ensureExtension(currentFileName, ".md");
    downloadFile(name, editor.value, "text/markdown;charset=utf-8");
    currentFileName = name;
    savedContent = editor.value;
    updateDocumentState();
    saveConfirmDialog.hidden = true;
    setStatus(`\u5df2\u4fdd\u5b58 ${name}`);
  } catch (error) {
    setStatus(`\u4fdd\u5b58\u5931\u8d25\uff1a${error.message}`);
  } finally {
    setSaveBusy(false);
  }
}

function isMarkdownFilePath(filePath) {
  return /\.(md|markdown)$/i.test(String(filePath || ""));
}

function buildEditorState() {
  return {
    dirty: documentDirty,
    content: editor.value,
    currentPath: currentFilePath,
    name: currentFileName,
  };
}

function updateDocumentState() {
  documentDirty = editor.value !== savedContent;
  fileName.textContent = `${currentFileName}${documentDirty ? " *" : ""}`;
  desktopApi?.updateEditorState?.(buildEditorState());
}

function openExportDialog() {
  updateExportHint();
  exportDialog.hidden = false;
  exportFormat.focus();
}

function closeExportDialog() {
  exportDialog.hidden = true;
}

function updateExportHint() {
  const format = exportFormat.value;
  if (!desktopApi && format !== "md" && format !== "html") {
    exportHint.textContent = "\u8be5\u683c\u5f0f\u9700\u8981\u5728 Electron \u684c\u9762\u7248\u4e2d\u5bfc\u51fa";
  } else {
    exportHint.textContent = desktopApi ? "\u5c06\u5728\u4e0b\u4e00\u6b65\u9009\u62e9\u4fdd\u5b58\u4f4d\u7f6e" : "\u6d4f\u89c8\u5668\u6a21\u5f0f\u5c06\u4f7f\u7528\u9ed8\u8ba4\u4e0b\u8f7d\u4f4d\u7f6e";
  }
}

async function exportCurrentDocument() {
  const format = exportFormat.value;
  const name = `${stripExtension(currentFileName)}.${getExportExtension(format)}`;

  exportStartButton.disabled = true;
  exportHint.textContent = "\u6b63\u5728\u5bfc\u51fa...";

  try {
    await mermaidRenderPromise;
    const payload = buildExportPayload(format);
    if (desktopApi) {
      const result = await desktopApi.saveExportFile({ format, name, ...payload });
      if (result?.ok) {
        closeExportDialog();
      }
      setStatus(result?.message || "\u5df2\u5bfc\u51fa\u6587\u4ef6");
      exportHint.textContent = result?.message || "";
    } else if (format === "md" || format === "html") {
      downloadFile(name, payload.content, payload.mime);
      closeExportDialog();
      setStatus(`\u5df2\u5bfc\u51fa ${name}`);
    } else {
      exportHint.textContent = "\u8be5\u683c\u5f0f\u9700\u8981\u5728 Electron \u684c\u9762\u7248\u4e2d\u5bfc\u51fa";
    }
  } catch (error) {
    exportHint.textContent = error.message;
    setStatus(`\u5bfc\u51fa\u5931\u8d25\uff1a${error.message}`);
  } finally {
    exportStartButton.disabled = false;
  }
}

function buildExportPayload(format) {
  const html = buildPreviewDocument(previewContent.innerHTML, editor.value);
  if (format === "md") {
    return { content: editor.value, mime: "text/markdown;charset=utf-8" };
  }
  if (format === "html") {
    return { content: html, mime: "text/html;charset=utf-8" };
  }
  return {
    content: html,
    sourceMarkdown: editor.value,
    mime: getExportMime(format),
  };
}

function getExportExtension(format) {
  return format === "jpg" ? "jpg" : format;
}

function getExportMime(format) {
  const types = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    webp: "image/webp",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  return types[format] || "application/octet-stream";
}

function setViewMode(mode) {
  if (mode === "edit") {
    closeTableOfContents();
  }
  appShell.dataset.viewMode = mode;
  previewOnlyButton.classList.toggle("is-active", mode === "preview");
  editOnlyButton.classList.toggle("is-active", mode === "edit");
  restoreSplitterSize();
  setStatus(
    mode === "preview"
      ? "\u5df2\u5207\u6362\u5230\u4ec5\u9884\u89c8"
      : mode === "edit"
        ? "\u5df2\u5207\u6362\u5230\u4ec5\u7f16\u8f91"
        : "\u5df2\u6062\u590d\u53cc\u680f\u89c6\u56fe"
  );
}

function updateFullscreenButton() {
  const isFullscreen = Boolean(document.fullscreenElement);
  fullscreenButton.classList.toggle("is-active", isFullscreen);
  fullscreenButton.title = isFullscreen ? "\u9000\u51fa\u5168\u5c4f" : "\u5168\u5c4f";
  fullscreenIcon.src = isFullscreen ? "./image/exit-fullscreen.svg" : "./image/fullscreen.svg";
}

function insertPickedFile(file, forceImage) {
  const isImage = forceImage || file.type.startsWith("image/");
  const url = createLocalAssetUrl(file, isImage ? "image" : "file");
  const label = sanitizeMarkdownLabel(file.name);
  const markdown = isImage ? `![${label}](${url})` : `[${label}](${url})`;

  insertAtCursor(markdown);
  render(isImage ? `\u5df2\u63d2\u5165\u56fe\u7247 ${file.name}` : `\u5df2\u63d2\u5165\u6587\u4ef6\u94fe\u63a5 ${file.name}`);
  editor.focus();
}

function insertPickedFolder(files) {
  const firstPath = files[0].webkitRelativePath || files[0].name;
  const folderName = sanitizeMarkdownLabel(firstPath.split("/")[0] || "\u672c\u5730\u6587\u4ef6\u5939");
  const url = `local-folder:${encodeURIComponent(folderName)}`;

  insertAtCursor(`[${folderName}/](${url})`);
  render(`\u5df2\u63d2\u5165\u6587\u4ef6\u5939 ${folderName}`);
  editor.focus();
}

function createLocalAssetUrl(file, kind = "file") {
  const url = URL.createObjectURL(file);
  localAssetUrls.add(url);
  localAssetMeta.set(url, { kind, name: file.name });
  return url;
}

function sanitizeMarkdownLabel(value) {
  return String(value || "")
    .replace(/\\/g, "/")
    .replace(/]/g, "\\]")
    .trim();
}

function openFindReplacePanel(focusReplace) {
  if (appShell.dataset.viewMode === "preview") {
    setViewMode("edit");
  }

  const selectedText = editor.value.slice(editor.selectionStart, editor.selectionEnd);
  if (selectedText && !selectedText.includes("\n")) {
    findInput.value = selectedText;
  }

  findReplacePanel.hidden = false;
  editorPane.classList.add("is-find-open");
  findReplaceButton.classList.add("is-active");
  findReplaceButton.setAttribute("aria-expanded", "true");
  refreshSearchMatches(editor.selectionStart);
  revealActiveSearchMatch();

  const target = focusReplace ? replaceInput : findInput;
  target.focus();
  target.select();
}

function closeFindReplacePanel() {
  findReplacePanel.hidden = true;
  editorPane.classList.remove("is-find-open");
  findReplaceButton.classList.remove("is-active");
  findReplaceButton.setAttribute("aria-expanded", "false");
  searchMatches = [];
  activeSearchIndex = -1;
  updateSearchControls();
  editorHighlight.innerHTML = highlightMarkdown(editor.value);
  syncEditorScroll();
  editor.focus({ preventScroll: true });
}

function collectSearchMatches(query) {
  if (!query) {
    return [];
  }

  const text = editor.value.toLocaleLowerCase();
  const needle = query.toLocaleLowerCase();
  const matches = [];
  let start = 0;

  while (start <= text.length - needle.length) {
    const index = text.indexOf(needle, start);
    if (index === -1) {
      break;
    }
    matches.push({ start: index, end: index + query.length });
    start = index + Math.max(query.length, 1);
  }

  return matches;
}

function refreshSearchMatches(preferredPosition = editor.selectionStart) {
  searchMatches = collectSearchMatches(findInput.value);
  if (searchMatches.length) {
    const containingIndex = searchMatches.findIndex(
      (match) => preferredPosition >= match.start && preferredPosition < match.end
    );
    const nextIndex = searchMatches.findIndex((match) => match.start >= preferredPosition);
    activeSearchIndex = containingIndex >= 0 ? containingIndex : nextIndex >= 0 ? nextIndex : 0;
  } else {
    activeSearchIndex = -1;
  }

  updateSearchControls();
  editorHighlight.innerHTML = highlightMarkdown(editor.value);
  syncEditorScroll();
}

function updateSearchControls() {
  const total = searchMatches.length;
  const current = activeSearchIndex >= 0 ? activeSearchIndex + 1 : 0;
  findMatchCount.textContent = `${current} / ${total}`;
  findPreviousButton.disabled = total === 0;
  findNextButton.disabled = total === 0;
  replaceButton.disabled = total === 0;
  replaceAllButton.disabled = total === 0;
}

function moveSearchMatch(direction) {
  if (!findInput.value) {
    findInput.focus();
    return;
  }

  if (!searchMatches.length) {
    setStatus("\u672a\u627e\u5230\u5339\u914d\u5185\u5bb9");
    return;
  }

  activeSearchIndex = (activeSearchIndex + direction + searchMatches.length) % searchMatches.length;
  updateSearchControls();
  editorHighlight.innerHTML = highlightMarkdown(editor.value);
  syncEditorScroll();
  revealActiveSearchMatch();
}

function revealActiveSearchMatch(updateStatus = true) {
  const match = searchMatches[activeSearchIndex];
  if (!match) {
    if (updateStatus) {
      setStatus(findInput.value ? "\u672a\u627e\u5230\u5339\u914d\u5185\u5bb9" : "\u8bf7\u8f93\u5165\u67e5\u627e\u5185\u5bb9");
    }
    return;
  }

  editor.setSelectionRange(match.start, match.end);
  requestAnimationFrame(() => {
    const currentMark = editorHighlight.querySelector(".search-match-current");
    if (!currentMark) {
      return;
    }

    const top = currentMark.offsetTop;
    const bottom = top + currentMark.offsetHeight;
    const visibleTop = editor.scrollTop + 12;
    const visibleBottom = editor.scrollTop + editor.clientHeight - 12;
    if (top < visibleTop) {
      editor.scrollTop = Math.max(0, top - 12);
    } else if (bottom > visibleBottom) {
      editor.scrollTop = bottom - editor.clientHeight + 20;
    }
  });
  if (updateStatus) {
    setStatus(`\u5df2\u627e\u5230 ${searchMatches.length} \u5904\u5339\u914d`);
  }
}

function replaceCurrentMatch() {
  const match = searchMatches[activeSearchIndex];
  if (!match) {
    setStatus("\u6ca1\u6709\u53ef\u66ff\u6362\u7684\u5339\u914d\u5185\u5bb9");
    return;
  }

  const replacement = replaceInput.value;
  editor.setRangeText(replacement, match.start, match.end, "end");
  const nextPosition = match.start + replacement.length;
  refreshSearchMatches(nextPosition);
  render("\u5df2\u66ff\u6362 1 \u5904");
  revealActiveSearchMatch(false);
  replaceInput.focus();
  setStatus("\u5df2\u66ff\u6362 1 \u5904");
}

function replaceAllMatches() {
  if (!searchMatches.length) {
    setStatus("\u6ca1\u6709\u53ef\u66ff\u6362\u7684\u5339\u914d\u5185\u5bb9");
    return;
  }

  const count = searchMatches.length;
  const replacement = replaceInput.value;
  let result = editor.value;
  for (let index = searchMatches.length - 1; index >= 0; index -= 1) {
    const match = searchMatches[index];
    result = `${result.slice(0, match.start)}${replacement}${result.slice(match.end)}`;
  }

  editor.setRangeText(result, 0, editor.value.length, "end");
  refreshSearchMatches(0);
  render(`\u5df2\u5168\u90e8\u66ff\u6362 ${count} \u5904`);
  replaceInput.focus();
}

async function repairMarkdownFormatting() {
  if (!window.prettier?.formatWithCursor || !window.prettierPlugins?.markdown) {
    setStatus("\u683c\u5f0f\u4fee\u590d\u7ec4\u4ef6\u52a0\u8f7d\u5931\u8d25");
    return;
  }

  const original = editor.value;
  const repaired = repairCommonMarkdownSyntax(original);
  const topLine = getEditorTopLine();
  const selectionStart = editor.selectionStart;
  const selectionEnd = editor.selectionEnd;
  const selectionDirection = editor.selectionDirection;
  const repairedCursorOffset = remapOffsetByLineAndColumn(original, repaired, selectionStart);

  formatRepairButton.disabled = true;
  formatRepairButton.setAttribute("aria-busy", "true");
  setStatus("\u6b63\u5728\u81ea\u52a8\u4fee\u590d Markdown \u683c\u5f0f...");

  try {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const result = await window.prettier.formatWithCursor(repaired, {
      parser: "markdown",
      plugins: [window.prettierPlugins.markdown],
      proseWrap: "preserve",
      endOfLine: "lf",
      tabWidth: 2,
      cursorOffset: repairedCursorOffset,
    });

    const changed = result.formatted !== original;
    editor.value = result.formatted;

    if (selectionStart === selectionEnd) {
      editor.setSelectionRange(result.cursorOffset, result.cursorOffset, selectionDirection);
    } else {
      const selectionLength = Math.max(0, selectionEnd - selectionStart);
      const mappedEnd = Math.min(result.formatted.length, result.cursorOffset + selectionLength);
      editor.setSelectionRange(result.cursorOffset, mappedEnd, selectionDirection);
    }

    render(
      changed
        ? "\u5df2\u81ea\u52a8\u4fee\u590d Markdown \u683c\u5f0f"
        : "\u5f53\u524d Markdown \u683c\u5f0f\u5df2\u7ecf\u89c4\u8303",
    );
    requestAnimationFrame(() => {
      scrollEditorToLine(topLine);
      syncEditorScroll();
    });
  } catch (error) {
    setStatus(`\u683c\u5f0f\u4fee\u590d\u5931\u8d25\uff1a${error.message}`);
  } finally {
    formatRepairButton.disabled = false;
    formatRepairButton.removeAttribute("aria-busy");
    editor.focus();
  }
}

function repairCommonMarkdownSyntax(markdown) {
  const normalized = markdown.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");
  let openFence = null;

  const repairedLines = lines.map((line) => {
    if (openFence) {
      if (markdownSyntax.closesFence(line, openFence)) {
        openFence = null;
      }
      return line;
    }
    const opening = markdownSyntax.openFence(line);
    if (opening) {
      openFence = opening;
      return line;
    }

    return line
      .replace(/^( {0,3}#{1,6})(?=[^\s#])/, "$1 ")
      .replace(/^( {0,3}-)(?=[^\s-])/, "$1 ")
      .replace(/^( {0,3}\d+\.)(?=[^\s\d])/, "$1 ")
      .replace(/^( {0,3}>+)(?=\S)/, "$1 ");
  });

  if (openFence) {
    repairedLines.push(openFence.character.repeat(openFence.length));
  }

  return repairedLines.join("\n");
}

function remapOffsetByLineAndColumn(source, target, offset) {
  const sourceBeforeCursor = source.slice(0, Math.max(0, offset)).replace(/\r\n?/g, "\n");
  const sourceLines = sourceBeforeCursor.split("\n");
  const lineIndex = sourceLines.length - 1;
  const column = sourceLines[lineIndex].length;
  const targetLines = target.split("\n");
  const safeLineIndex = Math.min(lineIndex, targetLines.length - 1);
  let mappedOffset = 0;

  for (let index = 0; index < safeLineIndex; index += 1) {
    mappedOffset += targetLines[index].length + 1;
  }

  return mappedOffset + Math.min(column, targetLines[safeLineIndex]?.length || 0);
}

function render(message = "\u5b9e\u65f6\u9884\u89c8\u5df2\u66f4\u65b0") {
  if (!findReplacePanel.hidden) {
    searchMatches = collectSearchMatches(findInput.value);
    if (activeSearchIndex >= searchMatches.length) {
      activeSearchIndex = searchMatches.length ? searchMatches.length - 1 : -1;
    }
    updateSearchControls();
  }
  editorHighlight.innerHTML = highlightMarkdown(editor.value);
  syncEditorScroll();
  previewContent.innerHTML = markdownToHtml(editor.value);
  mermaidRenderPromise = renderMermaidDiagrams(++mermaidRenderGeneration);
  updateTableOfContents();
  if (scrollSyncEnabled) {
    requestAnimationFrame(() => syncPaneScroll(editor, preview));
  }
  const count = editor.value.replace(/\s/g, "").length;
  wordCount.textContent = `${count} \u5b57`;
  updateDocumentState();
  setStatus(message);
}

function openTableOfContents() {
  updateTableOfContents();
  tocPanel.hidden = false;
  tocToggleButton.classList.add("is-active");
  tocToggleButton.setAttribute("aria-expanded", "true");
  updateActiveTocItem();
}

function closeTableOfContents() {
  tocPanel.hidden = true;
  tocToggleButton.classList.remove("is-active");
  tocToggleButton.setAttribute("aria-expanded", "false");
}

function updateTableOfContents() {
  const headings = Array.from(preview.querySelectorAll(PREVIEW_HEADING_SELECTOR));
  const fragment = document.createDocumentFragment();

  headings.forEach((heading) => {
    const level = Number(heading.tagName.slice(1));
    const item = document.createElement("button");
    const marker = document.createElement("span");
    const label = document.createElement("span");

    item.type = "button";
    item.className = "toc-item";
    item.dataset.sourceLine = heading.dataset.sourceLine;
    item.style.setProperty("--toc-indent", `${Math.max(0, level - 1) * 8}px`);
    item.title = `\u8df3\u8f6c\u5230\uff1a${heading.textContent.trim() || "\u672a\u547d\u540d\u6807\u9898"}`;

    marker.className = "toc-level";
    marker.textContent = "#".repeat(level);
    label.className = "toc-label";
    label.textContent = heading.textContent.trim() || "\u672a\u547d\u540d\u6807\u9898";
    item.append(marker, label);
    fragment.append(item);
  });

  tocList.replaceChildren(fragment);
  tocList.hidden = headings.length === 0;
  tocEmpty.hidden = headings.length > 0;
  updateActiveTocItem();
}

function updateActiveTocItem() {
  const items = Array.from(tocList.querySelectorAll(".toc-item"));
  if (!items.length) {
    return;
  }

  const headings = Array.from(preview.querySelectorAll(PREVIEW_HEADING_SELECTOR));
  const visibleTop = preview.getBoundingClientRect().top + 24;
  let activeLine = headings[0]?.dataset.sourceLine;
  for (const heading of headings) {
    if (heading.getBoundingClientRect().top <= visibleTop) {
      activeLine = heading.dataset.sourceLine;
    } else {
      break;
    }
  }

  items.forEach((item) => item.classList.toggle("is-active", item.dataset.sourceLine === activeLine));
}

function navigateToTocLine(sourceLine) {
  if (!Number.isFinite(sourceLine)) {
    return;
  }

  const heading = Array.from(preview.querySelectorAll(PREVIEW_HEADING_SELECTOR))
    .find((element) => Number(element.dataset.sourceLine) === sourceLine);
  if (!heading) {
    return;
  }

  markActiveScrollSource(preview);
  const previewTop = preview.getBoundingClientRect().top;
  const targetTop = preview.scrollTop + heading.getBoundingClientRect().top - previewTop - 12;
  preview.scrollTop = clampScrollTop(preview, targetTop);
  if (scrollSyncEnabled) {
    syncPaneScroll(preview, editor);
  }
  updateActiveTocItem();
  closeTableOfContents();
  setStatus(`\u5df2\u8df3\u8f6c\u5230\u6807\u9898\uff1a${heading.textContent.trim()}`);
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let paragraphStart = 0;
  let listType = null;
  let inCode = null;
  let codeLang = "";
  let codeLines = [];
  let codeStart = 0;
  let inMathBlock = false;
  let mathLines = [];
  let mathStart = 0;
  let blockquote = [];
  let blockquoteStart = 0;

  const flushParagraph = () => {
    if (paragraph.length) {
      html.push(`<p data-source-line="${paragraphStart}">${renderInline(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };

  const flushList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };

  const flushBlockquote = () => {
    if (blockquote.length) {
      html.push(`<blockquote data-source-line="${blockquoteStart}">${markdownToHtml(blockquote.join("\n"))}</blockquote>`);
      blockquote = [];
    }
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    const sourceLine = index + 1;

    if (inCode) {
      if (markdownSyntax.closesFence(line, inCode)) {
        html.push(renderCodeBlock(codeLang, codeLines.join("\n"), codeStart));
        codeLines = [];
        codeLang = "";
        inCode = null;
      } else {
        codeLines.push(line);
      }
      continue;
    }

    // Code and math blocks protect their contents from other block markers.
    if (inMathBlock && trimmed !== "$$") {
      mathLines.push(line);
      continue;
    }

    const opening = markdownSyntax.openFence(line);
    if (opening && !inMathBlock) {
      flushParagraph();
      flushList();
      flushBlockquote();
      inCode = opening;
      codeStart = sourceLine;
      codeLang = opening.info.split(/\s+/)[0].toLowerCase();
      continue;
    }

    if (trimmed === "$$") {
      flushParagraph();
      flushList();
      flushBlockquote();
      if (inMathBlock) {
        html.push(renderMath(mathLines.join("\n"), true, mathStart));
        mathLines = [];
        inMathBlock = false;
      } else {
        inMathBlock = true;
        mathStart = sourceLine;
      }
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      flushBlockquote();
      continue;
    }

    if (trimmed.startsWith("> ")) {
      flushParagraph();
      flushList();
      if (!blockquote.length) {
        blockquoteStart = sourceLine;
      }
      blockquote.push(trimmed.slice(2));
      continue;
    }

    flushBlockquote();

    const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      html.push(`<h${level} data-source-line="${sourceLine}">${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    if (isTableStart(lines, index)) {
      flushParagraph();
      flushList();
      const tableRows = [];
      while (index < lines.length && /^\s*\|.*\|\s*$/.test(lines[index])) {
        tableRows.push(lines[index]);
        index += 1;
      }
      index -= 1;
      html.push(renderTable(tableRows, sourceLine));
      continue;
    }

    const task = trimmed.match(/^[-*+]\s+\[([ xX])\]\s+(.*)$/);
    const unordered = trimmed.match(/^[-*+]\s+(.*)$/);
    const ordered = trimmed.match(/^\d+\.\s+(.*)$/);
    if (task || unordered || ordered) {
      flushParagraph();
      const nextType = task || unordered ? "ul" : "ol";
      if (listType !== nextType) {
        flushList();
        listType = nextType;
        html.push(`<${listType}>`);
      }
      if (task) {
        const checked = task[1].toLowerCase() === "x" ? " checked" : "";
        html.push(
          `<li class="task-list-item" data-source-line="${sourceLine}"><input type="checkbox" disabled${checked}>${renderInline(task[2])}</li>`
        );
      } else {
        html.push(`<li data-source-line="${sourceLine}">${renderInline((unordered || ordered)[1])}</li>`);
      }
      continue;
    }

    flushList();
    if (!paragraph.length) {
      paragraphStart = sourceLine;
    }
    paragraph.push(trimmed);
  }

  if (inCode) {
    html.push(renderCodeBlock(codeLang, codeLines.join("\n"), codeStart));
  }
  if (inMathBlock) {
    html.push(renderMath(mathLines.join("\n"), true, mathStart));
  }
  flushParagraph();
  flushList();
  flushBlockquote();

  return html.join("\n");
}

function renderCodeBlock(language, code, sourceLine = 1) {
  if (language === "mermaid") {
    return renderMermaid(code, sourceLine);
  }

  const lang = language || "text";
  const safeLang = escapeHtml(lang);

  return `<div class="code-card" data-source-line="${sourceLine}">
    <div class="code-card-header">
      <div class="code-dots" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="code-actions">
        <span class="code-lang">${safeLang}</span>
        <button class="code-copy" type="button">\u590d\u5236\u4ee3\u7801</button>
        <button class="code-collapse" type="button">\u6536\u8d77</button>
      </div>
    </div>
    <pre><code class="language-${safeLang}">${highlightCode(code, language)}</code></pre>
  </div>`;
}

function highlightCode(code, language = "") {
  const lang = language.toLowerCase();
  const keywords = getCodeKeywords(lang);
  let output = "";
  let index = 0;

  while (index < code.length) {
    const char = code[index];
    const next = code[index + 1];

    if (char === "/" && next === "/") {
      const end = code.indexOf("\n", index);
      const value = code.slice(index, end === -1 ? code.length : end);
      output += wrapCodeToken("code-comment", value);
      index += value.length;
      continue;
    }

    if (char === "/" && next === "*") {
      const end = code.indexOf("*/", index + 2);
      const value = code.slice(index, end === -1 ? code.length : end + 2);
      output += wrapCodeToken("code-comment", value);
      index += value.length;
      continue;
    }

    if ((lang.includes("py") || lang.includes("sh") || lang.includes("cpp") || lang.includes("c")) && char === "#") {
      const end = code.indexOf("\n", index);
      const value = code.slice(index, end === -1 ? code.length : end);
      output += wrapCodeToken("code-comment", value);
      index += value.length;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      const value = readCodeString(code, index, char);
      output += wrapCodeToken("code-string", value);
      index += value.length;
      continue;
    }

    if (/\d/.test(char)) {
      const value = code.slice(index).match(/^\d+(?:\.\d+)?(?:[A-Za-z_]\w*)?/)[0];
      output += wrapCodeToken("code-number", value);
      index += value.length;
      continue;
    }

    if (/[A-Za-z_]/.test(char)) {
      const value = code.slice(index).match(/^[A-Za-z_][\w:]*/)[0];
      const after = code[index + value.length];
      const className = keywords.has(value)
        ? "code-keyword"
        : after === "("
          ? "code-function"
          : null;
      output += className ? wrapCodeToken(className, value) : escapeHtml(value);
      index += value.length;
      continue;
    }

    if (/[=+\-*%<>!&|^~?:.]/.test(char)) {
      output += wrapCodeToken("code-operator", char);
      index += 1;
      continue;
    }

    output += escapeHtml(char);
    index += 1;
  }

  return output;
}

function getCodeKeywords(language) {
  if (language.includes("py")) {
    return new Set([
      "def",
      "class",
      "import",
      "from",
      "return",
      "if",
      "elif",
      "else",
      "for",
      "while",
      "try",
      "except",
      "with",
      "as",
      "lambda",
      "True",
      "False",
      "None",
      "async",
      "await",
      "yield",
      "in",
      "is",
      "not",
      "and",
      "or",
    ]);
  }

  if (language.includes("json")) {
    return new Set(["true", "false", "null"]);
  }

  return new Set([
    "const",
    "let",
    "var",
    "function",
    "return",
    "if",
    "else",
    "for",
    "while",
    "do",
    "switch",
    "case",
    "break",
    "continue",
    "class",
    "new",
    "this",
    "import",
    "export",
    "from",
    "async",
    "await",
    "try",
    "catch",
    "throw",
    "public",
    "private",
    "protected",
    "virtual",
    "override",
    "static",
    "void",
    "int",
    "float",
    "double",
    "bool",
    "char",
    "string",
    "auto",
    "namespace",
    "using",
    "struct",
    "enum",
    "template",
    "typename",
    "consteval",
    "constexpr",
    "nullptr",
    "true",
    "false",
    "uint16_t",
    "uint32_t",
    "std",
  ]);
}

function readCodeString(code, start, quote) {
  let index = start + 1;
  while (index < code.length) {
    if (code[index] === "\\") {
      index += 2;
      continue;
    }
    if (code[index] === quote) {
      index += 1;
      break;
    }
    index += 1;
  }
  return code.slice(start, index);
}

function wrapCodeToken(className, value) {
  return `<span class="${className}">${escapeHtml(value)}</span>`;
}

function renderInline(value) {
  return renderInlineMath(escapeHtml(value))
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => renderMarkdownImage(alt, src))
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => renderMarkdownLink(label, href))
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/&lt;u&gt;([\s\S]+?)&lt;\/u&gt;/g, "<u>$1</u>")
    .replace(/(?<!~)~~([^~]+)~~(?!~)/g, "<s>$1</s>")
    .replace(/\^([^^\s][^^]*?)\^/g, "<sup>$1</sup>")
    .replace(/(?<!~)~([^~\s][^~]*?)~(?!~)/g, "<sub>$1</sub>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function renderMarkdownImage(alt, src) {
  const kind = localAssetMeta.get(src)?.kind || "image";
  const meta = localAssetMeta.get(src);
  const isLocalImage = isLocalAssetUrl(src) || Boolean(meta) || /^file:/i.test(src);
  const localAttrs = isLocalImage
    ? ` class="local-asset-image" data-local-asset="${escapeAttribute(src)}" data-local-kind="${escapeAttribute(kind)}"${meta?.path ? ` data-local-path="${escapeAttribute(meta.path)}"` : ""} title="\u6309\u4f4f Ctrl \u5e76\u5de6\u952e\u5355\u51fb\u5728\u8d44\u6e90\u7ba1\u7406\u5668\u4e2d\u5b9a\u4f4d\u56fe\u7247"`
    : "";
  return `<img alt="${escapeAttribute(alt)}" src="${escapeAttribute(src)}"${localAttrs} />`;
}

function renderMarkdownLink(label, href) {
  const kind = getLocalLinkKind(href, unescapeHtml(label));
  const meta = localAssetMeta.get(href);
  const classes = kind ? ` class="local-asset-link"` : "";
  const localAttrs = kind
    ? ` data-local-asset="${escapeAttribute(href)}" data-local-kind="${escapeAttribute(kind)}"${meta?.path ? ` data-local-path="${escapeAttribute(meta.path)}"` : ""}`
    : "";
  const title =
    kind === "folder"
      ? "\u6309\u4f4f Ctrl \u5e76\u5de6\u952e\u5355\u51fb\u6253\u5f00\u6587\u4ef6\u5939"
      : kind === "file"
        ? "\u6309\u4f4f Ctrl \u5e76\u5de6\u952e\u5355\u51fb\uff1aMarkdown \u6587\u4ef6\u5728\u65b0\u7a97\u53e3\u6253\u5f00\uff0c\u5176\u4ed6\u6587\u4ef6\u5728\u8d44\u6e90\u7ba1\u7406\u5668\u4e2d\u5b9a\u4f4d"
        : "";
  const titleAttr = title ? ` title="${escapeAttribute(title)}"` : "";
  return `<a href="${escapeAttribute(href)}" target="_blank" rel="noreferrer"${classes}${localAttrs}${titleAttr}>${label}</a>`;
}

function isLocalAssetUrl(value) {
  return localAssetUrls.has(value) || /^blob:/i.test(value);
}

function getLocalLinkKind(value, label = "") {
  if (localAssetMeta.has(value)) {
    return localAssetMeta.get(value).kind || "file";
  }
  if (/^local-folder:/i.test(value)) {
    return "folder";
  }
  if (isLocalAssetUrl(value)) {
    return localAssetMeta.get(value)?.kind || "file";
  }
  if (isLocalPathLike(unescapeMarkdownLinkTarget(value))) {
    return /\/$/.test(String(label || "").trim()) ? "folder" : "file";
  }
  if (isRelativeLocalLink(value)) {
    return /\/$/.test(unescapeMarkdownLinkTarget(value)) || /\/$/.test(String(label || "").trim()) ? "folder" : "file";
  }
  return "";
}

function unescapeMarkdownLinkTarget(value) {
  return unescapeHtml(String(value || ""))
    .replace(/\\([!"#$%&'()*+,./:;<=>?@[\\\]^_`{|}~-])/g, "$1")
    .trim();
}

function isLocalPathLike(value) {
  const normalized = unescapeMarkdownLinkTarget(value);
  return /^file:\/\/\//i.test(normalized) || /^[A-Za-z]:[\\/]/.test(normalized);
}

function isRelativeLocalLink(value) {
  const target = unescapeMarkdownLinkTarget(value);
  return Boolean(currentFilePath) &&
    Boolean(target) &&
    !target.startsWith("#") &&
    !target.startsWith("//") &&
    !/^[A-Za-z][A-Za-z\d+.-]*:/.test(target);
}

function renderInlineMath(value) {
  return value.replace(/\$([^$\n]+)\$/g, (_, formula) => renderMath(unescapeHtml(formula), false));
}

function renderMath(formula, block, sourceLine = 1) {
  const content = renderMathExpression(formula.trim());
  const className = block ? "math-block" : "math-inline";
  const lineAttr = block ? ` data-source-line="${sourceLine}"` : "";
  return `<span class="${className}"${lineAttr}>${content}</span>`;
}

function renderMathExpression(formula) {
  const normalized = formula
    .replace(/\\\s+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return parseMath(normalized);
}

function parseMath(value) {
  let result = "";
  let index = 0;

  while (index < value.length) {
    if (value.startsWith("\\frac", index)) {
      const parsed = parseFrac(value, index + 5);
      result += parsed.html;
      index = parsed.index;
      continue;
    }

    if (value.startsWith("\\sqrt", index)) {
      const parsed = parseSqrt(value, index + 5);
      result += parsed.html;
      index = parsed.index;
      continue;
    }

    if (value[index] === "^" || value[index] === "_") {
      const isSup = value[index] === "^";
      const parsed = parseScript(value, index + 1);
      result += `<${isSup ? "sup" : "sub"}>${parseMath(parsed.body)}</${isSup ? "sup" : "sub"}>`;
      index = parsed.index;
      continue;
    }

    if (value[index] === "\\") {
      const command = value.slice(index).match(/^\\[A-Za-z]+/);
      if (command) {
        result += renderMathCommand(command[0]);
        index += command[0].length;
        continue;
      }
    }

    result += escapeHtml(value[index]);
    index += 1;
  }

  return result;
}

function parseFrac(value, index) {
  const top = parseBraceGroup(value, skipSpaces(value, index));
  const bottom = parseBraceGroup(value, skipSpaces(value, top.index));

  return {
    html: `<span class="math-frac"><span>${parseMath(top.body)}</span><span>${parseMath(bottom.body)}</span></span>`,
    index: bottom.index,
  };
}

function parseSqrt(value, index) {
  const radicand = parseBraceGroup(value, skipSpaces(value, index));

  return {
    html: `<span class="math-sqrt"><span>${parseMath(radicand.body)}</span></span>`,
    index: radicand.index,
  };
}

function parseScript(value, index) {
  index = skipSpaces(value, index);
  if (value[index] === "{") {
    return parseBraceGroup(value, index);
  }

  return {
    body: value[index] || "",
    index: index + 1,
  };
}

function parseBraceGroup(value, index) {
  if (value[index] !== "{") {
    return { body: "", index };
  }

  let depth = 0;
  let body = "";
  for (let cursor = index; cursor < value.length; cursor += 1) {
    const char = value[cursor];
    if (char === "{") {
      if (depth > 0) {
        body += char;
      }
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return { body, index: cursor + 1 };
      }
      body += char;
      continue;
    }

    body += char;
  }

  return { body, index: value.length };
}

function renderMathCommand(command) {
  const symbols = {
    "\\pm": "±",
    "\\sqrt": "√",
    "\\pi": "π",
    "\\alpha": "α",
    "\\beta": "β",
    "\\gamma": "γ",
    "\\Delta": "Δ",
    "\\theta": "θ",
    "\\lambda": "λ",
    "\\mu": "μ",
    "\\times": "×",
    "\\cdot": "·",
    "\\le": "≤",
    "\\ge": "≥",
    "\\neq": "≠",
    "\\approx": "≈",
    "\\infty": "∞",
  };

  return symbols[command] || escapeHtml(command.replace("\\", ""));
}

function skipSpaces(value, index) {
  while (value[index] === " ") {
    index += 1;
  }
  return index;
}

function highlightMarkdown(markdown) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  let inCode = null;
  let sourceOffset = 0;
  let searchIndex = 0;

  return lines
    .map((line, index) => {
      const lineStart = sourceOffset;
      const lineEnd = lineStart + line.length;
      sourceOffset = lineEnd + 1;
      const trimmed = line.trim();
      let className = "md-line";

      const opening = !inCode && markdownSyntax.openFence(line);
      if (opening || (inCode && markdownSyntax.closesFence(line, inCode))) {
        inCode = opening || null;
        className += " md-code-fence";
      } else if (inCode) {
        className += " md-code-line";
      } else if (/^#\s+/.test(trimmed)) {
        className += " md-heading-1";
      } else if (/^##\s+/.test(trimmed)) {
        className += " md-heading-2";
      } else if (/^#{3,6}\s+/.test(trimmed)) {
        className += ` md-heading-${Math.min(6, trimmed.match(/^#+/)[0].length)}`;
      } else if (/^[-*+]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
        className += " md-list";
      } else if (/^>\s+/.test(trimmed)) {
        className += " md-quote";
      } else if (/^\|.*\|$/.test(trimmed)) {
        className += " md-table";
      } else if (trimmed === "$$" || /\$[^$\n]+\$/.test(trimmed)) {
        className += " md-math";
      } else if (/\[[^\]]+\]\([^)]+\)/.test(trimmed)) {
        className += " md-link";
      } else if (/(<u>.+<\/u>|~~[^~]+~~|\^[^^]+\^|~[^~]+~|\*\*[^*]+\*\*|\*[^*]+\*)/.test(trimmed)) {
        className += " md-emphasis";
      }

      while (searchIndex < searchMatches.length && searchMatches[searchIndex].end <= lineStart) {
        searchIndex += 1;
      }

      let highlightedLine = "";
      let lineCursor = 0;
      let lineSearchIndex = searchIndex;
      while (lineSearchIndex < searchMatches.length) {
        const match = searchMatches[lineSearchIndex];
        if (match.start >= lineEnd || match.end > lineEnd) {
          break;
        }

        const localStart = Math.max(0, match.start - lineStart);
        const localEnd = Math.max(localStart, match.end - lineStart);
        highlightedLine += escapeHtml(line.slice(lineCursor, localStart));
        highlightedLine += `<mark class="search-match${lineSearchIndex === activeSearchIndex ? " search-match-current" : ""}">${escapeHtml(line.slice(localStart, localEnd))}</mark>`;
        lineCursor = localEnd;
        lineSearchIndex += 1;
      }
      searchIndex = lineSearchIndex;
      highlightedLine += escapeHtml(line.slice(lineCursor));

      return `<div class="${className}" data-source-line="${index + 1}">${highlightedLine || " "}</div>`;
    })
    .join("");
}

function syncEditorScroll() {
  editorHighlight.scrollTop = editor.scrollTop;
  editorHighlight.scrollLeft = editor.scrollLeft;
}

function syncPaneScroll(source, target) {
  if (!scrollSyncEnabled || isResizing) {
    return;
  }

  if (syncingScroll && source === scrollSyncTarget) {
    return;
  }

  if (activeScrollSource && source !== activeScrollSource) {
    return;
  }

  const targetScrollTop = getLinkedScrollTop(source, target);
  if (!Number.isFinite(targetScrollTop)) {
    return;
  }

  syncTargetScroll(source, target, targetScrollTop);
}

function getLinkedScrollTop(source, target) {
  const sourceAnchors = collectScrollAnchors(source);
  const targetAnchors = collectScrollAnchors(target);
  if (sourceAnchors.length < 2 || targetAnchors.length < 2) {
    return getPercentScrollTop(source, target);
  }

  const sourceInset = getScrollTopInset(source);
  const targetInset = getScrollTopInset(target);
  const sourceTop = source.scrollTop + sourceInset;
  const currentLine = getLineAtScrollTop(sourceAnchors, sourceTop);
  const targetTop = getTopForLine(targetAnchors, currentLine) - targetInset;

  return clampScrollTop(target, targetTop);
}

function collectScrollAnchors(scroller) {
  const container = scroller === editor ? editorHighlight : preview;
  const scrollerRect = scroller.getBoundingClientRect();
  const elements = Array.from(container.querySelectorAll("[data-source-line]"));
  const anchorsByLine = new Map();

  elements
    .map((element) => ({
      line: Number(element.dataset.sourceLine),
      top: element.getBoundingClientRect().top - scrollerRect.top + scroller.scrollTop,
    }))
    .filter((anchor) => Number.isFinite(anchor.line) && Number.isFinite(anchor.top))
    .forEach((anchor) => {
      const existing = anchorsByLine.get(anchor.line);
      if (!existing || anchor.top < existing.top) {
        anchorsByLine.set(anchor.line, anchor);
      }
    });

  const anchors = Array.from(anchorsByLine.values()).sort((first, second) => first.line - second.line);

  const totalLines = editor.value.split("\n").length + 1;
  const style = window.getComputedStyle(scroller === editor ? editor : preview);
  const paddingTop = Number.parseFloat(style.paddingTop) || 0;
  const paddingBottom = Number.parseFloat(style.paddingBottom) || 0;
  const endTop = Math.max(paddingTop, scroller.scrollHeight - paddingBottom);

  if (!anchors.length || anchors[0].line > 1) {
    anchors.unshift({ line: 1, top: paddingTop });
  }

  const last = anchors[anchors.length - 1];
  if (last.line < totalLines || endTop > last.top) {
    anchors.push({ line: totalLines, top: endTop });
  }

  return anchors;
}

function getLineAtScrollTop(anchors, top) {
  const span = getAnchorSpan(anchors, top, "top");
  if (!span.next || span.next.top === span.current.top) {
    return span.current.line;
  }

  const ratio = (top - span.current.top) / (span.next.top - span.current.top);
  return span.current.line + (span.next.line - span.current.line) * Math.max(0, Math.min(1, ratio));
}

function getTopForLine(anchors, line) {
  const span = getAnchorSpan(anchors, line, "line");
  if (!span.next || span.next.line === span.current.line) {
    return span.current.top;
  }

  const ratio = (line - span.current.line) / (span.next.line - span.current.line);
  return span.current.top + (span.next.top - span.current.top) * Math.max(0, Math.min(1, ratio));
}

function getAnchorSpan(anchors, value, key) {
  let current = anchors[0];
  let next = anchors[1] || null;

  for (let index = 0; index < anchors.length; index += 1) {
    const anchor = anchors[index];
    if (anchor[key] <= value) {
      current = anchor;
      next = anchors[index + 1] || null;
    } else {
      break;
    }
  }

  return { current, next };
}

function getScrollTopInset(scroller) {
  const style = window.getComputedStyle(scroller);
  return Number.parseFloat(style.paddingTop) || 0;
}

function getPercentScrollTop(source, target) {
  const sourceMax = Math.max(1, source.scrollHeight - source.clientHeight);
  const targetMax = Math.max(0, target.scrollHeight - target.clientHeight);
  return clampScrollTop(target, (source.scrollTop / sourceMax) * targetMax);
}

function clampScrollTop(scroller, value) {
  const max = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
  return Math.max(0, Math.min(max, value));
}

function syncTargetScroll(source, target, top) {
  cancelPendingScrollSync(false);

  const endTop = clampScrollTop(target, top);
  if (Math.abs(target.scrollTop - endTop) < 1) {
    releaseScrollSyncSoon();
    return;
  }

  syncingScroll = true;
  scrollSyncSource = source;
  scrollSyncTarget = target;

  target.scrollTop = endTop;
  if (target === editor) {
    syncEditorScroll();
  }
  releaseScrollSyncSoon();
}

function releaseScrollSyncSoon() {
  if (scrollSyncReleaseTimer) {
    window.clearTimeout(scrollSyncReleaseTimer);
  }

  scrollSyncReleaseTimer = window.setTimeout(() => {
    syncingScroll = false;
    scrollSyncSource = null;
    scrollSyncTarget = null;
    scrollSyncReleaseTimer = null;
  }, 90);
}

function cancelPendingScrollSync(resetState = true) {
  if (scrollSyncFrame) {
    cancelAnimationFrame(scrollSyncFrame);
    scrollSyncFrame = null;
  }
  if (scrollSyncReleaseTimer) {
    window.clearTimeout(scrollSyncReleaseTimer);
    scrollSyncReleaseTimer = null;
  }
  if (!resetState) {
    return;
  }
  syncingScroll = false;
  scrollSyncSource = null;
  scrollSyncTarget = null;
  activeScrollSource = null;
  if (activeScrollSourceTimer) {
    window.clearTimeout(activeScrollSourceTimer);
    activeScrollSourceTimer = null;
  }
}

function markActiveScrollSource(scroller) {
  activeScrollSource = scroller;
  if (activeScrollSourceTimer) {
    window.clearTimeout(activeScrollSourceTimer);
  }
  activeScrollSourceTimer = window.setTimeout(() => {
    activeScrollSource = null;
    activeScrollSourceTimer = null;
  }, 350);
}

function syncPaneScrollLegacy(source, target) {
  if (syncingScroll || isResizing) {
    return;
  }

  const line = source === editor ? getEditorTopLine() : getPreviewTopLine();
  if (!line) {
    return;
  }

  syncingScroll = true;
  if (target === editor) {
    scrollEditorToLine(line);
    syncEditorScroll();
  } else {
    scrollPreviewToLine(line);
  }
  requestAnimationFrame(() => {
    syncingScroll = false;
  });
}

function getEditorTopLine() {
  const lines = Array.from(editorHighlight.querySelectorAll("[data-source-line]"));
  const top = editor.scrollTop + 8;
  let current = 1;

  for (const line of lines) {
    if (line.offsetTop <= top) {
      current = Number(line.dataset.sourceLine);
    } else {
      break;
    }
  }

  return current;
}

function getPreviewTopLine() {
  const blocks = Array.from(preview.querySelectorAll("[data-source-line]"));
  const top = preview.scrollTop + 12;
  let current = 1;

  for (const block of blocks) {
    if (block.offsetTop <= top) {
      current = Number(block.dataset.sourceLine);
    } else {
      break;
    }
  }

  return current;
}

function scrollEditorToLine(line) {
  const targetLine = findClosestSourceElement(editorHighlight, line);
  if (targetLine) {
    editor.scrollTop = targetLine.offsetTop;
  }
}

function scrollPreviewToLine(line) {
  const targetBlock = findClosestSourceElement(preview, line);
  if (targetBlock) {
    preview.scrollTop = targetBlock.offsetTop;
  }
}

function findClosestSourceElement(container, line) {
  const elements = Array.from(container.querySelectorAll("[data-source-line]"));
  let closest = elements[0];

  for (const element of elements) {
    if (Number(element.dataset.sourceLine) <= line) {
      closest = element;
    } else {
      break;
    }
  }

  return closest;
}

// Also embedded in exported HTML so preview, PDF and images share one diagram style.
function getMermaidReportStyles() {
  return `
  .mermaid-diagram{box-sizing:border-box;width:100%;margin:16px 0 26px;overflow:auto;padding:20px;border:1px solid #d4d4d4;border-radius:0;background:#fff;color:#222}
  .mermaid-diagram svg{display:block;margin-inline:auto;max-width:none;height:auto;font-family:"SimSun","宋体",serif;font-size:16px}
  .mermaid-diagram svg .node rect,.mermaid-diagram svg .node polygon,.mermaid-diagram svg .node circle,.mermaid-diagram svg .node ellipse,.mermaid-diagram svg .node path,
  .mermaid-diagram .mermaid-node rect,.mermaid-diagram .mermaid-node polygon{fill:#f5f5f5!important;stroke:#555!important;stroke-width:1.25px!important;stroke-dasharray:none!important;filter:none!important}
  .mermaid-diagram svg .node rect,.mermaid-diagram svg .cluster rect,.mermaid-diagram .mermaid-node rect,.mermaid-diagram .mermaid-subgraph rect{rx:0!important;ry:0!important}
  .mermaid-diagram svg .cluster rect,.mermaid-diagram .mermaid-subgraph rect{fill:#fafafa!important;stroke:#777!important;stroke-width:1.25px!important}
  .mermaid-diagram svg .flowchart-link,.mermaid-diagram .mermaid-edge{stroke:#555!important;stroke-width:1.25px!important;stroke-dasharray:none!important;fill:none!important}
  .mermaid-diagram svg marker path{fill:#555!important;stroke:#555!important}
  .mermaid-diagram svg text,.mermaid-diagram svg .label,.mermaid-diagram svg .nodeLabel,.mermaid-diagram svg .edgeLabel,.mermaid-diagram svg .cluster-label{font-family:"SimSun","宋体",serif!important;font-size:16px!important;color:#222!important;fill:#222!important}
  .mermaid-diagram svg .edgeLabel rect,.mermaid-diagram svg .labelBkg{fill:#fff!important;background:#fff!important;opacity:1!important}
  @media print {
    .mermaid-diagram{overflow:visible;break-inside:avoid;padding:8px}
    .mermaid-diagram svg{max-width:100%!important;height:auto!important}
  }
`;
}

function initializeMermaid() {
  const style = document.createElement("style");
  style.textContent = getMermaidReportStyles();
  document.head.append(style);
  if (!window.mermaid) {
    return;
  }

  window.mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: "base",
    layout: "elk",
    elk: {
      mergeEdges: false,
      nodePlacementStrategy: "NETWORK_SIMPLEX",
      cycleBreakingStrategy: "DEPTH_FIRST",
    },
    themeVariables: {
      fontFamily: '"SimSun", "宋体", serif',
      fontSize: "16px",
      primaryColor: "#f5f5f5",
      primaryTextColor: "#222222",
      primaryBorderColor: "#555555",
      lineColor: "#555555",
      secondaryColor: "#fafafa",
      tertiaryColor: "#ffffff",
      clusterBkg: "#fafafa",
      clusterBorder: "#777777",
      edgeLabelBackground: "#ffffff",
    },
    flowchart: {
      htmlLabels: false,
      curve: "linear",
      nodeSpacing: 56,
      rankSpacing: 80,
      padding: 16,
      useMaxWidth: false,
    },
    state: {
      useMaxWidth: false,
    },
  });
}

function renderMermaid(source, sourceLine = 1) {
  if (!window.mermaid) {
    return renderMermaidFallback(source, sourceLine);
  }

  return `<div class="mermaid-diagram" data-source-line="${sourceLine}"><pre class="mermaid-source" hidden>${escapeHtml(source)}</pre><span class="mermaid-loading">\u6b63\u5728\u6e32\u67d3\u56fe\u8868...</span></div>`;
}

async function renderMermaidDiagrams(generation) {
  if (!window.mermaid) {
    return;
  }

  const diagrams = Array.from(previewContent.querySelectorAll(".mermaid-diagram"));
  for (const [index, diagram] of diagrams.entries()) {
    const source = diagram.querySelector(".mermaid-source")?.textContent || "";
    const sourceLine = Number(diagram.dataset.sourceLine) || 1;
    const renderId = `mermaid-${generation}-${index}-${++mermaidRenderSequence}`;
    try {
      const result = await window.mermaid.render(renderId, source);
      if (generation !== mermaidRenderGeneration || !diagram.isConnected) {
        return;
      }
      diagram.innerHTML = result.svg;
      const svg = diagram.querySelector("svg");
      const viewBox = svg?.viewBox?.baseVal;
      if (svg && viewBox?.width > 0 && viewBox?.height > 0) {
        svg.style.width = `${viewBox.width}px`;
        svg.style.height = `${viewBox.height}px`;
      }
      result.bindFunctions?.(diagram);
    } catch (error) {
      document.querySelector(`#d${renderId}`)?.remove();
      if (generation !== mermaidRenderGeneration || !diagram.isConnected) {
        return;
      }
      const fallback = document.createElement("div");
      fallback.innerHTML = renderMermaidFallback(source, sourceLine);
      const replacement = fallback.firstElementChild;
      if (replacement) {
        diagram.replaceWith(replacement);
      }
      console.warn("Mermaid render failed:", error);
    }
  }
}

function renderMermaidFallback(source, sourceLine = 1) {
  const parsed = parseMermaidFlowchart(source);
  if (!parsed.nodes.length) {
    return `<pre data-source-line="${sourceLine}"><code>${escapeHtml(source)}</code></pre>`;
  }

  const isLR = parsed.direction === "LR" || parsed.direction === "RL";
  const layers = assignMermaidLayers(parsed);
  const nodeSizes = new Map(parsed.nodes.map((node) => [node.id, measureMermaidNode(node)]));
  const gapX = isLR ? 88 : 72;
  const gapY = isLR ? 52 : 66;
  const margin = 34;
  const positions = new Map();
  const layerList = Array.from(layers.entries()).sort((a, b) => a[0] - b[0]);
  const layerMetrics = layerList.map(([, nodeIds]) => ({
    width: Math.max(...nodeIds.map((id) => nodeSizes.get(id)?.width || 100), 100),
    height: Math.max(...nodeIds.map((id) => nodeSizes.get(id)?.height || 48), 48),
  }));

  let cursor = margin;
  if (isLR) {
    layerList.forEach(([layer, nodeIds], layerIndex) => {
      const columnWidth = layerMetrics[layerIndex].width;
      const totalHeight = nodeIds.reduce((sum, id) => sum + (nodeSizes.get(id)?.height || 48), 0) + Math.max(0, nodeIds.length - 1) * gapY;
      let y = margin + Math.max(0, (Math.max(...layerMetrics.map((metric) => metric.height), 48) - totalHeight) / 2);
      nodeIds.forEach((nodeId) => {
        const size = nodeSizes.get(nodeId) || { width: 100, height: 48 };
        positions.set(nodeId, { x: cursor + (columnWidth - size.width) / 2, y });
        y += size.height + gapY;
      });
      cursor += columnWidth + gapX;
    });
  } else {
    layerList.forEach(([layer, nodeIds], layerIndex) => {
      const rowHeight = layerMetrics[layerIndex].height;
      const totalWidth = nodeIds.reduce((sum, id) => sum + (nodeSizes.get(id)?.width || 100), 0) + Math.max(0, nodeIds.length - 1) * gapX;
      let x = margin + Math.max(0, (Math.max(...layerMetrics.map((metric) => metric.width), 100) - totalWidth) / 2);
      nodeIds.forEach((nodeId) => {
        const size = nodeSizes.get(nodeId) || { width: 100, height: 48 };
        positions.set(nodeId, { x, y: cursor + (rowHeight - size.height) / 2 });
        x += size.width + gapX;
      });
      cursor += rowHeight + gapY;
    });
  }

  const bounds = getMermaidBounds(parsed.nodes, positions, nodeSizes);
  const width = Math.max(620, bounds.width + margin * 2);
  const height = Math.max(240, bounds.height + margin * 2);
  const markerId = `mermaid-arrow-${++mermaidRenderSequence}`;
  const groups = parsed.groups.map((group) => renderMermaidGroup(group, positions, nodeSizes, markerId)).join("");

  const edges = parsed.edges
    .map((edge) => renderMermaidEdge(edge, positions, nodeSizes, isLR, markerId))
    .join("");
  const nodes = parsed.nodes
    .map((node) => renderMermaidNode(node, positions.get(node.id), nodeSizes.get(node.id)))
    .join("");

  return `<div class="mermaid-diagram" data-source-line="${sourceLine}"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Mermaid flowchart">
    <defs>
      <marker id="${markerId}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#3f4756"></path>
      </marker>
    </defs>
    ${groups}
    ${edges}
    ${nodes}
  </svg></div>`;
}

function parseMermaidFlowchart(source) {
  const lines = String(source || "").replace(/\r\n?/g, "\n").split("\n");
  const header = lines.find((line) => line.trim() && !line.trim().startsWith("%%"))?.trim() || "";
  const directionMatch = header.match(/(?:flowchart|graph)\s+(TB|TD|BT|LR|RL)\b/i);
  const direction = (directionMatch?.[1] || "LR").toUpperCase() === "TD" ? "TB" : (directionMatch?.[1] || "LR").toUpperCase();
  const nodes = new Map();
  const edges = [];
  const groups = [];
  const groupStack = [];

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("%%") || /^(?:flowchart|graph)\b/i.test(line) || /^(?:classDef|class|style|linkStyle|click)\b/i.test(line)) {
      return;
    }
    const subgraph = line.match(/^subgraph\s+([A-Za-z0-9_:-]+)(?:\s*\[\s*["']?([\s\S]*?)["']?\s*\])?$/i);
    if (subgraph) {
      const group = { id: subgraph[1], title: cleanMermaidLabel(subgraph[2] || subgraph[1]), nodes: [], parent: groupStack[groupStack.length - 1]?.id || "" };
      groups.push(group);
      groupStack.push(group);
      return;
    }
    if (/^end$/i.test(line)) {
      groupStack.pop();
      return;
    }

    const edge = parseMermaidEdge(line);
    if (edge) {
      registerMermaidNode(nodes, edge.from, groupStack);
      registerMermaidNode(nodes, edge.to, groupStack);
      edges.push({ from: edge.from.id, to: edge.to.id, label: edge.label, bidirectional: edge.bidirectional });
      return;
    }

    const node = parseMermaidNodeToken(line);
    if (node) {
      registerMermaidNode(nodes, node, groupStack);
    }
  });

  return { direction, nodes: Array.from(nodes.values()), edges, groups };
}

function parseMermaidEdge(line) {
  let match = line.match(/^(.+?)\s*(<-->|-->|-\.->|==>)\s*\|([\s\S]*?)\|\s*(.+)$/);
  if (match) {
    return createMermaidEdge(match[1], match[4], match[3], match[2] === "<-->");
  }
  match = line.match(/^(.+?)\s*--\s*(?:["']([^"']*)["']|([^\-\n]*?))\s*-->\s*(.+)$/);
  if (match) {
    return createMermaidEdge(match[1], match[4], match[2] || match[3] || "", false);
  }
  match = line.match(/^(.+?)\s*(<-->|-->|-\.->|==>)\s*(.+)$/);
  if (match) {
    return createMermaidEdge(match[1], match[3], "", match[2] === "<-->");
  }
  return null;
}

function parseMermaidNodeToken(token) {
  const value = String(token || "").trim();
  const match = value.match(/^([A-Za-z0-9_:-]+)\s*([\[\(\{][\s\S]*)?$/);
  if (!match) {
    return null;
  }
  const id = match[1];
  const rest = match[2] || "";
  if (!rest) {
    return { id, label: id, shape: "rect" };
  }
  const open = rest[0];
  const close = open === "[" ? "]" : open === "{" ? "}" : ")";
  const end = rest.lastIndexOf(close);
  const label = end > 0 ? rest.slice(rest.indexOf(open) + 1, end) : rest.slice(1);
  return { id, label: cleanMermaidLabel(label), shape: open === "{" ? "diamond" : open === "(" ? "round" : "rect" };
}

function createMermaidEdge(fromToken, toToken, label, bidirectional) {
  const from = parseMermaidNodeToken(fromToken);
  const to = parseMermaidNodeToken(toToken);
  return from && to ? { from, to, label: cleanMermaidLabel(label), bidirectional } : null;
}

function registerMermaidNode(nodes, node, groupStack) {
  if (!node?.id) {
    return;
  }
  const existing = nodes.get(node.id);
  const merged = existing ? { ...existing, ...node, label: node.label !== node.id ? node.label : existing.label } : node;
  merged.groups = Array.from(new Set([...(existing?.groups || []), ...groupStack.map((group) => group.id)]));
  nodes.set(node.id, merged);
  groupStack.forEach((group) => {
    if (!group.nodes.includes(node.id)) {
      group.nodes.push(node.id);
    }
  });
}

function assignMermaidLayers(parsed) {
  const byId = new Map(parsed.nodes.map((node) => [node.id, node]));
  const layer = new Map(parsed.nodes.map((node) => [node.id, 0]));

  for (let pass = 0; pass < parsed.nodes.length; pass += 1) {
    parsed.edges.forEach((edge) => {
      if (byId.has(edge.from) && byId.has(edge.to)) {
        layer.set(edge.to, Math.max(layer.get(edge.to), layer.get(edge.from) + 1));
      }
    });
  }

  const groups = new Map();
  parsed.nodes.forEach((node) => {
    const key = layer.get(node.id) || 0;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(node.id);
  });

  return groups;
}

function measureMermaidNode(node) {
  const lines = wrapMermaidLabel(cleanMermaidLabel(node.label), 20);
  const maxWidth = Math.max(...lines.map(estimateMermaidLineWidth), 42);
  return {
    width: Math.max(128, maxWidth + 40 + (node.shape === "diamond" ? 32 : 0)),
    height: Math.max(56, lines.length * 24 + 32 + (node.shape === "diamond" ? 16 : 0)),
    lines,
  };
}

function renderMermaidNode(node, pos, size) {
  if (!pos) {
    return "";
  }

  const lines = size?.lines || [cleanMermaidLabel(node.label)];
  const textY = pos.y + size.height / 2 - (lines.length - 1) * 12;
  const text = lines
    .map((line, index) => `<text x="${pos.x + size.width / 2}" y="${textY + index * 24}">${escapeHtml(line)}</text>`)
    .join("");

  if (node.shape === "diamond") {
    const points = [
      [pos.x + size.width / 2, pos.y],
      [pos.x + size.width, pos.y + size.height / 2],
      [pos.x + size.width / 2, pos.y + size.height],
      [pos.x, pos.y + size.height / 2],
    ]
      .map((point) => point.join(","))
      .join(" ");
    return `<g class="mermaid-node"><polygon points="${points}"></polygon>${text}</g>`;
  }

  return `<g class="mermaid-node"><rect class="mermaid-node-shape" x="${pos.x}" y="${pos.y}" width="${size.width}" height="${size.height}" rx="${node.shape === "round" ? 24 : 12}"></rect>${text}</g>`;
}

function renderMermaidEdge(edge, positions, nodeSizes, isLR, markerId) {
  const from = positions.get(edge.from);
  const to = positions.get(edge.to);
  const fromSize = nodeSizes.get(edge.from);
  const toSize = nodeSizes.get(edge.to);
  if (!from || !to || !fromSize || !toSize) {
    return "";
  }

  const startX = isLR ? from.x + fromSize.width : from.x + fromSize.width / 2;
  const startY = isLR ? from.y + fromSize.height / 2 : from.y + fromSize.height;
  const endX = isLR ? to.x : to.x + toSize.width / 2;
  const endY = isLR ? to.y + toSize.height / 2 : to.y;
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  const path = isLR
    ? `M ${startX} ${startY} H ${midX} V ${endY} H ${endX}`
    : `M ${startX} ${startY} V ${midY} H ${endX} V ${endY}`;
  const labelLines = edge.label ? wrapMermaidLabel(edge.label, 18) : [];
  const labelWidth = labelLines.length ? Math.max(...labelLines.map(estimateMermaidLineWidth)) + 16 : 0;
  const labelHeight = labelLines.length ? labelLines.length * 17 + 8 : 0;
  const label = labelLines.length
    ? `<g class="mermaid-edge-label"><rect x="${midX - labelWidth / 2}" y="${midY - labelHeight / 2}" width="${labelWidth}" height="${labelHeight}" rx="5"></rect>${labelLines.map((line, index) => `<text x="${midX}" y="${midY - (labelLines.length - 1) * 8.5 + index * 17}">${escapeHtml(line)}</text>`).join("")}</g>`
    : "";

  return `<path class="mermaid-edge" d="${path}" marker-end="url(#${markerId})"${edge.bidirectional ? ` marker-start="url(#${markerId})"` : ""}></path>${label}`;
}

function renderMermaidGroup(group, positions, nodeSizes) {
  const groupPositions = group.nodes.map((id) => ({ position: positions.get(id), size: nodeSizes.get(id) })).filter((item) => item.position && item.size);
  if (!groupPositions.length) {
    return "";
  }
  const left = Math.min(...groupPositions.map((item) => item.position.x)) - 22;
  const top = Math.min(...groupPositions.map((item) => item.position.y)) - 30;
  const right = Math.max(...groupPositions.map((item) => item.position.x + item.size.width)) + 22;
  const bottom = Math.max(...groupPositions.map((item) => item.position.y + item.size.height)) + 22;
  return `<g class="mermaid-subgraph"><rect x="${left}" y="${top}" width="${right - left}" height="${bottom - top}" rx="8"></rect><text x="${left + 12}" y="${top + 18}">${escapeHtml(group.title)}</text></g>`;
}

function getMermaidBounds(nodes, positions, nodeSizes) {
  const positioned = nodes.map((node) => ({ position: positions.get(node.id), size: nodeSizes.get(node.id) })).filter((item) => item.position && item.size);
  if (!positioned.length) {
    return { width: 0, height: 0 };
  }
  return {
    width: Math.max(...positioned.map((item) => item.position.x + item.size.width)),
    height: Math.max(...positioned.map((item) => item.position.y + item.size.height)),
  };
}

function cleanMermaidLabel(value) {
  const cleaned = String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
  return /^(["'])[\s\S]*\1$/.test(cleaned) ? cleaned.slice(1, -1) : cleaned;
}

function estimateMermaidLineWidth(value) {
  return Array.from(String(value || "")).reduce((width, char) => width + (char.charCodeAt(0) > 255 ? 16 : 9), 0);
}

function wrapMermaidLabel(value, limit) {
  const sourceLines = String(value || "").split("\n");
  const lines = [];
  sourceLines.forEach((sourceLine) => {
    let current = "";
    Array.from(sourceLine).forEach((char) => {
      if (current && (current.length >= limit || estimateMermaidLineWidth(current + char) > limit * 9)) {
        lines.push(current);
        current = "";
      }
      current += char;
    });
    lines.push(current || " ");
  });
  return lines.length ? lines : [String(value || " ")];
}

function renderTable(rows, sourceLine = 1) {
  const cleanRows = rows
    .map((row, index) => ({
      cells: splitTableRow(row),
      sourceLine: sourceLine + index,
      isDivider: index === 1 && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(row),
    }))
    .filter((row) => !row.isDivider);

  if (!cleanRows.length) {
    return "";
  }

  const [head, ...body] = cleanRows;
  const thead = `<thead><tr data-source-line="${head.sourceLine}">${head.cells
    .map((cell) => `<th>${renderInline(cell)}</th>`)
    .join("")}</tr></thead>`;
  const tbody = `<tbody>${body
    .map(
      (row) =>
        `<tr data-source-line="${row.sourceLine}">${row.cells.map((cell) => `<td>${renderInline(cell)}</td>`).join("")}</tr>`
    )
    .join("")}</tbody>`;

  return `<table data-source-line="${sourceLine}">${thead}${tbody}</table>`;
}

function splitTableRow(row) {
  return row
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableStart(lines, index) {
  return (
    /^\s*\|.*\|\s*$/.test(lines[index] || "") &&
    /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[index + 1] || "")
  );
}

function wrapSelection(before, after) {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const selected = editor.value.slice(start, end);
  editor.setRangeText(`${before}${selected}${after}`, start, end, "select");
}

function prefixSelection(prefix) {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const selected = editor.value.slice(start, end) || "";
  const replacement = selected
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
  editor.setRangeText(replacement, start, end, "select");
}

function insertAtCursor(text) {
  editor.setRangeText(text, editor.selectionStart, editor.selectionEnd, "end");
}

function downloadFile(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function buildPreviewDocument(body, sourceMarkdown = "") {
  const encodedSource = btoa(unescape(encodeURIComponent(sourceMarkdown)));
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(stripExtension(currentFileName))}</title>
  <style>
    body{max-width:860px;margin:48px auto;padding:0 24px;color:#222;font:12pt/1.75 "SimSun","宋体",serif}
    p,li,blockquote,table,th,td{font-family:"SimSun","宋体",serif;font-size:12pt}
    @page{size:A4;margin:20mm}
    @media print{body{max-width:none;margin:0;padding:0}h1,h2,h3,h4,h5,h6{break-after:avoid}thead{display:table-header-group}tr,img{break-inside:avoid}.code-copy,.code-collapse{display:none}}
    h1,h2,h3{line-height:1.25;color:#26384d}
    pre{padding:20px;border-radius:7px;overflow:auto;color:#f6f8fb;background:#242933}
    code{padding:2px 6px;border-radius:6px;color:#cb1b5b;background:#f4f6fa}
    pre code{padding:0;color:inherit;background:transparent}
    .code-card{margin:0 0 22px;overflow:hidden;border-radius:7px;background:#242933;box-shadow:0 14px 40px rgba(33,43,65,.1)}.code-card-header{min-height:38px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 12px;color:#cbd5e1;background:#242933}.code-dots{display:flex;gap:6px}.code-dots span{width:10px;height:10px;border-radius:999px}.code-dots span:nth-child(1){background:#ff6259}.code-dots span:nth-child(2){background:#f7c948}.code-dots span:nth-child(3){background:#5ec269}.code-actions{display:flex;align-items:center;gap:8px}.code-lang{min-width:42px;padding:3px 8px;border-radius:999px;color:#c7d2fe;font-size:12px;font-weight:800;text-align:center;text-transform:uppercase;background:rgba(99,102,241,.18)}.code-copy,.code-collapse{border:0;padding:3px 7px;color:#cbd5e1;font-size:12px;background:transparent}.code-card pre{margin:0;padding:18px 20px 22px;border-radius:0;box-shadow:none}.code-card.is-collapsed pre{display:none}.code-keyword{color:#d88cff;font-weight:700}.code-string{color:#7ee787}.code-number{color:#ffb86c}.code-comment{color:#8b949e;font-style:italic}.code-function{color:#79c0ff;font-weight:700}.code-operator{color:#ff7b72}
    .math-inline{font-family:Georgia,"Times New Roman",serif;font-style:italic}
    .math-block{display:flex;justify-content:center;margin:18px 0 24px;font-family:Georgia,"Times New Roman",serif;font-size:1.1em;font-style:italic}
    .math-frac{display:inline-flex;flex-direction:column;align-items:center;vertical-align:-.58em;text-align:center;margin:0 .18em;line-height:1.15}.math-frac>span:first-child{border-bottom:1px solid currentColor;min-width:100%;padding:0 .35em .12em}.math-frac>span:last-child{padding:.12em .35em 0}.math-sqrt{display:inline-flex;align-items:flex-start;vertical-align:-.16em}.math-sqrt:before{content:"√";font-size:1.32em;line-height:.98;transform:translateY(.08em)}.math-sqrt>span{border-top:1px solid currentColor;padding:.08em .16em 0;line-height:1.08}
    blockquote{padding:12px 18px;border-left:4px solid #20b486;background:#eef1f5}
    table{width:100%;border-collapse:collapse}th,td{padding:10px 12px;border:1px solid #dfe4ec;text-align:left}
    img{max-width:100%;height:auto;border-radius:8px}.local-asset-link,.local-asset-image{cursor:help}
    a{color:#1469f2}
    .task-list-item{list-style:none;margin-left:-1.35em}.task-list-item input{width:14px;height:14px;margin:0 8px 0 0;vertical-align:-2px;accent-color:#6f42ff}
    .mermaid-diagram{margin:0 0 26px;overflow:auto;padding:14px 12px 16px;border:1px solid #dfe4ec;border-radius:7px;background:#fff}
    .mermaid-diagram svg{display:block;margin-inline:auto;width:auto;min-width:0;max-width:none;height:auto}
    .mermaid-node rect,.mermaid-node polygon{fill:#f8f9fc;stroke:#9aa7b8;stroke-width:1.35}
    .mermaid-node text{fill:#253044;font-size:13px;font-weight:500;dominant-baseline:middle;text-anchor:middle}
    .mermaid-edge{stroke:#3f4756;stroke-width:1.25;fill:none}
    .mermaid-edge-label{pointer-events:none}.mermaid-edge-label rect{fill:#fff;stroke:#e1e6ee;stroke-width:1}.mermaid-edge-label text{fill:#536174;font-size:11px;text-anchor:middle;dominant-baseline:middle}
    .mermaid-subgraph rect{fill:#fbfcfe;stroke:#cfd7e2;stroke-width:1}.mermaid-subgraph text{fill:#536174;font-size:12px;font-weight:700}
    ${getMermaidReportStyles()}
  </style>
</head>
<body>
${body}
<script type="application/x-markdown-editor-source">${encodedSource}</script>
<script>
document.addEventListener("click", async (event) => {
  const copyButton = event.target.closest(".code-copy");
  const collapseButton = event.target.closest(".code-collapse");
  const localAsset = event.target.closest("a[data-local-asset], img[data-local-asset], a[data-open-folder]");
  if (localAsset) {
    event.preventDefault();
    const folderTarget = localAsset.dataset.openFolder;
    if (event.ctrlKey || event.metaKey) {
      const url = folderTarget || localAsset.dataset.localAsset || localAsset.getAttribute("href") || localAsset.getAttribute("src");
      window.open(url, "_blank", "noopener");
    }
    return;
  }
  if (copyButton) {
    const code = copyButton.closest(".code-card")?.querySelector("code")?.innerText || "";
    await navigator.clipboard.writeText(code);
    copyButton.textContent = "\u5df2\u590d\u5236";
    setTimeout(() => { copyButton.textContent = "\u590d\u5236\u4ee3\u7801"; }, 1200);
  }
  if (collapseButton) {
    const card = collapseButton.closest(".code-card");
    const collapsed = card.classList.toggle("is-collapsed");
    collapseButton.textContent = collapsed ? "\u5c55\u5f00" : "\u6536\u8d77";
  }
});
</script>
</body>
</html>`;
}

function ensureExtension(name, extension) {
  return /\.[^.]+$/.test(name) ? name.replace(/\.[^.]+$/, extension) : `${name}${extension}`;
}

function stripExtension(name) {
  return name.replace(/\.[^.]+$/, "") || "markdown-preview";
}

function setStatus(message) {
  statusLabel.textContent = message;
}

function isZoomModifier(event) {
  return event.ctrlKey || event.metaKey;
}

function isPreviewZoomContext() {
  return preview.matches(":hover") || preview.contains(document.activeElement) || appShell.dataset.viewMode === "preview";
}

function setPreviewZoom(value, pointerEvent = null) {
  const nextZoom = Math.round(Math.min(2.5, Math.max(0.5, value)) * 10) / 10;
  if (nextZoom === previewZoom) {
    return;
  }

  const oldZoom = previewZoom;
  const bounds = preview.getBoundingClientRect();
  const anchorX = pointerEvent ? pointerEvent.clientX - bounds.left : preview.clientWidth / 2;
  const anchorY = pointerEvent ? pointerEvent.clientY - bounds.top : preview.clientHeight / 2;
  const contentX = (preview.scrollLeft + anchorX) / oldZoom;
  const contentY = (preview.scrollTop + anchorY) / oldZoom;

  previewZoom = nextZoom;
  previewContent.style.zoom = String(previewZoom);
  writeLocalSetting("markdown-editor-preview-zoom", String(previewZoom));

  requestAnimationFrame(() => {
    preview.scrollLeft = Math.max(0, contentX * previewZoom - anchorX);
    preview.scrollTop = clampScrollTop(preview, contentY * previewZoom - anchorY);
    updateActiveTocItem();
  });
  setStatus(`\u9884\u89c8\u7f29\u653e\uff1a${Math.round(previewZoom * 100)}%`);
}

function restorePreviewZoom() {
  const stored = readLocalSetting("markdown-editor-preview-zoom");
  const saved = stored === null ? Number.NaN : Number(stored);
  previewZoom = Number.isFinite(saved) ? Math.round(Math.min(2.5, Math.max(0.5, saved)) * 10) / 10 : 1;
  previewContent.style.zoom = String(previewZoom);
}

function readLocalSetting(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocalSetting(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Some browsers block localStorage for file:// pages. The editor still works without persistence.
  }
}

function setSplitterSize(percent) {
  const safePercent = Math.min(Math.max(percent, 25), 75);
  document.documentElement.style.setProperty("--editor-size", `${safePercent}%`);
  writeLocalSetting("markdown-editor-split", String(safePercent));
}

function restoreSplitterSize() {
  const saved = Number(readLocalSetting("markdown-editor-split"));
  if (Number.isFinite(saved)) {
    setSplitterSize(saved);
  }
  splitter.setAttribute(
    "aria-orientation",
    window.matchMedia("(max-width: 860px)").matches ? "horizontal" : "vertical"
  );
}

function finishResize(event) {
  if (!isResizing) {
    return;
  }

  isResizing = false;
  appShell.dataset.resizing = "false";
  document.body.classList.remove("is-resizing");
  if (event?.pointerId != null && splitter.hasPointerCapture(event.pointerId)) {
    splitter.releasePointerCapture(event.pointerId);
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function unescapeHtml(value) {
  return String(value)
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&");
}
