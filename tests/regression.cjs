const { app, BrowserWindow } = require("electron");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const { createRequire } = require("node:module");
const JSZip = require("jszip");
const { PDFDocument } = require("pdf-lib");
const root = path.resolve(__dirname, "..");
const packaged = process.argv.includes("--packaged");
const sourceRoot = packaged ? path.join(root, "dist", "win-unpacked", "resources", "app.asar") : root;
const version = require('../package.json').version;
const output = path.join(root, "dist", `qa-${version}${packaged ? '-packaged' : ''}`);
app.setPath("userData", path.join(output, "user-data"));
app.disableHardwareAcceleration();

app.whenReady().then(async () => {
  await fs.mkdir(output, { recursive: true });
  const win = new BrowserWindow({ show: false, width: 1500, height: 1000, webPreferences: { backgroundThrottling: false } });
  const errors = [];
  win.webContents.on("console-message", (_event, level, message) => {
    if (level >= 2 && /Mermaid render failed|Uncaught/.test(message)) errors.push(message);
  });
  await win.loadFile(path.join(sourceRoot, "index.html"));
  const report = await win.webContents.executeJavaScript(`(async () => {
    const checks = [];
    function check(name, condition) { if (!condition) throw new Error(name); checks.push(name); }
    const fence = String.fromCharCode(96).repeat(3);
    const graph = 'flowchart TD\\nA[示例软件系统] --- B[职责层]\\nB --- C[软件单元]';
    const tilde = '~~~mermaid\\n' + graph + '\\n~~~';
    const backtick = fence + 'mermaid\\n' + graph + '\\n' + fence;
    check('tilde and backtick Mermaid produce identical blocks', markdownToHtml(tilde) === markdownToHtml(backtick));
    check('two tildes remain strikethrough', markdownToHtml('~~删除线~~').includes('<s>删除线</s>'));
    check('inline triple tildes are not strikethrough or subscript', !/<s>|<sub>/.test(renderInline('前 ~~~文字~~~ 后')));
    check('single tilde remains subscript', renderInline('H~2~O').includes('<sub>2</sub>'));
    const mixed = '~~~~text\\n~~~\\n' + fence + '\\n$$\\n~~literal~~\\n~~~~\\n正文';
    const mixedHtml = markdownToHtml(mixed);
    check('short/mismatched fences and math markers stay inside code', (mixedHtml.match(/class="code-card"/g) || []).length === 1 && !mixedHtml.includes('math-block') && mixedHtml.includes('~~literal~~') && mixedHtml.includes('正文</p>'));
    check('unterminated tilde block renders', markdownToHtml('~~~text\\n正文').includes('code-card'));
    check('closing fence cannot have info', !markdownSyntax.closesFence('~~~text', markdownSyntax.openFence('~~~')));
    check('longer matching closing fence works', markdownSyntax.closesFence('~~~~  ', markdownSyntax.openFence('~~~')));
    check('four-space indent is not a fence', !markdownSyntax.openFence('    ~~~'));
    check('invalid backtick info is not a fence', !markdownSyntax.openFence(fence + 'text' + fence));
    check('highlighter understands tilde fences', (highlightMarkdown(tilde).match(/md-code-fence/g) || []).length === 2);
    check('repair preserves closed fences', repairCommonMarkdownSyntax(mixed) === mixed);
    check('repair closes same fence', repairCommonMarkdownSyntax('~~~~text\\n~~~').endsWith('\\n~~~~'));
    editor.value = '# 图表与导出回归验证\\n\\n正文使用宋体小四，**加粗**与~~删除线~~。\\n\\n' +
      '~~~mermaid\\nflowchart TD\\n A[示例软件系统] --- B[配置职责]\\n A --- C[运行职责]\\n B --- D[配置软件单元]\\n C --- E[运行软件单元]\\n~~~\\n\\n' +
      '## 流程语义保留\\n\\n' + fence + 'mermaid\\nflowchart LR\\n S[开始] --> Q{设备就绪}\\n Q -->|是| R[运行]\\n Q -->|否| X[结束]\\n' + fence + '\\n\\n|项目|值|\\n|---|---|\\n|字体|宋体小四|';
    render();
    await mermaidRenderPromise;
    await document.fonts.ready;
    check('both Mermaid diagrams render as real SVG', document.querySelectorAll('.mermaid-diagram svg .node').length === 9);
    const label = document.querySelector('.mermaid-diagram svg text');
    check('diagram labels are 16px (12pt)', getComputedStyle(label).fontSize === '16px');
    const rect = document.querySelector('.mermaid-diagram svg .node rect');
    check('diagram rectangle is grayscale and square', getComputedStyle(rect).fill === 'rgb(245, 245, 245)' && parseFloat(getComputedStyle(rect).rx) === 0);
    check('decisions retain diamond geometry', document.querySelectorAll('.mermaid-diagram .node polygon').length >= 1);
    check('original source is unchanged', editor.value.includes('~~~mermaid'));
    const html = buildExportPayload('html').content;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return { checks, html, markdown: editor.value };
  })()`);
  await fs.writeFile(path.join(output, "preview.png"), (await win.webContents.capturePage()).toPNG());
  assert.deepEqual(errors, []);

  // Exercise the production export functions without launching a second editor.
  const main = await fs.readFile(path.join(sourceRoot, "main.js"), "utf8");
  const exports = new Function("require", main.slice(0, main.indexOf("let mainWindow;")) +
    main.slice(main.indexOf("async function renderHtmlToPdf(")) +
    "\nreturn { renderMarkdownToDocx, renderHtmlToPdf, renderHtmlToImage, createExportWindow };")
    (createRequire(path.join(sourceRoot, "main.js")));
  await fs.writeFile(path.join(output, "report.html"), report.html);
  const htmlWindow = await exports.createExportWindow(report.html);
  const typography = await htmlWindow.webContents.executeJavaScript(`Array.from(document.querySelectorAll('p,td')).map(element => ({font:getComputedStyle(element).fontFamily,size:getComputedStyle(element).fontSize}))`);
  assert(typography.length > 0 && typography.every(style => style.font.includes("SimSun") && style.size === "16px"));
  htmlWindow.destroy();
  const docx = await exports.renderMarkdownToDocx(report.markdown);
  await fs.writeFile(path.join(output, "report.docx"), docx);
  const zip = await JSZip.loadAsync(docx);
  const styles = await zip.file("word/styles.xml").async("string");
  const xml = await zip.file("word/document.xml").async("string");
  assert.match(styles, /w:eastAsia="宋体"/);
  assert.match(styles, /w:ascii="宋体"/);
  assert.match(styles, /w:hAnsi="宋体"/);
  assert.match(styles, /w:sz w:val="24"/);
  assert.match(xml, /w:strike/);
  assert(!xml.includes("~~~mermaid"));
  assert.match(xml, /示例软件系统/);
  const pdf = await exports.renderHtmlToPdf(report.html, report.markdown);
  await fs.writeFile(path.join(output, "report.pdf"), pdf);
  const loaded = await PDFDocument.load(pdf);
  assert(loaded.getPageCount() > 0);
  assert(Math.abs(loaded.getPage(0).getWidth() - 595.28) < 2);
  for (const format of ["png", "jpg", "webp"]) {
    const image = await exports.renderHtmlToImage(report.html, format);
    assert(image.length > 1000);
    await fs.writeFile(path.join(output, 'report.' + format), image);
  }
  const summary = { checks: report.checks, typography, docx: "宋体 / 24 half-points", pdfPages: loaded.getPageCount(), imageFormats: ["png", "jpg", "webp"], errors };
  await fs.writeFile(path.join(output, "results.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  win.destroy();
  app.exit(0);
}).catch(error => { console.error(error); app.exit(1); });
