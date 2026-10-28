# 页间 · MARGIN

一个内容优先、支持独立主题与文章布局的中文博客。Astro + React + Tailwind CSS + shadcn/ui，部署到 Cloudflare Workers Static Assets。

## 本地运行

需要 Node.js 24。

```sh
npm ci
npm run dev
```

打开 http://127.0.0.1:4321 。`npm run check` 检查类型，`npm run build` 生成 dist，`npm run preview` 预览生产输出。

## 写作

文章放在 `src/content/posts/`，支持 `.md` 和 `.mdx`。文件名就是文章 URL；已发布文章不要随意重命名。

```yaml
---
title: 我的第一篇文章
description: 一句话摘要
date: 2026-10-28
tags: [技术, 随笔]
template: technical
draft: false
---
```

template 可选 standard / technical / journal，省略则使用全站默认布局。cover 可选，使用 public 下的 `/image.svg` 等路径。图片 title 会成为说明文字，例如 `![描述](/image.svg "图片说明")`。草稿不会进入发布页面、搜索、RSS 或站点地图，但公开 GitHub 仓库中的 Markdown 源文件仍然公开，切勿放入私人内容或凭据。

支持 GFM、脚注、数学公式 `$...$` 和 `$$...$$`。MDX 可以导入 React 组件，使用 `client:visible` 等指令加载。数学是 KaTeX 支持的数学语法，不是完整 TeX 编译器。Mermaid 使用 mermaid 围栏代码块。通过围栏的 mermaid 标识识别图表，支持 Mermaid 的图表类型。

项目放在 `src/content/projects/`，包含 title、description、tags，可选 url。个人信息、导航和默认布局集中在 `src/config.ts` 修改。站点名称临时为“页间”，个人名字是明确的占位内容。

## 主题扩展

`src/config.ts` 的 themes 注册主题名称，默认主题由 theme 常量决定，也可设置构建环境变量 BLOG_THEME（study / editorial / terminal）。访客不能切换全站模板，只能切换亮暗模式。

`src/styles/global.css` 中的 `data-theme` 定义颜色和字体变量，同时映射到 Tailwind 语义颜色。新增主题需提供亮暗两套变量。布局由 `layouts` 注册、文章 `template` 选择，在文章页通过 `layout-*` 类实现。新增结构较大的布局时可提取 Astro 组件，同时保留正文、目录和相关内容接口。未知主题和文章布局会阻止构建。

UI 组件源码在 `src/components/ui/`，通过官方 shadcn CLI 生成后按项目调整，支持继续 `npx shadcn@latest add ...`。正文使用静态 HTML，搜索用 React/Radix 对话框；Mermaid 仅在文章包含图表时加载。

## Cloudflare 部署

1. 在 GitHub 创建公开仓库，将本项目推送到 main。不要提交凭据。
2. 在 Cloudflare Workers & Pages 中创建 Worker 并连接此 GitHub 仓库，生产分支选 main。
3. 构建命令 `npm run build`；部署命令 `npx wrangler deploy`。静态资源目录由 wrangler.jsonc 的 assets.directory 指向 dist。
4. 将 Worker 名称与 wrangler.jsonc 中 name 保持一致。构建环境设置 Node.js 24，以及 `SITE_URL=https://你的正式域名`（没有自定义域名时可使用 workers.dev 地址）。可选设置 BLOG_THEME。
5. 绑定域名并重新构建，检查 canonical、RSS、sitemap 和未知路径 404。后续推送 main 自动部署。

本地手动部署：先 `npx wrangler login`，设置 SITE_URL 后执行 `npm run deploy`。PowerShell 示例：`$env:SITE_URL='https://你的域名'`。

默认站点地址为 https://margin-blog.yhl-3ca.workers.dev，绑定自定义域名后请设置 SITE_URL。不要把 production 的域名设为 localhost。普通页面由静态资源直接服务，不需要 Worker 脚本。Cloudflare 账户连接、GitHub 仓库与域名需由站点所有者提供。

## 检查

```sh
npm run check
npm run build
npm run test:content
npx playwright install chromium
npm test
npx wrangler deploy --dry-run
```

内容检查覆盖草稿隔离、搜索输出、数学、代码与 404；浏览器测试覆盖九种主题/布局组合的桌面与手机溢出检查、搜索、模式保存、图表、图片弹窗及关闭 JavaScript 后阅读。页面截图在 test-results/。CI 对 push / PR 执行类型、构建和内容检查。

## 授权

代码采用 MIT，见 LICENSE。仓库内提供的示例文章和原创 SVG 也允许按 MIT 使用。你之后发布的个人文章、摄影和其他素材默认保留作者权利，请按需要另行标明授权。shadcn/ui 组件来源及许可见 THIRD_PARTY.md。

## 字体选择

字体由站点作者统一配置，访客没有字体选择入口。在 `src/config.ts` 的 `site.fonts` 中独立设置 body（正文）、heading（标题）、code（代码），提交并部署后所有访客看到同样的配置。默认依次为 anthropic-serif、anthropic-sans、anthropic-mono。可选值见 `src/lib/fonts.ts`，theme 恢复主题默认，sans / serif / mono 使用系统字体。未知标识阻止构建。字体直接输出到静态 HTML，禁用 JavaScript 也生效。中文回退到对应的系统中文字体，公式继续使用 KaTeX。

字体来源：https://github.com/Isilsolme/dsh-anthropic-fonts 。Anthropic 字体不属于本项目 MIT 许可；站点所有者表示已与 Anthropic 沟通取得网页使用许可。该许可不自动授予本项目的复用者，复用时请取得适用授权或移除 public/fonts 下的字体文件与对应选项。

### 苹方 SC

新增字体配置值：
- `pingfang`：苹方中英文。
- `anthropic-sans-pingfang`：Anthropic Sans 英文 + 苹方中文。
- `anthropic-serif-pingfang`：Anthropic Serif 英文 + 苹方中文。

例如在 src/config.ts 中设置 `body: "anthropic-serif-pingfang"`、`heading: "pingfang"`，代码保持 `anthropic-mono`。当前默认配置不变。六个文件按 ExtraLight/Light/Regular/Medium/Bold/Heavy 映射到 CSS 200/300/400/500/600/700；原始文件内字重标记不一致，网页以 CSS 映射为准。WOFF2 文件保留当前博客所需字符，只有选择相应字体并使用其字重时才请求。

来源：https://github.com/shenweiyan/PingFangSC-Fonts 。该仓库没有提供字体授权文件，苹方文件不属于本项目 MIT 许可。

### MiSans 与 OPPO

`misans` 为官网简体 MiSans，`anthropic-serif-misans` 为英文 Anthropic Serif + 中文 MiSans；`oppo` 为 OPPO Sans 4.0。当前默认字体保持不变。

中文字体优化：运行前安装 Python 3 和 `pip install -r requirements-fonts.txt`。npm run dev/build 会先运行字体子集脚本，扫描 src 下文章与界面，保留其中字符及基本拉丁字母、扩展拉丁、数字与标点，生成苹方和 MiSans WOFF2。完整源文件保存在 assets/font-sources，不部署到站点。缺少的字形由系统字体回退。新增内容后重新构建即可更新。Cloudflare Builds 构建命令改为 `pip install -r requirements-fonts.txt && npm run build`，环境需提供 Python 3。

站点所有者表示已沟通允许修改 OPPO 字体，现与苹方、MiSans 一起生成 WOFF2 子集，保留可变字重。原始 OPPO 文件约 22.7 MB，仅存放在构建源目录，不发给访客。所有字体使用 swap，不阻塞文字显示，不预加载未选择的字体。静态字体由浏览器缓存。

## TSX 自定义文章

在 src/content/tsx 下创建同名文件：`my-page.tsx` 默认导出 React 组件，`my-page.json` 写标题、摘要、日期、标签、template、draft、searchText 和 headings。参考 curve-lab 示例。支持 useState 等 React 交互；首次 HTML 已含正文，组件进入视口时激活。

searchText 用于搜索和阅读时间估计，应包含文章正文或充分的文字描述；headings 使用 {depth:2,slug:"section-id",text:"章节标题"}，对应组件里的 h2 id。组件不要再放 h1，文章标题由外层统一渲染。

运行 npm run dev/build/check 时自动生成组件注册表。开发中新增、删除文章或修改 draft 后重启开发服务器；编辑现有 TSX 有热更新。草稿不会注册进客户端代码，也不会进入列表、搜索或 RSS。文章 slug 与 Markdown 不能重复。要增加独立页面（不进入文章列表），可以建立 src/pages/example.astro，导入 Base 和自己的 TSX 组件，通过 client:visible 启用交互。

## 创作者工作台主题

默认使用 workspace，原主题仍可通过 BLOG_THEME=study/editorial/terminal 启用。作者字体继续由 src/config.ts 独立控制，当前使用 MiSans 正文和标题、Anthropic Mono 代码。设计说明在 design-system/workspace.md。

TSX 在服务端预渲染：不要在模块顶层读取 window / document；浏览器 API 放在 useEffect 中。注册表仅导入已发布组件；目前 TSX 文章共用一个按需加载的 React 入口，适合个人博客，未来大量重型实验可进一步拆分入口。

正文的自动代码复制、图片包裹和 Mermaid 替换只处理静态 Markdown，不修改 React island 内的 DOM，以免干扰 hydration 和状态更新。TSX 的这些交互由 React 组件管理。需要可复制代码时，导入 `src/components/ArticleCode`，传入 `code` 字符串和可选的 `language`；复制内容会跟随 props 更新，禁用 JavaScript 时仍显示完整代码。曲线示例展示了实时公式的用法。
