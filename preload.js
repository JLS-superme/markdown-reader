const { contextBridge, ipcRenderer, webUtils } = require("electron");

contextBridge.exposeInMainWorld("markdownDesktop", {
  pickImportFile: () => ipcRenderer.invoke("pick-import-file"),
  importDroppedFile: (file) => ipcRenderer.invoke("import-dropped-file", webUtils.getPathForFile(file)),
  onImportStatus: (callback) => {
    const listener = (_event, message) => callback(message);
    ipcRenderer.on("import-status", listener);
    return () => ipcRenderer.removeListener("import-status", listener);
  },
  onOpenFile: (callback) => {
    const listener = (_event, file) => callback(file);
    ipcRenderer.on("open-file", listener);
    return () => ipcRenderer.removeListener("open-file", listener);
  },
  onExternalFileChanged: (callback) => {
    const listener = (_event, change) => callback(change);
    ipcRenderer.on("external-file-changed", listener);
    return () => ipcRenderer.removeListener("external-file-changed", listener);
  },
  setCurrentDocument: (filePath) => ipcRenderer.invoke("set-current-document", filePath || ""),
  reloadCurrentDocument: (filePath) => ipcRenderer.invoke("reload-current-document", filePath || ""),
  pickLinkFile: () => ipcRenderer.invoke("pick-link-file"),
  pickLinkImage: () => ipcRenderer.invoke("pick-link-image"),
  pickLinkFolder: () => ipcRenderer.invoke("pick-link-folder"),
  openLocalTarget: (target) => ipcRenderer.invoke("open-local-target", target),
  updateEditorState: (state) => ipcRenderer.send("update-editor-state", state),
  saveMarkdownDocument: (payload) => ipcRenderer.invoke("save-markdown-document", payload),
  saveExportFile: (payload) => ipcRenderer.invoke("save-export-file", payload),
});
