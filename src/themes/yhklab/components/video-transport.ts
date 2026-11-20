import { tabsDependencies } from "./tabs-transport";

export const videoTransport = {
  flightId: "110004",
  moduleId: 1900000094,
  url: "/yhklab/video.js",
  react: tabsDependencies.react,
  reactDom: { chunk: tabsDependencies.react.chunk, id: 583756 },
  staging: tabsDependencies.staging,
  overlay: {
    chunk: "/_next/static/immutable/chunks/19x67mkx356f0.js",
    id: 167199,
  },
} as const;
