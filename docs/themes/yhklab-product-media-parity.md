# YhkLab 产品演示：结构与对照

| 产品页区块 | 本地存档结构 | YhkLab Mock |
| --- | --- | --- |
| 结构演示 | 非固定式双标签；两段视频分别为 `16/9`、`2/1`，各有图注 | 初稿／复核稿，可用方向键切换 |
| 设计过程 | 竖屏视频和网页嵌入双标签；竖屏 `9/16`，桌面套在 `16/9` 的黑色边框内 | 无声视频／可调节点的本地交互预览 |
| 页面设计、几何展示 | 单独的 `16/9` 视频，无 tabs | 各自的本地 Mock 封面和循环视频 |
| 交互场景 | 两段 `16/9` 视频，各自附图注和新窗口链接 | 路径／节点，本地场景页面；复制视频链接可还原所属标签 |

布局证据是 `src/themes/openai/astra-sol/components/{mechanical-design,lamp-design,web-design,cad-showcase,interactive-worlds}.json` 中的媒体比例、图注和标签结构。竖屏外框直接来自 `lamp-design.json` 的静态 model；它与播放器内部的 `9/16` 是两层不同的约束。网页嵌入的容器、响应断点、延迟加载、全屏和退出后的焦点返回来自 `public/_next/static/immutable/chunks/3yay5oxmedkq2.js` 的模块 `332656`（Prettier 格式化后 4661–4899 行）。

生产代码使用自实现的标签、视频和 iframe 组件。外部 Vimeo 内容、原交互网页和外链没有作为 YhkLab 的素材。缺失的全屏图标以仓库内等价图形替代。对照资料保留原布局；拦截原嵌入指向的测试 URL，返回本地测试内容，不访问该外站。对照的是媒体外框与切换行为，不是用户指定 Mock 素材与原演示页面内容的像素一致。

## Markdown 嵌入

```markdown
::embed[Mock 交互预览]{src=/yhklab/demos/nodes/ fullscreen=true}
```

`src` 必须是站内路径，标题用于 iframe 的可访问名称；`fullscreen` 默认为 `false`。自定义 iframe 使用 `sandbox="allow-scripts"`，不授予子页面访问父站同源数据的权限。禁用 JavaScript 时仍有浏览器原生 iframe，外层全屏按钮不显示。Markdown 不开放原始 HTML。

## 对照跑法

```powershell
node scripts/build-yhklab-media-comparison.mjs
$env:YHKLAB_MEDIA_DIST = '.astro/media-comparison'
npm test -- tests/yhklab-product-media-parity.spec.ts tests/yhklab-product-media.spec.ts tests/yhklab-embed-markdown.spec.ts
```

对照路由只在临时构建中存在。实际产品用例另验证方向键切换、退出旧视频、竖屏比例、iframe 控件与全屏焦点，以及分享链接、两处单视频和站内场景链接。文章模板与产品页未涉及的区块做构建产物差异核对（排除 hydration 数据）。
