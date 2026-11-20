export function createVideoControls(
  { createElement: h },
  { LargePlay, IconButton },
  VideoSettings,
) {
  const gradient =
    "linear-gradient(to top, hsla(0, 0%, 0%, 0.5) 0%, hsla(0, 0%, 0%, 0.494) 8.1%, hsla(0, 0%, 0%, 0.476) 15.5%, hsla(0, 0%, 0%, 0.448) 22.5%, hsla(0, 0%, 0%, 0.413) 29%, hsla(0, 0%, 0%, 0.371) 35.3%, hsla(0, 0%, 0%, 0.324) 41.2%, hsla(0, 0%, 0%, 0.275) 47.1%, hsla(0, 0%, 0%, 0.225) 52.9%, hsla(0, 0%, 0%, 0.176) 58.8%, hsla(0, 0%, 0%, 0.129) 64.7%, hsla(0, 0%, 0%, 0.087) 71%, hsla(0, 0%, 0%, 0.052) 77.5%, hsla(0, 0%, 0%, 0.024) 84.5%, hsla(0, 0%, 0%, 0.006) 91.9%, hsla(0, 0%, 0%, 0) 100%)";
  const rail =
    "bg-white-40 relative h-2 w-full cursor-pointer overflow-hidden rounded-md";
  const keyboard =
    " outline-offset-2 outline-primary-44 focus-visible:outline focus-visible:outline-offset-0";
  const time = (seconds) =>
    [Math.floor(seconds / 60), Math.floor(seconds % 60)]
      .map((n) => String(n).padStart(2, "0"))
      .join(":");
  const cell = (content) => h("div", { className: "flex-initial" }, content);

  function Progress({ player, mobile = false }) {
    return h(
      "div",
      {
        className: rail + (mobile ? "" : keyboard),
        tabIndex: mobile ? undefined : 0,
        ...(mobile
          ? {}
          : {
              role: "slider",
              "aria-label": "播放进度",
              "aria-valuemin": 0,
              "aria-valuemax": player.duration,
              "aria-valuenow": player.current,
            }),
        onClick(event) {
          const rect = event.currentTarget.getBoundingClientRect();
          if (rect.width)
            player.seek(
              ((event.clientX - rect.left) / rect.width) * player.duration,
            );
        },
        onKeyUp(event) {
          if (mobile) return;
          if (event.key === "ArrowLeft") player.seek(player.current - 5);
          if (event.key === "ArrowRight") player.seek(player.current + 5);
        },
      },
      h("div", {
        className: "h-2 bg-white-100",
        style: {
          width: `${player.duration > 0 ? (100 * player.current) / player.duration : 0}%`,
        },
      }),
    );
  }

  return function VideoControls({ player, id, src }) {
    const { playing, visible, started, current, duration } = player;
    const playbackLabel = playing ? "暂停视频" : "播放视频";
    const pointer = visible ? " pointer-events-auto" : "";
    return [
      h(
        "button",
        {
          key: "playback",
          "aria-label": playbackLabel,
          type: "button",
          onClick: player.toggle,
          className: `absolute inset-0 z-1 flex size-full items-center justify-center text-white-100 transition-opacity duration-500 ease-in-out ${visible || !started ? "opacity-100" : "opacity-0"}`,
        },
        h(LargePlay, { playing }),
      ),
      h(
        "div",
        {
          key: "controls",
          style: { background: gradient },
          className: `text-gray-0 pointer-events-none absolute inset-x-0 bottom-0 z-1 flex flex-col items-center justify-between gap-3 p-2 text-cta transition-opacity duration-medium ease-in-out md:p-5 @max-2xs/portrait-video:p-2 ${visible ? "opacity-100" : "opacity-0"}`,
        },
        h(
          "div",
          { className: "flex w-full md:hidden" + pointer },
          started ? h(Progress, { player, mobile: true }) : null,
        ),
        h(
          "div",
          {
            className: `w-full items-center justify-start gap-4 text-secondary-100 @max-2xs/portrait-video:flex-wrap @max-2xs/portrait-video:justify-between @max-2xs/portrait-video:gap-1 ${started ? "flex md:flex" : "hidden md:flex"}${pointer}`,
          },
          cell(
            h(IconButton, {
              icon: playing ? "pause-sm-fill" : "play-sm-fill",
              label: playbackLabel,
              onClick: player.toggle,
            }),
          ),
          cell(
            h(
              "p",
              { className: "text-white-100 tabular-nums" },
              time(current),
              duration
                ? h(
                    "span",
                    {
                      className:
                        "text-white-40 ms-1 before:me-1 before:content-['|']",
                    },
                    time(duration),
                  )
                : null,
            ),
          ),
          h(
            "div",
            {
              className:
                "flex-1" +
                (started ? " md:@max-2xs/portrait-video:basis-full" : ""),
            },
            h(
              "div",
              { className: "hidden md:block" },
              started ? h(Progress, { player }) : null,
            ),
          ),
          cell(
            started
              ? h(IconButton, {
                  icon: player.muted ? "speaker-muted" : "speaker-playing",
                  label: player.muted ? "取消视频静音" : "视频静音",
                  onClick: player.toggleMute,
                })
              : null,
          ),
          cell(
            h(IconButton, {
              icon: player.fullscreen
                ? "collapse"
                : "arrow-up-right-arrow-down-left-md",
              label: "全屏",
              onClick: player.toggleFullscreen,
            }),
          ),
          h(VideoSettings, { src, id, player }),
        ),
      ),
    ];
  };
}
