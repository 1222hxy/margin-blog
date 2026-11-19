import type { APIRoute } from "astro";
import source from "../../themes/yhklab/components/article-tabs.mjs?raw";
import {
  tabsChunkId,
  tabsDependencies as ids,
} from "../../themes/yhklab/components/tabs-transport";

export const GET: APIRoute = () =>
  new Response(
    `(() => {
${source.replace("export function createArticleTabs(", "function createArticleTabs(")}
(globalThis.TURBOPACK ||= []).push([document.currentScript, ${tabsChunkId}, chunk => {
  chunk.s(['default', 0, createArticleTabs(chunk.i(${ids.react.id}), {
    staging: chunk.i(${ids.staging.id}).b,
    analytics: chunk.i(${ids.analytics.id}).f,
  })]);
}]);
})();`,
    { headers: { "Content-Type": "application/javascript; charset=utf-8" } },
  );
