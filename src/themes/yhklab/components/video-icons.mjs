export function createVideoIcons({ createElement: h }) {
  const assetBase = "/icons/cms/27bb77900ed6df73";
  const play =
    "M4.848 4.69a1.167 1.167 0 0 1 1.8-.98l5.125 3.31c.711.46.711 1.5 0 1.96l-5.125 3.31a1.167 1.167 0 0 1-1.8-.98z";
  const pause =
    "M5.9 3.917c.653 0 1.183.53 1.183 1.183v5.8c0 .653-.53 1.184-1.183 1.184H4.767c-.654 0-1.184-.53-1.184-1.184V5.1c0-.653.53-1.183 1.184-1.183zm5.334 0c.653 0 1.183.53 1.183 1.183v5.8c0 .653-.53 1.184-1.183 1.184H10.1c-.654 0-1.184-.53-1.184-1.184V5.1c0-.653.53-1.183 1.184-1.183z";
  const speaker = "M2 6h3l3.5-3v10L5 10H2z";
  const wave = "M10.5 5.25a3.9 3.9 0 0 1 0 5.5m2-7.5a6.8 6.8 0 0 1 0 9.5";
  const slash = "m10.5 6 4 4m0-4-4 4";
  const collapse = "M14 2l-5 5m4.5 0H9V2.5M2 14l5-5m-4.5 0H7v4.5";
  const color = { color: "#fff" };
  const sprite = (name, path = assetBase) =>
    h("use", { href: `${path}/${name}.svg#size-16`, width: 16, height: 16 });
  const path = (d) =>
    h("path", { d, fill: "currentColor", style: { fillOpacity: 1 } });
  const stroke = (d) =>
    h("path", {
      d,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.35,
      strokeLinecap: "round",
      strokeLinejoin: "round",
    });

  function LargePlay({ playing }) {
    return h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: 16,
        height: 16,
        fill: "none",
        viewBox: playing ? "3.134 0.922 9.732 14.156" : "4.445 0.8 8.266 14.4",
        className: "size-[54px] transform-none opacity-90 md:size-20",
      },
      path(playing ? pause : play),
    );
  }
  function IconButton({ icon, label, onClick, expanded }) {
    const art =
      icon === "pause-sm-fill"
        ? sprite(icon, "/icons/cms/a7687e3ce5db398c")
        : icon === "speaker-muted" || icon === "speaker-playing"
          ? [path(speaker), stroke(icon === "speaker-muted" ? slash : wave)]
          : icon === "collapse"
            ? stroke(collapse)
            : sprite(icon);
    return h(
      "button",
      {
        type: "button",
        className:
          "ease-curve-a disabled:text-gray-40 items-center justify-center outline-offset-2 duration-200 focus-visible:outline focus-visible:outline-offset-0 flex rounded-full transition size-6 focus-visible:outline-white-100 text-primary-100 hover:bg-none hover:text-primary-60 hover:[&>svg]:opacity-60",
        "aria-label": label,
        "aria-expanded": expanded,
        onClick,
      },
      h(
        "svg",
        { width: 16, height: 16, viewBox: "0 0 16 16", style: color },
        ...(Array.isArray(art) ? art : [art]),
      ),
    );
  }
  return { LargePlay, IconButton };
}
