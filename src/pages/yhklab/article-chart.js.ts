import type { APIRoute } from "astro";
import source from "../../themes/yhklab/components/article-chart.mjs?raw";
import {
  chartChunkId,
  chartDependencies as ids,
} from "../../themes/yhklab/components/chart-transport";

export const GET: APIRoute = () =>
  new Response(
    `(() => {
${source.replace("export function createArticleChart(", "function createArticleChart(")}
(globalThis.TURBOPACK ||= []).push([document.currentScript, ${chartChunkId}, chunk => {
  const dropdown = chunk.i(${ids.dropdown.id});
  chunk.s(['default', 0, createArticleChart(chunk.i(${ids.react.id}), {
    staging: chunk.i(${ids.staging.id}).b,
    createPortal: chunk.i(${ids.reactDom.id}).createPortal,
    dropdown: { Root: dropdown.F, Trigger: dropdown.d, Portal: dropdown.z, Content: dropdown.c, Item: dropdown.M },
  })]);
}]);
})();`,
    { headers: { "Content-Type": "application/javascript; charset=utf-8" } },
  );
