export function createVideoView(
  { createElement: h, useContext, useEffect, useRef, useState },
  {
    Player,
    MediaCaption,
    layout,
    useOverlay = () => ({}),
    staging,
    createPortal,
  },
) {
  const { grid, wide, center, figureContent, anchor } = layout;
  const mobileQuery = "(max-width: 767px)";

  // React has no provider on SSR, but the archive shell provides this same
  // context to every staged tabs panel in the browser.
  const useStaging = staging ? () => useContext(staging) : () => undefined;
  return function VideoView(props) {
    const overlay = useOverlay();
    const figure = useRef(null);
    const staged = useStaging()?.staged ?? false;
    const {
      id,
      caption,
      captionStyle,
      captionLink,
      width = "wide",
      ratio = "16/9",
      mobileRatio = ratio,
    } = props;
    const [portrait, setPortrait] = useState(false),
      [requested, setRequested] = useState(false);
    useEffect(() => {
      const media = matchMedia(mobileQuery);
      const update = () => setPortrait(media.matches);
      update();
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }, []);
    useEffect(() => {
      if (staged || !overlay.setModalActive) return;
      if (
        new URLSearchParams(location.search).get("video") !==
        encodeURIComponent(id)
      )
        return;
      setRequested(true);
      overlay.setModalActive(true);
    }, [id, staged, overlay.setModalActive]);
    const aspectRatio = portrait ? mobileRatio : ratio;
    const portal =
      requested && overlay.modalActive && createPortal
        ? document.getElementById("modal-portal")
        : null;
    useEffect(() => {
      if (!portal) return;
      const dialog = portal.closest("dialog");
      const closed = () => {
        setRequested(false);
        if (document.activeElement === document.body)
          figure.current
            ?.querySelector("button")
            ?.focus({ preventScroll: true });
      };
      dialog?.addEventListener("close", closed);
      return () => dialog?.removeEventListener("close", closed);
    }, [portal]);
    const player = h(
      "div",
      { className: "@container w-full" },
      h(
        "div",
        {
          "data-video-container": true,
          className:
            "relative w-full toc-collision-target rounded-md bg-background",
          style: { aspectRatio },
        },
        h(Player, { props, disabled: staged || !!portal }),
      ),
    );
    const media = props.portraitFrame
      ? h(
          "div",
          {
            className:
              "flex aspect-9/16 w-full justify-center overflow-hidden rounded-md border border-primary-12 bg-black md:aspect-video",
          },
          h(
            "div",
            {
              className:
                "@container/portrait-video aspect-9/16 h-full [&_:fullscreen_:is(video,img)]:object-contain **:[:fullscreen]:@container/portrait-video",
            },
            player,
          ),
        )
      : player;
    return h(
      "div",
      { className: "group col-span-full not-first:mt-16 not-last:mb-16" },
      h(
        "figure",
        {
          id,
          ref: figure,
          className: `max-w-container @container w-full ${grid} ${anchor}`,
        },
        h(
          "div",
          {
            "data-tabs-autoplay-content": true,
            className: `col-span-full flex min-h-0 flex-col gap-6 ${width === "wide" ? wide : center}`,
          },
          h(
            "div",
            { "data-figure-content": true, className: figureContent },
            media,
          ),
          caption && captionStyle === "media"
            ? h(MediaCaption, { caption, link: captionLink })
            : null,
        ),
        caption && captionStyle !== "media"
          ? h(
              "figcaption",
              {
                className: `${width === "wide" ? wide : center} mt-4 text-caption text-primary-60`,
              },
              caption,
            )
          : null,
      ),
      portal
        ? createPortal(
            h(
              "div",
              { className: `${grid} w-full` },
              h(
                "div",
                { className: `${center} px-5` },
                h(
                  "div",
                  {
                    className: "relative w-full bg-background rounded-md",
                    style: { aspectRatio },
                  },
                  h(Player, { props, disabled: false }),
                ),
              ),
            ),
            portal,
          )
        : null,
    );
  };
}
