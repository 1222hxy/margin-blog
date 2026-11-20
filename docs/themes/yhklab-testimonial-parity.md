# YhkLab 引语卡片与轮播

产品页的「读者评价轮播」和「单条引语」共享同一套源码。原有三条读者评价、单条编辑手记及 `Mock` 标记全部保留。博客顶部导航、产品动态首屏、页脚及全局样式不在本次修改范围内。

## 在 Markdown 里使用

```markdown
::::testimonials[Mock · 读者评价]
:::testimonial[记录者]{by="Mock · 记录者"}
正文支持 **强调**、`代码`、[链接](/)和行内数学 $k/N$。

也可以写第二段。
:::
:::testimonial[复核者]{by="Mock · 复核者"}
保留原始数值，才能解释两个版本为什么不同。
:::
::::
```

- `testimonials` 的方括号标题可省略。每个 `testimonial` 都要有方括号标签和至少一段正文；`by` 可选。
- `image` 和 `trigger-logo` 可引用站内资源；`alt` 描述 `image`；`display` 可选 `logo` 或 `avatar`。
- 一条时显示独立卡片；两条时窄屏轮播、从 768 CSS px 起分栏；更多条时保留原版计数、箭头、可滑动轨道和文本或标志触发器。
- Markdown 编译器先检查结构、媒体路径和内联语法，渲染时使用相同的服务端和浏览器组件，不接受原始 HTML 或 JSX。

## 取证与复验

本地原始行为位于 `public/_next/static/immutable/chunks/3yay5oxmedkq2.js`，模块 `237454`。用仓库 Prettier 格式化后，3704–3839 行对应卡片及箭头，3840–3989 行对应计数、按键选择、滚动锁和指针位置，3991–4258 行对应双栏、滚动吸附、标签分页和遮罩。`customer-carousel.json` 与 `customer-quote.json` 提供同内容的本地对照。生产代码只用作者的 Markdown 或本地 Mock 数据；没有调用原轮播模块。

```powershell
node scripts/build-yhklab-testimonial-candidate.mjs
$env:YHKLAB_TESTIMONIAL_DIST = '.astro/testimonial-candidate'
npm test -- tests/yhklab-testimonial.spec.ts tests/yhklab-testimonial-markdown.spec.ts
```

对比 390、768、1440 CSS px 下的四个轮播状态及单张卡片，使用同一份引语和图片。画面在箭头图标范围外要求逐像素一致；两枚外链 SVG 箭头仅允许最多 6/255 的通道抗锯齿差，仍校验图标已真实加载。另测实际产品 Mock、键盘选择、滚动位置、首尾按钮和 Markdown 的富文本与响应式分栏。
