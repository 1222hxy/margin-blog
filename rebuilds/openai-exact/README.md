# OpenAI 白底文章原样移植

来源：https://openai.com/zh-Hans-CN/index/grid-protectors-program/

按用户确认，保留 OpenAI 标识、导航和示例正文。博客 `/` 和 `/zh-Hans-CN/index/grid-protectors-program/` 使用完整原始文档与官网运行时。个人博客首页在 `/blog/`，文章仍在 `/posts/`。不再使用此前自行设计的近似组件。

## 运行

在项目根目录执行 `npm ci`、安装 `requirements-fonts.txt`，再执行 `npm run build` 和 `npm run preview`。构建使用已保存的 `port/document.html` 与 `public/` 资源，不依赖 HAR 或私人参考目录。

原始不可变响应位于本机私有 `reference-input/openai-grid/mirror/`；不提交 HAR、请求头、Cookie。`scripts/import-openai-exact.mjs` 只在重新导入证据时使用，读取源响应、核验 SHA-256 并输出可部署副本。它不会修改原始镜像。`port/manifest.json` 按资源登记原始哈希、产物路径、产物哈希和全部适配规则。

## 验证

```powershell
node scripts/verify-openai-exact.mjs
node scripts/compare-openai-exact.mjs
python scripts/verify-openai-pixels.py
npx playwright test tests/openai-exact.spec.ts
```

对拍需要本机私有参考目录及恢复后的 `replay.har.json`。参考端在原始域名下回放原始字节，测试端访问生产构建；不是两端共同使用改写后的文档。Windows 使用项目已有 Playwright Chromium 实现 skill 的浏览器对拍协议。

1440×1000 和 390×844、DPR 1，各做 4 轮交错采样。12 个状态：两端完整长页、页尾、分享、搜索、导航，以及手机固定目录和展开目录。每个状态的源站自差、本地自差和跨端差异均为 0 个像素。本地受测状态零控制台错误、零资源错误、零外联。报告和首轮截图见 `../../docs/compare/openai-exact/`；其余重复截图保留本机，报告保存全部截图 SHA-256。

这些结论只适用于保存的源站快照、浏览器和受测状态。全站共享 CSS 仍有 69 个未用资源返回 403；参考端未捕获的遥测和其他页面预取请求被明确记录。不能据此宣称全站 GAP=0、完整 Next 源码重建或 skill 全部 L2/L3 验收通过。详细边界和适配账本见 `../../docs/openai-exact.md`。

## 组件保存目录

`components/` 保存 9 个直接提取的原始 DOM 片段：SiteHeader、ArticleHero、ReadingControls、MobileContents、DesktopContents、ArticleProse、AuthorBlock、RelatedArticles、SiteFooter，以及 CSS/脚本依赖清单 `dependencies.json`。复用时必须同时保留祖先容器、主题变量和原版运行时；这些不是脱离依赖便能运行的参数化组件。

`src/components/openai-exact/Document.astro` 是当前复用入口，可在其他 Astro 路由直接导入，不应再套个人博客 Base 布局。结构性拆分须重新对拍，不能混入旧近似版并声称像素一致。

本篇没有评测表格。Terra 页的评测表格需要其对应证据单独复刻；黑底动效按用户指示暂缓。

这是非官方学习复刻。品牌、文章、字体、图片和原版代码归原权利人；本仓库 MIT 许可不覆盖这些内容。对外说明为 `public/_openai/NOTICE.txt`，页面响应附带 noindex 和该声明的 Link 头。
