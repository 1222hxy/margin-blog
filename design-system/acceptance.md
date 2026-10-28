# 深度优化验收记录

验收日期：2026-10-28。部署地址：https://margin-blog.yhl-3ca.workers.dev 。

## 范围与证据

| 要求 | 当前实现与验证 |
| --- | --- |
| Cloudflare Workers 上的个人博客 | wrangler.jsonc 使用 Static Assets；线上主页与文章可访问，未知路径返回 404 |
| Astro、React、Tailwind、shadcn | 配置、依赖、src/components/ui 与生产构建核对；类型检查 0 错误/警告 |
| Markdown、MDX、公式、图表 | 内容构建检查；KaTeX 线上公式截图核对；Mermaid 滚动加载、亮暗重绘、快速切换及加载失败测试 |
| 自定义 TSX 文章 | curve-lab 静态预渲染、状态交互、动态代码复制、搜索和订阅；React 区域不被正文脚本改写 |
| 新主题及旧模板保留 | workspace 默认，study/editorial/terminal 保留；四种主题和三种文章布局在桌面/手机检查溢出 |
| 作者控制字体与主题 | src/config.ts；访客仅可切换亮暗模式。字体浏览器测试涵盖 Anthropic、苹方、MiSans、OPPO、中英文与关闭 JavaScript |
| 字体加载优化 | 只发布压缩子集，完整源字体不部署；实际页面只加载用到的字重；新增正文构建时更新子集 |
| 搜索、标签、归档、项目 | 搜索加载/失败/重试/缓存/键盘测试；全站已发布 HTML 页面内部链接响应检查 |
| RSS、SEO、404 | 线上 RSS、两个 sitemap 200，未知路径 404，canonical 指向正式地址；文章类型、发布时间、JSON-LD 测试 |
| 阅读体验 | 目录当前位置、阅读进度、图片鼠标/键盘打开关闭、代码复制、无 JavaScript 阅读验证 |
| 可访问性 | 默认 workspace 全站手机亮暗模式 axe WCAG 2 A/AA、2.1 AA 自动规则无违规；修正小字对比度与任务复选框名称；自动检查不等同人工无障碍认证 |
| 草稿隔离 | Markdown/TSX 草稿不进入页面、搜索、RSS 或客户端组件代码；产物哨兵扫描 |
| 可维护与交付 | README、设计记录、字体授权说明；GitHub push/PR CI 执行类型、生产构建、内容与浏览器检查；提交推送并部署 |

## 本次验证

- `npm run check`：0 错误、0 警告。
- `npm run build`、`npm run test:content`：通过。
- `CI=true npm test`：15 项测试通过，包含全站路由审查。
- `npm audit --omit=dev`：0 项已知漏洞；安装完整依赖时审计也为 0。
- 数学插件通过 overrides 使用项目现用 KaTeX，避免间接旧版本；数学产物、浏览器与线上截图验证通过。

## 性能抽测

同一台机器 Chromium，390×844，新页面，正常网络，无 CPU/网络限速；等待字体完成并观察 1.5 秒，未滚动。统计 Resource Timing 的 encodedBodySize（资源压缩体积，不含文档与协议开销）。这是单次实验数据，不是用户群体 Core Web Vitals 或 Lighthouse 得分。

| 页面 | 请求数 | 资源体积 | 初始观察窗口布局位移总和 |
| --- | ---: | ---: | ---: |
| 首页 | 10 | 294 KB | 0 |
| 随笔 | 12 | 385 KB | 0 |
| 公式文章，优化前 | 45 | 1,100 KB | 0 |
| 公式文章，图表延迟加载后 | 15 | 461 KB | 0 |

公式文章首屏资源减少约 58%，Mermaid 未提前请求；滚动到图表后线上渲染通过。图表本身仍需下载渲染库，延迟加载改变的是加载时机。

## 已明确的使用边界

- 姓名与示例文章是可替换占位内容，正式个人资料由作者在配置和文章目录编辑。
- 当前部署通过本地 Wrangler 完成，GitHub CI 已配置；README 中的 Cloudflare Git 自动部署连接步骤是可选设置，不表示已绑定。
- TSX 注册表当前共用发布组件入口；新增/删除文章或修改 draft 后重启开发服务器。图片和图表等自定义 TSX 交互由 React 组件自行管理。
- 专有字体不属于代码 MIT 授权，具体来源和用户提供的授权说明保留在 THIRD_PARTY.md 与 README。
