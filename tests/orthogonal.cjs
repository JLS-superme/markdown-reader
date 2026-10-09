const { app, BrowserWindow } = require('electron');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const packaged = process.argv.includes('--packaged');
const sourceRoot = packaged ? path.join(root, 'dist/win-unpacked/resources/app.asar') : root;
const output = path.join(root, 'dist', packaged ? 'qa-orthogonal-packaged' : 'qa-orthogonal');
app.setPath('userData', path.join(output, 'user-data'));
app.disableHardwareAcceleration();

const flow = `flowchart TD
A([开始]) --> B[进入准备状态并选择任务]
B --> C{配置和权限有效}
C -- 否 --> B
C -- 是 --> D[归一化配置并生成输出文件]
D --> E[启动或连接服务]
E --> F[加载场景和资源]
F --> G{运行环境就绪}
G -- 否且可重试 --> G
G -- 否且不可重试 --> X[记录失败并受控释放]
G -- 是 --> H{运行方式}
H -- 单机 --> I[启动本地引擎]
H -- 直接联网 --> J[直接接收远程数据]
H -- 本地服务 --> K[登记本地服务]
K --> L[等待服务连接]
L --> M{服务连接成功}
M -- 否且可重试 --> L
M -- 否且不可重试 --> X
I --> N[进入Running]
J --> N
M -- 是 --> N
N --> O{收到操作请求}
O -- 普通运行 --> N
O -- 切换任务 --> P[封口旧记录并加载新任务]
P --> N
O -- 服务重启 --> Q[关闭并重启服务]
Q --> N
O -- 退出程序 --> R[停止记录并关闭关联进程]
R --> S([Exited])
X --> S`;

function checkPath(d) {
  assert(!/[CQAST]/i.test(d), 'No curved connector: ' + d);
  const segments = [...d.matchAll(/([MLHV])([^MLHV]*)/gi)];
  assert(segments.length >= 2, 'Connector must not collapse to one point: ' + d);
  let previous;
  for (const [, command, coordinates] of segments) {
    const values = coordinates.trim().split(/[ ,]+/).map(Number);
    assert(values.every(Number.isFinite));
    if (command === 'M' || command === 'L') {
      for (let i = 0; i < values.length; i += 2) {
        const point = [values[i], values[i + 1]];
        if (previous && (command === 'L' || i > 0)) {
          assert(Math.abs(previous[0] - point[0]) < 0.01 || Math.abs(previous[1] - point[1]) < 0.01, 'Diagonal connector: ' + d);
        }
        previous = point;
      }
    } else if (command === 'H') previous[0] = values.at(-1);
    else if (command === 'V') previous[1] = values.at(-1);
  }
}

app.whenReady().then(async () => {
  await fs.mkdir(output, { recursive: true });
  const win = new BrowserWindow({ show: false, width: 1588, height: 1000, webPreferences: { backgroundThrottling: false } });
  const errors = [];
  win.webContents.on('console-message', (_event, _level, message) => { if (/Mermaid render failed|Uncaught/.test(message)) errors.push(message); });
  await win.loadFile(path.join(sourceRoot, 'index.html'));
  let edgeCount = 0;
  for (const [name, source] of [
    ['complex', flow],
    ...['TD', 'LR', 'BT', 'RL'].map(direction => [direction, `flowchart ${direction}\nA[开始] --> B{判断}\nB -->|是| C[运行]\nB -->|否| D[退出]\nC --> A\nD --> D\nC <--> D`]),
    ['groups', 'flowchart LR\nsubgraph A[运行环境]\nX[组件一] --> Y[组件二]\nend\nsubgraph B[管理环境]\nM[组件三] --> N[组件四]\nend\nY --> M\nN --> X'],
  ]) {
    const result = await win.webContents.executeJavaScript(`(async () => {
      editor.value = '~~~mermaid\\n' + ${JSON.stringify(source)} + '\\n~~~';
      render(); await mermaidRenderPromise;
      const svg = previewContent.querySelector('.mermaid-diagram svg');
      const edges = [...svg.querySelectorAll('.flowchart-link')].map(edge => ({id:edge.id,d:edge.getAttribute('d')}));
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return {edges, html:buildExportPayload('html').content, svg:svg.outerHTML};
    })()`);
    assert.equal(result.edges.length, name === 'complex' ? 29 : name === 'groups' ? 4 : 6, 'All original edges must be preserved: ' + name);
    edgeCount += result.edges.length;
    await fs.writeFile(path.join(output, name + '.html'), result.html);
    await fs.writeFile(path.join(output, name + '.svg'), result.svg);
    if (name === 'complex') {
      await fs.writeFile(path.join(output, 'preview.png'), (await win.webContents.capturePage()).toPNG());
      const picture = new BrowserWindow({ show:false, width:1600, height:3200, webPreferences:{offscreen:true} });
      await picture.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent('<style>body{margin:20px}svg{max-width:1500px!important;height:auto!important}</style>' + result.svg));
      picture.setContentSize(1600, 3600);
      await picture.webContents.executeJavaScript('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
      await fs.writeFile(path.join(output, 'complex.png'), (await picture.webContents.capturePage()).toPNG());
      await fs.writeFile(path.join(output, 'branches.png'), (await picture.webContents.capturePage({x:0,y:1200,width:900,height:1150})).toPNG());
      picture.destroy();
    }
    result.edges.forEach(edge => checkPath(edge.d));
  }
  for (const source of ['sequenceDiagram\nA->>B:请求\nB-->>A:响应', 'stateDiagram-v2\n[*] --> Ready\nReady --> Running\nRunning --> [*]', 'classDiagram\nA <|-- B']) {
    const svg = await win.webContents.executeJavaScript(`(async () => {
      const result = await mermaid.render('other-' + Date.now(), ${JSON.stringify(source)});
      return result.svg;
    })()`);
    assert(svg.includes('<svg'), 'Other Mermaid diagram types still render');
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ diagrams: 6, orthogonalEdges: edgeCount, errors }));
  win.destroy(); app.exit(0);
}).catch(error => { console.error(error); app.exit(1); });
