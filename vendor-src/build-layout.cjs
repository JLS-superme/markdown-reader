const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '..');

esbuild.buildSync({
  absWorkingDir: root,
  entryPoints: ['vendor-src/mermaid-elk.js'],
  bundle: true,
  minify: true,
  legalComments: 'inline',
  format: 'iife',
  platform: 'browser',
  target: 'chrome126',
  outfile: 'vendor/mermaid-elk.min.js',
});

const notices = [
  ['@mermaid-js/layout-elk', 'LICENSE'],
  ['elkjs', 'LICENSE.md'],
  ['d3-shape', 'LICENSE'],
  ['d3-path', 'LICENSE'],
].map(([name, license]) => {
  const directory = path.join(root, 'node_modules', name);
  const metadata = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
  const repository = typeof metadata.repository === 'string' ? metadata.repository : metadata.repository?.url;
  return `${name} ${metadata.version}\nSource: ${repository}\n\n${fs.readFileSync(path.join(directory, license), 'utf8')}`;
});
fs.writeFileSync(path.join(root, 'vendor/mermaid-elk.min.js.LEGAL.txt'), notices.join('\n\n'), 'utf8');
console.log('Built offline orthogonal layout bundle and third-party notices.');
