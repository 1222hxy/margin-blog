import { tabsDependencies } from "./tabs-transport";

export const chartFlightId = "110002";
export const chartChunkId = 1900000092;
export const chartChunkUrl = "/yhklab/article-chart.js";
export const chartDependencies = {
  react: tabsDependencies.react,
  staging: tabsDependencies.staging,
  reactDom: { chunk: tabsDependencies.react.chunk, id: 583756 },
  dropdown: {
    chunk: "/_next/static/immutable/chunks/2x3vcbmon7olg.js",
    id: 883829,
  },
};
