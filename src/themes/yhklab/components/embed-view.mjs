export function createEmbedView(
  { createElement: h, useEffect, useRef, useState },
  { grid, center, figureContent, anchor },
) {
  return function EmbedView({ id, src, title, fullscreen }) {
    const frame = useRef(null),
      control = useRef(null);
    const [supported, setSupported] = useState(false),
      [active, setActive] = useState(false);
    useEffect(() => {
      const viewport = frame.current;
      if (
        !fullscreen ||
        !viewport?.requestFullscreen ||
        !document.fullscreenEnabled
      )
        return;
      setSupported(true);
      let wasActive = false;
      const update = () => {
        const next = document.fullscreenElement === viewport;
        setActive(next);
        if (wasActive && !next) control.current?.focus({ preventScroll: true });
        wasActive = next;
      };
      document.addEventListener("fullscreenchange", update);
      return () => document.removeEventListener("fullscreenchange", update);
    }, [fullscreen]);
    const toggle = async () => {
      try {
        if (active) await document.exitFullscreen();
        else await frame.current?.requestFullscreen();
      } catch {
        setSupported(false);
      }
    };
    const icon = active
      ? h("path", {
          d: "M14 2l-5 5m4.5 0H9V2.5M2 14l5-5m-4.5 0H7v4.5",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: 1.35,
          strokeLinecap: "round",
          strokeLinejoin: "round",
        })
      : h("use", {
          href: "/icons/cms/27bb77900ed6df73/arrow-up-right-arrow-down-left-md.svg#size-16",
          width: 16,
          height: 16,
        });
    const button = supported
      ? h(
          "button",
          {
            ref: control,
            type: "button",
            "aria-label": active ? "退出交互式全屏" : "进入交互式全屏",
            className:
              "ease-curve-a disabled:text-gray-40 items-center justify-center outline-offset-2 duration-200 focus-visible:outline focus-visible:outline-offset-0 flex rounded-full transition size-8 bg-white-100 text-black-100! hover:bg-white-80 focus:bg-white-80 focus:outline-white-44 absolute inset-e-3 top-3 z-1 shadow-sm",
            onClick: toggle,
          },
          h(
            "svg",
            {
              width: 16,
              height: 16,
              className: "size-4",
              viewBox: "0 0 16 16",
              "aria-hidden": true,
            },
            icon,
          ),
        )
      : null;
    return h(
      "div",
      { className: "group col-span-full not-first:mt-16 not-last:mb-16" },
      h(
        "figure",
        {
          id,
          className: `max-w-container @container w-full ${grid} ${anchor}`,
        },
        h(
          "div",
          {
            "data-tabs-autoplay-content": true,
            className: `col-span-full flex min-h-0 flex-col gap-6 ${center}`,
          },
          h(
            "div",
            { "data-figure-content": true, className: figureContent },
            h(
              "div",
              { className: "@container w-full min-w-0" },
              h(
                "div",
                { className: "w-full min-w-0 toc-collision-target" },
                h(
                  "div",
                  {
                    ref: frame,
                    "data-badge-backdrop": "iframe",
                    className:
                      "fullscreen:size-full! fullscreen:min-h-0 fullscreen:rounded-none fullscreen:aspect-auto fullscreen:mb-0 relative mb-2 block aspect-9/16 w-full overflow-hidden border-none bg-background @md:aspect-16/9 min-h-[400px]",
                  },
                  h("iframe", {
                    src,
                    title,
                    className: "absolute inset-0 size-full border-none",
                    style: { aspectRatio: "unset" },
                    loading: "lazy",
                    sandbox: "allow-scripts",
                    allow: fullscreen ? "fullscreen" : undefined,
                    allowFullScreen: fullscreen,
                  }),
                  button,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  };
}
