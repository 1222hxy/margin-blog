import { nativeVideo, type VideoItem } from "./components/NativeVideo";

const localClip = { src: "/yhklab/path.webm", poster: "/yhklab/graph.svg" };

export function productVideo(key: "intro-video" | "driving-demo") {
  const driving = key === "driving-demo";
  return nativeVideo({
    ...localClip,
    id: `video-${key}`,
    label: "Mock：节点依次连成路径，无音轨",
    caption: "Mock · 无声演示：依次绘出节点与连接。",
    autoplay: driving,
    loop: driving,
    width: driving ? "center" : "wide",
  });
}

type DemoOptions = Pick<
  VideoItem,
  | "caption"
  | "captionLink"
  | "ratio"
  | "mobileRatio"
  | "keyline"
  | "portraitFrame"
> & { poster?: "notes" | "graph" | "matrix" };

export function demoVideo(
  id: string,
  description: string,
  { poster = "graph", ...options }: DemoOptions = {},
) {
  return nativeVideo({
    ...localClip,
    ...options,
    id,
    poster: `/yhklab/${poster}.svg`,
    label: `Mock · ${description}`,
    width: "center",
    captionStyle: "media",
    autoplay: true,
    loop: true,
  });
}
