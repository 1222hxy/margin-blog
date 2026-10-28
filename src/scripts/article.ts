const article = document.querySelector("#article-body");
if (article) {
  const progress = document.querySelector<HTMLElement>("#reading-progress");
  const links = [...document.querySelectorAll<HTMLAnchorElement>(".toc a")];
  const sections = links
    .map((link) => ({
      link,
      section: document.getElementById(decodeURIComponent(link.hash.slice(1))),
    }))
    .filter((item) => item.section);
  let scheduled = false;
  const update = () => {
    scheduled = false;
    const rect = article.getBoundingClientRect();
    const distance = article.scrollHeight - innerHeight;
    const value =
      distance <= 0
        ? rect.bottom <= innerHeight
          ? 1
          : 0
        : Math.max(0, Math.min(1, -rect.top / distance));
    let current = sections[0];
    for (const item of sections) {
      if (item.section!.getBoundingClientRect().top <= 100) current = item;
    }
    if (progress) progress.style.transform = "scaleX(" + value + ")";
    for (const item of sections) {
      if (item === current) item.link.setAttribute("aria-current", "location");
      else item.link.removeAttribute("aria-current");
    }
  };
  const schedule = () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  };
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule);
  new ResizeObserver(schedule).observe(article);
  document.fonts.ready.then(schedule);
  schedule();
  article.querySelectorAll("pre").forEach((pre) => {
    // React owns island descendants before and after hydration.
    if (pre.closest("astro-island")) return;
    const code = pre.querySelector("code");
    if (!code) return;
    const text = code.textContent || "";
    if (pre.dataset.language === "mermaid") {
      const div = document.createElement("div");
      div.className = "mermaid-diagram";
      div.textContent = text;
      pre.replaceWith(div);
      return;
    }
    const btn = document.createElement("button");
    btn.className = "copy-code";
    btn.setAttribute("aria-live", "polite");
    btn.textContent = "复制代码";
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "已复制";
      } catch {
        btn.textContent = "复制失败";
      }
      setTimeout(() => (btn.textContent = "复制代码"), 1800);
    });
    pre.append(btn);
  });
  const diagrams = [
    ...article.querySelectorAll<HTMLElement>(".mermaid-diagram"),
  ]
    .filter((el) => !el.closest("astro-island"))
    .map((el) => ({ el, source: el.textContent || "" }));
  if (diagrams.length) {
    const fallback = (el: HTMLElement, source: string) => {
      const message = document.createElement("p");
      message.textContent = "图表暂时无法显示，以下是源代码。";
      const code = document.createElement("pre");
      code.textContent = source;
      el.replaceChildren(message, code);
      el.removeAttribute("aria-busy");
      delete el.dataset.theme;
    };
    import("mermaid")
      .then(({ default: mermaid }) => {
        const theme = (): "dark" | "default" =>
          document.documentElement.classList.contains("dark")
            ? "dark"
            : "default";
        let desired = theme(),
          revision = 0,
          completed = -1,
          rendering = false;
        const render = async () => {
          if (rendering) return;
          rendering = true;
          try {
            while (completed !== revision) {
              const version = revision,
                currentTheme = desired;
              mermaid.initialize({
                startOnLoad: false,
                securityLevel: "strict",
                theme: currentTheme,
              });
              for (const [index, { el, source }] of diagrams.entries()) {
                if (version !== revision) break;
                el.setAttribute("aria-busy", "true");
                try {
                  const { svg } = await mermaid.render(
                    "diagram-" + version + "-" + index,
                    source,
                  );
                  if (version === revision) {
                    el.innerHTML = svg;
                    el.dataset.theme = currentTheme;
                    el.removeAttribute("aria-busy");
                  }
                } catch {
                  if (version === revision) fallback(el, source);
                }
              }
              completed = version;
            }
          } finally {
            rendering = false;
          }
        };
        new MutationObserver(() => {
          const next = theme();
          if (next !== desired) {
            desired = next;
            revision++;
            void render();
          }
        }).observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["class"],
        });
        void render();
      })
      .catch(() => diagrams.forEach(({ el, source }) => fallback(el, source)));
  }
  article.querySelectorAll("img").forEach((img) => {
    if (img.closest("astro-island")) return;
    const button = document.createElement("button");
    button.type = "button";
    if (img.closest("a, button")) return;
    button.className = "image-zoom";
    button.setAttribute("aria-label", "放大图片：" + img.alt);
    img.replaceWith(button);
    button.append(img);
    if (img.title) {
      const fig = document.createElement("figure");
      button.replaceWith(fig);
      fig.append(button);
      const caption = document.createElement("figcaption");
      caption.textContent = img.title;
      fig.append(caption);
    }
    button.addEventListener("click", () => {
      const dialog = document.createElement("dialog");
      dialog.className = "image-dialog";
      dialog.setAttribute(
        "aria-label",
        img.alt ? "图片预览：" + img.alt : "图片预览",
      );
      const close = document.createElement("button");
      close.textContent = "关闭 ×";
      const clone = img.cloneNode(true);
      dialog.append(close, clone);
      document.body.append(dialog);
      close.onclick = () => dialog.close();
      dialog.addEventListener("close", () => {
        dialog.remove();
        button.focus();
      });
      dialog.showModal();
    });
  });
}
