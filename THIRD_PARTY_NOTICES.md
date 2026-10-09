# 第三方组件与许可

本仓库的项目许可证不替代第三方组件各自的许可证。

| 组件 | 用途 | 许可 |
| --- | --- | --- |
| Electron | 桌面应用运行时 | MIT；其内置组件另有声明 |
| Mermaid | 图表解析与渲染 | MIT，见 `third-party/MERMAID-LICENSE.txt` |
| @mermaid-js/layout-elk | Mermaid 的 ELK 布局适配 | MIT |
| elkjs / Eclipse Layout Kernel | 图表布局和走线 | EPL-2.0 |
| d3-shape、d3-path | 图表路径 | ISC |
| Prettier | Markdown 格式整理 | MIT |
| docx | Word 导出 | MIT |
| pdf-lib | PDF 处理 | MIT |
| JSZip | 文档 ZIP 容器处理 | MIT 或 GPL-3.0；此处按 MIT 使用 |
| Microsoft MarkItDown | 可选文档转换依赖 | MIT，见 `third-party/MARKITDOWN-LICENSE.txt` |

ELK 布局包及其随包依赖的完整声明位于 `vendor/mermaid-elk.min.js.LEGAL.txt`，构建脚本会从已安装依赖重新生成声明。其他 npm 依赖请参阅对应包的 LICENSE 文件和 `package-lock.json`。

上游源码：

- https://github.com/mermaid-js/mermaid
- https://github.com/kieler/elkjs
- https://github.com/d3/d3-shape
- https://github.com/d3/d3-path
- https://github.com/microsoft/markitdown

ELK 适配代码位于 `vendor-src/mermaid-elk.js`；上游库本身通过 npm 安装并打包。项目沿用开发工作目录中的 MIT 许可声明，保留 Microsoft 的版权声明。
