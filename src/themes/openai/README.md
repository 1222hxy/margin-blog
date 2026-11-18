# OpenAI article theme

已验证文章的可复用衍生主题。原始文档与镜像保持不可变；本目录将其无损分段，并提供同步修改服务端 HTML 与 React Flight 数据的文章接口。默认 `<ArticlePage />` 输出原始已验证文档的全部字节。

## 使用

不要套个人博客的 Base 布局或导入全局 CSS。主题自己携带原版完整文档、字体、样式、断点与客户端控制器。

```astro
---
import ArticlePage from '../themes/openai/ArticlePage.astro';
import { referenceArticle, proseTemplates, paragraph, heading } from '../themes/openai';
const templates = proseTemplates(referenceArticle.bodyHtml);
const article = {
  ...referenceArticle,
  title: '另一篇文章', description: '文章摘要', seoDescription: '文章摘要',
  date: '2026年11月17日', author: '作者', path: '/another-article/',
  canonicalUrl: 'https://example.com/another-article/',
  categories: [{ name: '分类', slug: 'category' }],
  tags: [{ name: '标签', slug: 'tag' }],
  audio: false, related: false,
  headings: [{ text: '第一节', id: 'first', headlineTag: 'h2' as const }],
  bodyHtml: heading('第一节', 'first', templates) + paragraph('文章正文。', templates),
};
---
<ArticlePage article={article} />
```

完整可运行示例在 `src/pages/themes/openai/example.astro`，地址 `/themes/openai/example/`。`ArticleData`、`ArticleHeading` 与 `NativeComponent` 类型由 `index.ts` 导出。`bodyHtml` 接受作者可信 HTML，不接受未清洗的访客输入。

## 组件

`components/` 含 SiteHeader、ArticleHero、ReadingControls、Contents、ArticleProse、AuthorBlock、RelatedArticles、SiteFooter 的渲染接口；手机与桌面目录分别保留原始片段。`blueprint/` 记录 9 个具名组件和 7 个不可丢失的文档间隔，附源偏移与 SHA-256。`lib/render.ts` 负责组合及同步客户端数据。

`Tabs()` 与 `Testimonial()` 来自 Images 2.6 文章的原始 SSR/Flight，保留原版客户端模块。可用 `<template data-openai-component="tabs"></template>` 作为正文插槽，并在 `article.components.tabs` 传入 `Tabs({ id: 'unique-group', items: [{ id: 'unique-item', label: '标签', html: paragraph('内容', templates) }] })`。各标签 id 在页面内必须唯一。正文容器使用源站标签页内原始网格，未添加视觉补偿 CSS。

`Testimonial({ quote, attribution })` 可替换引用和署名；省略参数保留原始 OpenArt 示例。徽标仍是源资产，替换文字不会自动更换徽标。`Tabs()` 无参数保留原始四个品牌的示例，包含原始第三方视频服务；参数化纯文字示例不请求外站。

日期为已格式化字符串；目录 id 必须唯一并与正文锚点一致。`audio: false` 移除朗读挂载，避免新文章播放旧音频。自定义正文若启用旧音频会直接构建失败。`related: false` 可移除原示例的相关阅读。分类的路由规则与未知分类纯文本回退均按原组件实现。

## 提取、验证、导出

在主仓库执行：

```sh
npm run theme:extract
npm run build
npm run theme:verify
npm run theme:export
```

原生新组件重新取证使用 `node scripts/capture-openai-images.mjs D:/Downloads/openai1.com.har`，再执行 `node scripts/extract-openai-native.mjs`。正常构建不需要 HAR。HAR、Cookie、请求头和私人证据不进入导出包。

独立工程生成到 `artifacts/openai-theme/`，只需 Node.js 24，然后运行 `npm install`、`npm run build`、`npm run preview`。不依赖原博客、Python 字体构建、React 集成或 Tailwind 构建。`asset-manifest.json` 保存公共资源哈希；`astro.config.mjs` 的 site 需按自己的地址配置。

## 还原度与边界

默认参考文章要求构建文档字节一致，并通过桌面/手机共 12 个状态、每状态四轮交错像素对拍；结论限定于已保存快照、测试视口与状态。另一篇文章用于证明内容可替换、无 hydration 恢复、原生标签切换和目录可用，不声称它与某个不存在的官网文章逐像素相同。Images 2.6 只提取了上述两个组件，并非整页复刻。

保留 OpenAI 品牌和正文是用户明确要求。此为非官方学习复刻，原文章、品牌、代码、字体与图片归原权利人，不包含在主仓库 MIT 许可中。归属声明见 `public/_openai/NOTICE.txt`；部署应保留 noindex 与该声明。

Astra / Sol 发布页的新组件目录见 [astra-sol/README.md](astra-sol/README.md)，线上路径为 `/themes/openai/astra-sol/components/`，其中包括独立图表、文档对照、轮播和可替换数据的评测图示例。
