# 可复用 OpenAI 文章主题

2026-11-17。本次范围是将已验证的电网文章拆成可配置、可导出的衍生主题，并研究用户新增 Images 2.6 HAR 中的组件。参考文章继续是首页；新增示例位于 `/themes/openai/example/`。不是 Images 2.6 整页复刻，也不改变暂缓黑底 Terra 页的安排。

## 不变量与结构

`rebuilds/openai-exact/port/` 和本机 `reference-input/` 保持不可变。`scripts/extract-openai-theme.mjs` 以 parse5 的源位置提取 9 个组件，另保留 7 个文档间隔；按顺序拼接须与不可变文档逐字节相等。各段坐标与 SHA-256 在 `src/themes/openai/blueprint/manifest.json`，无运行时 HTML 重排。

具名组件为 SiteHeader、ArticleHero、ReadingControls、MobileContents、DesktopContents、ArticleProse、AuthorBlock、RelatedArticles、SiteFooter。默认的原始样式、字体、父容器、变量、移动断点和客户端运行时均不更换。`ArticlePage.astro` 是完整文档入口；旧 `Document.astro` 仅转入此主题。

用户要求“可复用”授权本目录的结构化衍生层。`ArticleData` 提供标题、摘要、日期、作者、分类、标签、正文、目录及可选原生组件。它不是只替换 HTML：`lib/render.ts` 同步改写 SSR 和原始内联 React Flight 数据，避免 hydration 把新文章恢复成旧文。默认参数无变动时，Flight、脚本边界、T 记录与整份 HTML 都保持不变。改动后按 UTF-8 字节重新计算 Flight T 记录长度。

## 数据绑定来源

原电网文档的 Flight 行 47 包含文章上下文和目录字典，行 199 包含目录与正文树。保留完整原版外壳，仅为自定义文章替换这些数据。模块 `577549`（`0ojbl80s28w6m.js`）及其依赖 `3m8h_v0urvgfo.js` 决定分类链接映射与未知分类的 span 回退；主题沿用该规则。行 197 挂载 `$L1a9` 朗读控制器；新文章未提供对应音频时必须设 `audio: false` 并移除挂载，防止继续播放旧文章音频。

目录控件仍采用原控制器。接近原版 `toc-collision-target` 标签栏时会隐藏固定目录，点击条目使用平滑滚动且不写 URL hash；测试按这两项源行为验证，而非新增滚动或 URL 补丁。

正文 helper 从源 HTML 中提取段落与 h2 模板。标签页自定义内容外的网格类直接取自 Images 2.6 源标签页中的 section，记录在 `native/tokens.json`。没有自行调整字号、宽度、间距或新增视觉 CSS。

## Images 2.6 组件来源

来源：<https://openai.com/zh-Hans-CN/index/introducing-images-2-6/>。

用户提供的 `D:/Downloads/openai1.com.har` 经 `scripts/capture-openai-images.mjs` 提取匿名公共成功响应；原 HAR、请求头、Cookie 不提交、不导出。私有证据在 `reference-input/openai-images/`。`docs/themes/openai-images-inventory.json` 保存文档哈希、figure/tablist 坐标与边界。

- `Tabs`：源 Flight 行 `1e2`；客户端 `$L1f4` 指向模块 `563091`，源 bundle 为 `0_ejda_ftvsy6.js`。其 `useState(activeTab ?? 0)` 将 activeTab 当数字索引；主题传入 `0`，不是标签 id。保留原按钮状态、键盘操作、面板和控制器。
- `Testimonial`：源 Flight 行 `1d6`；保留源引语、OpenArt 徽标、署名和客户端模块。可选文本替换同步更新 SSR 与模型；不自动换徽标。

源 SSR 标签页初始面板由流末尾 S:n 回填 B:n。提取器按源 `$RC` 的结果物化已完成边界，避免丢失标签内容。Flight 静态引用展开，客户端 I 行重新分配到保留编号区以避免与电网文档冲突；Turbopack 模块编号和源 bundle 保持不变。每个 capsule 保存源 URL、文档 SHA-256、Flight 行、HTML 范围及模块依赖。

`native/assets.json` 记录 244 条公共静态依赖响应，原/本地 SHA-256 分别记录。同名本地资产必须字节相同，否则停止，不覆盖原基准资源。共享 CDN 使用已有等长本地前缀；未增加追踪、挑战脚本或后台服务。完整公共证据仍保存在私有镜像中。

无参数 `Tabs()` 保留四品牌示例中的 Vimeo 外部服务；参数化示例使用可信 HTML，不访问外站。当前不声称第三方视频离线可用、Images 2.6 整页完成、全部共享资源闭包或完整 Next 源码重建。原电网页面既有的 69 个未用资源 403 与登记适配仍见 `docs/openai-exact.md`。

## 验证与交付

`scripts/verify-openai-theme.mjs` 是独立于提取器和渲染器的检查器：校验分段哈希、完整拼接、两个默认路由构建结果、资源哈希、原生模块引用及流式边界。CI 在原版资源检查之后执行它。

`tests/openai-theme.spec.ts` 验证另一篇文章的服务端渲染、hydration 后内容不回退、三个标签页、作者/关闭朗读和相关阅读、手机目录与横向溢出；同时记录客户端异常、错误响应和外联。原版 12 个状态继续用 `compare-openai-exact.mjs` 每状态四轮交错对拍，报告在 `docs/compare/openai-exact/`。

`scripts/export-openai-theme.mjs` 按两个资源账本导出独立 Astro 工程到 `artifacts/openai-theme/`，包含主题、参考路由、可配置示例及 456 个去重公共依赖文件。独立工程只依赖精确版本 Astro 7.4.2、parse5 7.3.0；不依赖原博客布局、内容生成、Python 字体流水线或原仓库 node_modules。导出保留哈希账本和归属声明。

本轮结果：类型检查 70 个文件，0 错误/警告；19 项浏览器测试全部通过；原版 12 状态每端四轮，跨端差异与源站/本地自差均为 0，受测本地状态无异常、资源错误和外联。独立导出工程经独立安装构建成功，其参考文章 HTML 与不可变文档逐字节一致。

版权与部署决定沿用用户先前明确要求：保留原品牌、导航、原文，并安装到博客。保留 noindex 和归属声明 Link 响应头；不添加影响像素的视觉标注。此为登记的非视觉适配，第三方资产不受仓库 MIT 授权覆盖。
