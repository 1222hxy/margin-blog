export function createVideoSettings(
  { createElement: h, useEffect, useRef, useState },
  IconButton,
) {
  const menuClass =
    "absolute inset-e-0 bottom-8 flex min-w-32.5 flex-col rounded-md bg-primary-80 px-1 py-2 backdrop-blur-3xl";
  const itemClass = "p-2 text-start text-secondary-100";
  const rowClass = "flex justify-between leading-none rtl:flex-row-reverse";
  const speedLabel = (value) => `${value}x`;

  return function VideoSettings({ src, id, player }) {
    const container = useRef(null);
    const [open, setOpen] = useState(false),
      [speedMenu, setSpeedMenu] = useState(false),
      [copied, setCopied] = useState(false);
    const [clipboard, setClipboard] = useState(false);
    function close() {
      setOpen(false);
      setSpeedMenu(false);
      setCopied(false);
    }
    useEffect(() => {
      setClipboard(!!navigator.clipboard);
      if (!open) return;
      const outside = (event) => {
        if (!container.current?.contains(event.target)) close();
      };
      const escape = (event) => {
        if (event.key === "Escape") close();
      };
      document.addEventListener("click", outside);
      window.addEventListener("keydown", escape);
      return () => {
        document.removeEventListener("click", outside);
        window.removeEventListener("keydown", escape);
      };
    }, [open]);
    async function copy() {
      const url = new URL(location.href);
      url.searchParams.set("video", encodeURIComponent(id));
      try {
        await navigator.clipboard.writeText(url.href);
        setCopied(true);
      } catch {}
    }
    const button = (content, onClick, key) =>
      h(
        "button",
        { type: "button", className: itemClass, onClick, key },
        content,
      );
    const speed = (onClick, back = false) =>
      button(
        h(
          "div",
          { className: rowClass },
          back
            ? h(
                "svg",
                {
                  width: 10,
                  viewBox: "0 0 16 16",
                  style: { aspectRatio: "12 / 16" },
                  className: "rtl:-scale-inline-100",
                },
                h("use", {
                  href: "/icons/cms/27bb77900ed6df73/arrow-left-lg.svg#size-16",
                  width: 16,
                  height: 16,
                }),
              )
            : null,
          "播放速度",
          h(
            "span",
            { className: "ms-1 text-secondary-44" },
            speedLabel(player.speed),
          ),
        ),
        onClick,
        "speed",
      );
    return h(
      "div",
      { className: "relative flex-initial", ref: container },
      open
        ? h(
            "div",
            { className: menuClass },
            speedMenu
              ? [
                  speed(() => setSpeedMenu(false), true),
                  ...[0.5, 1, 1.5, 2].map((rate) =>
                    button(
                      h(
                        "div",
                        { className: "flex leading-none rtl:flex-row-reverse" },
                        speedLabel(rate),
                      ),
                      () => {
                        player.setRate(rate);
                        setSpeedMenu(false);
                      },
                      rate,
                    ),
                  ),
                ]
              : [
                  speed(() => setSpeedMenu(true)),
                  h(
                    "a",
                    {
                      key: "download",
                      href: src,
                      target: "_blank",
                      rel: "noopener noreferrer",
                      download: src.split("/").at(-1),
                      className: itemClass + " rtl:text-end",
                    },
                    "下载视频",
                    h("span", { className: "sr-only" }, "（在新窗口中打开）"),
                  ),
                  clipboard
                    ? button(
                        h(
                          "div",
                          { className: "flex rtl:flex-row-reverse" },
                          copied ? "已复制链接" : "复制链接",
                        ),
                        copy,
                        "copy",
                      )
                    : null,
                ],
          )
        : null,
      h(IconButton, {
        icon: "ellipsis-horizontal",
        label: "视频设置",
        expanded: open,
        onClick: () => {
          if (open) close();
          else setOpen(true);
        },
      }),
    );
  };
}
