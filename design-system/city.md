# 动漫城市主题

默认主题 city：蓝紫暮色、暖灯、城市列车。参考 Fuwari 的插画横幅与文章层次，自行实现页面结构与样式，未复制其图片。

插画由用户电脑的 Grok Build image_gen 生成。源文件 assets/illustrations/anime-city-hero.png；网页使用 public/images 下的 WebP，桌面144KB、手机54KB。

生成提示：Wide 16:9 anime city landscape, elevated view over a Japanese-inspired hillside city at blue hour, lavender dusk sky with peach clouds, warm amber window lights, overhead railway and quiet rooftops, detailed hand-painted anime background, calm nostalgic mood, no text, watermark, logos or recognizable copyrighted characters.

顶部导航、横幅、文章列表、简介与话题。手机使用独立小图与单列布局。正文和标题仍由作者配置 MiSans，代码 Anthropic Mono，访客仅可切换亮暗模式。旧 study/editorial/terminal/workspace 主题保留。

验证：类型检查与构建通过，15项生产浏览器测试通过（全站手机亮暗axe检查、内部链接、五种主题布局检查、搜索、文章交互、字体、TSX、Mermaid延迟加载），桌面/手机首页截图已人工检查。
