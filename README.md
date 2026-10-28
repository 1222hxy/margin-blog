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
