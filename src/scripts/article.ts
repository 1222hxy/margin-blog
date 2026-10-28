const article = document.querySelector("#article-body");
if (article) {
  const update = () => {
    const rect = article.getBoundingClientRect();
    const distance = Math.max(1, article.scrollHeight - innerHeight);
    const value = Math.max(0, Math.min(1, -rect.top / distance));
    const bar = document.querySelector<HTMLElement>("#reading-progress");
    if (bar) bar.style.width = value * 100 + "%";
  };
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
  update();
  article.querySelectorAll("pre").forEach((pre) => {
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
    const button = document.createElement("button");
    button.type = "button";
    button.style.display = "contents";
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
