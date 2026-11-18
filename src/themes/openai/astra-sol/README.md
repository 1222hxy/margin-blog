# Astra / Sol：文章与组件

来源为用户提供的 `openai2.com.har` 中的中文文章《推出 GPT-6.2 Astra 和 Sol》。完整文章 `/themes/openai/astra-sol/`，组件目录 `/themes/openai/astra-sol/components/`。原博客首页不变。

## 在另一篇页面中组合控件

`catalog.ts` 提供 23 个可独立取用的组件，包括动态刊头、带图例和坐标轴的评测图、科学评测切换、文档/幻灯片对照、引语轮播和视频。各自的 HTML、React 数据和模块依赖在 `components/*.json`。使用这一版的 `ComponentPage.astro`，它提供匹配的布局、样式和客户端运行时。每次调用 `launchComponent` 都返回一份独立副本。原版控件带固定锚点；一页内请勿重复放置同一实例。

```astro
---
import Page from '../themes/openai/astra-sol/ComponentPage.astro';
import { launchComponent } from '../themes/openai/astra-sol/catalog';
const blocks = [launchComponent('science-benchmarks'), launchComponent('customer-carousel')];
---
<Page title="评测与反馈" components={blocks} />
```

自定义评测图用 `benchmarkChart({ id, caption, spec })`。`spec` 是作者提供的可信 Vega-Lite 图表规格，可指定数据、指标、坐标轴、图例与图型。无需改压缩脚本或手绘 SVG。最小可运行例子在 `src/pages/themes/openai/astra-sol/components/custom-chart.astro`。工作簿/幻灯片示例保持原始文档预览和源数据，未将 PDF 转成伪表格。

## 提取和验证

- `node scripts/import-astra-sol.mjs D:/Downloads/openai2.com.har` 读取指定公开页面的 HTML、静态文件和原始 Flight 数据；不复制请求头、Cookie、分析或个性化接口。默认构建不需要 HAR。缺少的文中图片和 PDF 从原文直接引用的公开地址补齐。既有公共资产须字节相等才可复用。
- `manifest.json` 记录原始/部署文档 SHA-256、组件源区间、模块号、292 个静态文件及哈希。普通正文共 69 块，按 HTML 边界与 Flight 行 `1bf` 中的块一一关联；动态刊头单独来自行 `47` 中的原生客户端组件。
- 完整路由保留整个 SSR/Flight 文档。CDN 等长映射、禁止索引和现有非视觉适配器沿用主题约定。一个惰性 MDX 图片原本要求线上 Next 图片优化服务，本地使用此组件内置的直出模式与同张原始栅格图。组件片段展开 React 流式面板并重编号模块引用，保留各自原版控制器。
- `node scripts/verify-astra-sol.mjs` 检查实际构建文档、所有组件路由和静态依赖。`tests/astra-sol.spec.ts` 检查自定义图数据渲染、手机切换到第二张图和引语轮播。`npm run theme:export` 将新页面、组件以及必要公共文件一起导出。
- `node scripts/compare-astra-sol.mjs D:/Downloads/openai2.com.har http://127.0.0.1:4321 artifacts/astra-sol-check 4` 在原域名回放 HAR，与本地生产构建比较。然后运行 `python scripts/verify-astra-sol-pixels.py artifacts/astra-sol-check`。报告在 `docs/themes/astra-sol-pixels.json`。仅验证报告中的状态，不把动态视频帧和 WebGL 动画算作像素一致。

## 未覆盖项

GPU 性能分级依赖 `3ps0nt4uawmll.js`，减少动态效果时使用的首屏静帧为 `hero-still.0m4wm8bk9c5iz.webp`。这两项均不在 HAR 内，直接获取返回 403。正常动效使用原控制器的 GPU 分级回退；缺少静帧时不能保证减少动态效果模式的首屏图像。未用自绘图片或假分数冒充原资源。Vimeo 播放、第三方交互演示依赖外部服务，HAR 不含完整视频流。

此为非官方学习复刻；原文、字体、运行时、媒体、文档及品牌属于原权利人。见 `public/_openai/NOTICE.txt`。

本轮桌面 1440×1000、手机 390×844 各做四轮交错对拍。手机三个状态及桌面引语轮播每轮为 0；桌面评测区域最大 1627 像素、标签条最大 8 像素，参考端重复采样也分别出现同量级差异（评测截图包含画布外侧的固定目录）。没有通过遮罩或替补截图将差异改为 0。完整文章不作整页零差承诺。23 张组件页在浏览器加载后均保留正文；两个交互测试通过。独立导出的 Astro 项目构建成功，所生成文章与博客生产构建逐字节一致。
