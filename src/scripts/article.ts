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
  if (article.querySelector(".mermaid-diagram")) {
    import("mermaid")
      .then(async ({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: document.documentElement.classList.contains("dark")
            ? "dark"
            : "default",
        });
        for (const [i, el] of [
          ...article.querySelectorAll<HTMLElement>(".mermaid-diagram"),
        ].entries()) {
          if (el.closest("astro-island")) continue;
          try {
            const { svg } = await mermaid.render(
              "diagram-" + i,
              el.textContent || "",
            );
            el.innerHTML = svg;
          } catch {
            el.setAttribute("aria-label", "图表渲染失败，显示源代码");
          }
        }
      })
      .catch(() => {});
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
