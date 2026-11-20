export function createVideoPlayer(
  { createElement: h },
  useVideoState,
  VideoControls,
) {
  const videoStyle =
    "absolute inset-s-0 top-0 size-full min-w-full object-cover aspect-(--video-aspect-ratio-mobile) @md:aspect-(--video-aspect-ratio)";
  return function Player({ props, disabled }) {
    const {
      src,
      poster,
      id,
      label,
      ratio = "16/9",
      mobileRatio = ratio,
      autoplay = false,
      loop = false,
      keyline = true,
    } = props;
    const player = useVideoState({ autoplay, disabled });
    const style = {
      "--video-aspect-ratio": ratio,
      "--video-aspect-ratio-mobile": mobileRatio,
    };
    const source = src.toLowerCase().split(/[?#]/)[0];
    const type = source.endsWith(".webm")
      ? "video/webm"
      : source.endsWith(".mp4")
        ? "video/mp4"
        : undefined;
    return h(
      "div",
      null,
      h(
        "div",
        {
          dir: "ltr",
          "data-badge-controls":
            player.ready && player.visible
              ? player.started
                ? "all"
                : "desktop"
              : undefined,
          tabIndex: player.ready ? 0 : undefined,
          className:
            "group relative flex size-full overflow-hidden outline-none rounded-md bg-background aspect-(--video-aspect-ratio-mobile) md:aspect-(--video-aspect-ratio) lg:aspect-(--video-aspect-ratio)" +
            (keyline ? " border border-primary-12" : ""),
          style,
          ref: player.frame,
          onMouseMove: player.onMouseMove,
          onMouseLeave: player.onMouseLeave,
          onKeyDown: player.onKeyDown,
        },
        h(
          "video",
          {
            ref: player.media,
            "aria-label": label,
            playsInline: true,
            loop,
            muted: player.muted,
            controls: !player.ready,
            poster: player.ready ? undefined : poster,
            className: videoStyle,
            style,
            ...player.video,
          },
          h("source", { src, type }),
          "你的浏览器不支持视频标记。",
        ),
        player.ready && poster
          ? h("img", {
              alt: "",
              loading: "lazy",
              decoding: "async",
              "data-nimg": "fill",
              src: poster,
              className:
                "object-cover object-center " +
                (player.poster
                  ? "animate-fade-in motion-reduce:animate-none"
                  : "pointer-events-none opacity-0"),
              style: {
                position: "absolute",
                height: "100%",
                width: "100%",
                inset: 0,
                color: "transparent",
              },
            })
          : null,
        player.ready ? h(VideoControls, { player, id, src }) : null,
      ),
    );
  };
}
