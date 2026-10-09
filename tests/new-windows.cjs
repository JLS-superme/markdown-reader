const electron = require('electron');
const { app, BrowserWindow } = electron;
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const version = require('../package.json').version;
const packaged = process.argv.includes('--packaged');
const child = process.argv.includes('--second-instance-child');
const sourceRoot = packaged ? path.join(root, 'dist/win-unpacked/resources/app.asar') : root;
const output = path.join(root, 'dist', `qa-windows-${version}${packaged ? '-packaged' : ''}`);
fs.mkdirSync(output, { recursive: true });
app.setPath('userData', path.join(output, 'user-data'));
app.disableHardwareAcceleration();
const fixtures = ['首个文档.md', '启动队列一.md', '启动队列二.markdown', '资源管理器.MD', '连续打开一.md', '连续打开二.markdown', '关闭主窗口后.md', '链接目标.md'];
const files = fixtures.map(name => path.join(output, name));
const messages = [];
const errors = [];
let closeResponse = 2;

if (!child) {
  files.forEach((file, index) => fs.writeFileSync(file, `# 文档 ${index}\n\n独立内容 ${index}\n`));
  process.argv.push(files[0]);
}

// Use the real Electron windows, IPC, preload and single-instance lock, while
// keeping test windows and save prompts off the user's desktop.
const testElectron = {
  ...electron,
  BrowserWindow: new Proxy(BrowserWindow, {
    construct(Target, args) { return new Target({ ...args[0], show: false }); },
  }),
  dialog: {
    ...electron.dialog,
    showMessageBox: async (owner, options) => {
      messages.push({ owner: owner.id, title: options.title });
      return { response: closeResponse };
    },
    showErrorBox: (title, message) => errors.push({ title, message }),
  },
};
const requireApp = createRequire(path.join(sourceRoot, 'main.js'));
new Function('require', '__dirname', fs.readFileSync(path.join(sourceRoot, 'main.js'), 'utf8'))(
  name => name === 'electron' ? testElectron : requireApp(name), sourceRoot,
);

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(check, description) {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    const result = await check();
    if (result) return result;
    await delay(50);
  }
  throw new Error('Timed out: ' + description);
}
async function snapshot(window) {
  return window.webContents.executeJavaScript('({path:currentFilePath, content:editor.value, dirty:documentDirty})');
}
async function findWindow(file) {
  return until(async () => {
    for (const window of BrowserWindow.getAllWindows()) {
      if (window.webContents.isLoadingMainFrame()) continue;
      try { if ((await snapshot(window)).path === file) return window; } catch (_) { /* loading */ }
    }
    return null;
  }, 'window for ' + file);
}
function launch(file) {
  return new Promise((resolve, reject) => {
    const args = [__filename, '--second-instance-child', ...(packaged ? ['--packaged'] : []), file];
    const process = spawn(require('node:process').execPath, args, { cwd: root, windowsHide: true, stdio: 'pipe' });
    let stderr = '';
    process.stderr.on('data', chunk => { stderr += chunk; });
    process.on('error', reject);
    process.on('exit', code => code === 0 ? resolve() : reject(new Error(`Second instance exited ${code}: ${stderr}`)));
  });
}

if (!child) {
  // Requests received while the first renderer is still starting must not
  // overwrite each other or the original startup file.
  app.emit('open-file', { preventDefault() {} }, files[1]);
  app.emit('second-instance', {}, [files[2]], output);
  app.whenReady().then(async () => {
    const first = await findWindow(files[0]);
    await Promise.all([findWindow(files[1]), findWindow(files[2])]);
    assert.equal(BrowserWindow.getAllWindows().length, 3);
    await first.webContents.executeJavaScript("editor.value += '\\n未保存的修改'; render();");
    const original = await snapshot(first);
    assert.equal(original.dirty, true);

    await launch(files[3]);
    const fourth = await findWindow(files[3]);
    assert.equal(BrowserWindow.getAllWindows().length, 4);
    assert.deepEqual(await snapshot(first), original);
    assert.equal(messages.length, 0, 'Opening another file must not prompt to replace the current document');

    await Promise.all([launch(files[4]), launch(files[5])]);
    await Promise.all([findWindow(files[4]), findWindow(files[5])]);
    assert.equal(BrowserWindow.getAllWindows().length, 6);
    assert.deepEqual(await snapshot(first), original);

    const saved = await fourth.webContents.executeJavaScript(`(async () => {
      editor.value += '\\n仅保存此窗口'; render();
      return markdownDesktop.saveMarkdownDocument(buildEditorState());
    })()`);
    assert.equal(saved.path, files[3]);
    assert(fs.readFileSync(files[3], 'utf8').includes('仅保存此窗口'));
    assert(!fs.readFileSync(files[0], 'utf8').includes('未保存的修改'));
    assert.deepEqual(await snapshot(first), original);

    const linked = await fourth.webContents.executeJavaScript(`markdownDesktop.openLocalTarget(${JSON.stringify({path:files[7],kind:'file'})})`);
    assert.equal(linked.ok, true);
    await findWindow(files[7]);
    assert.equal(BrowserWindow.getAllWindows().length, 7);

    first.close();
    await until(() => messages.length === 1, 'unsaved close prompt');
    assert(!first.isDestroyed(), 'Cancel preserves the unsaved window');
    assert.equal(messages[0].owner, first.id);
    await delay(50);
    closeResponse = 1;
    first.close();
    await until(() => first.isDestroyed(), 'close first window');
    await launch(files[6]);
    await findWindow(files[6]);
    assert.equal(BrowserWindow.getAllWindows().length, 7, 'Explorer still opens new windows after the first one closes');

    app.emit('open-file', { preventDefault() {} }, path.join(output, 'missing.md'));
    await until(() => errors.length === 1, 'missing-file error');
    assert.equal(BrowserWindow.getAllWindows().length, 7, 'Failed open leaves other windows alone');
    for (const file of files.slice(1)) {
      const window = await findWindow(file);
      const state = await snapshot(window);
      assert(state.content.includes('独立内容 ' + files.indexOf(file)));
    }
    const result = { version, packaged, checks: [
      'cold-start file and queued launches stay separate',
      'real second process opens a new window',
      'unsaved original content stays untouched',
      'rapid launches keep separate files',
      'save affects only its owning document',
      'Ctrl-click link route still opens a new window',
      'close/cancel protects unsaved content',
      'opening works after the first window closes',
      'missing-file error leaves existing documents intact',
    ] };
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
    app.exit(0);
  }).catch(error => { console.error(error); app.exit(1); });
}
