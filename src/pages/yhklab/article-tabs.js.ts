import type { APIRoute } from "astro";
import source from "../../themes/yhklab/components/article-tabs.mjs?raw";
import autoplay from "../../themes/yhklab/components/tabs-autoplay.mjs?raw";
import deepLink from "../../themes/yhklab/components/tabs-deep-link.mjs?raw";
import {
  tabsChunkId,
  tabsDependencies as ids,
} from "../../themes/yhklab/components/tabs-transport";

export const GET: APIRoute = () =>
  new Response(
    `(() => {
${autoplay.replace(/^export /gm, "")}
${deepLink.replace(/^export /gm, "")}
${source.replace(/^import .*\n|^export /gm, "")}
(globalThis.TURBOPACK ||= []).push([document.currentScript, ${tabsChunkId}, chunk => {
  chunk.s(['default', 0, createArticleTabs(chunk.i(${ids.react.id}), {
    staging: chunk.i(${ids.staging.id}).b,
    analytics: chunk.i(${ids.analytics.id}).f,
  })]);
}]);
})();`,
    { headers: { "Content-Type": "application/javascript; charset=utf-8" } },
  );
