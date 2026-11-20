# Folio PDF 对比：结构与阅读器验收

工作簿和幻灯片对比使用真实的站内双页 Mock PDF；禁用 JavaScript 时保留首屏海报和打开 PDF 的链接。源存档只作为对照，不作为博客的演示数据。

| 对照依据 | 覆盖范围 |
| --- | --- |
| `src/themes/openai/astra-sol/components/workbook-comparison.json` | 说明、四个预渲染标签、双列对比、首个工作簿双说明 |
| `src/themes/openai/astra-sol/components/slide-comparison.json` | 说明、四个预渲染标签、模板匹配的请求气泡及参考图、双列对比和说明 |
| `public/_next/static/immutable/chunks/1xyeqyaxsfifo.js` 模块 `96903` 与同文件 `rf` 页组件 | 控件区、缩略图布局、尺寸计算、页面 CSS 像素与设备像素比 |
| `public/_next/static/immutable/chunks/0e82kju1v28l1.js` 模块 `536925` 的 `S` | `ResizeObserver` 使用 `border-box` 并保留分数高度；适配宽度最后取整 |

`deck-comparison-layout.ts` 使用存档里的网格和气泡类，不新增页面或全局样式。`product-decks.ts` 将站内 PDF、文案和参考图接入该布局。PDF 阅读器与 Markdown 的 `::pdf` 共用实现。

## 校验

按三个视口核对标签内容的网格、备注结构；验证模板参考图实际加载、双列响应、键盘翻页、缩略图、全屏和无脚本回退。画布对照把同一个测试 PDF 注入两套渲染器，对比第二页的每一个画布像素、画布 CSS 尺寸、阅读器和工具栏尺寸。测试文件自带嵌入的 Liberation Sans 字体子集，因为存档阅读器配置没有 CJK CMap 无法用 Folio 自带的 CID 字体渲染中文；站内阅读器的 CJK 输出单独用实际 Mock 工作簿验证。

```powershell
node node_modules/astro/bin/astro.mjs build
node node_modules/astro/bin/astro.mjs preview --host 127.0.0.1 --port 4321
# 在另一个终端运行
node node_modules/@playwright/test/cli.js test tests/yhklab-deck-comparison-layout.spec.ts tests/yhklab-pdf-canvas-parity.spec.ts tests/yhklab-pdf-deck.spec.ts tests/yhklab-product-comparisons.spec.ts
```

如需重建对照 PDF，安装项目 Node 依赖和 Python ReportLab 后运行 `python scripts/generate-yhklab-pdf-fixture.py`。画布对照不覆盖整个阅读器的截图，也不覆盖源站“仅悬停时显示 PDF 注释”变体。
