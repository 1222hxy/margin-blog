import type { APIRoute } from "astro";
import layout from "../../themes/yhklab/components/media-layout.mjs?raw";
import view from "../../themes/yhklab/components/embed-view.mjs?raw";
import { embedTransport as runtime } from "../../themes/yhklab/components/embed-transport";

const definitions = [layout, view]
  .map((source) => source.replace(/^\s*export function /, "function "))
  .join("\n");

export const GET: APIRoute = () =>
  new Response(
    `(() => {
${definitions}
(globalThis.TURBOPACK ||= []).push([document.currentScript, ${runtime.moduleId}, chunk => {
  chunk.s(['default', 0, createEmbedView(chunk.i(${runtime.react.id}), mediaLayout())]);
}]);
})();`,
    { headers: { "Content-Type": "application/javascript; charset=utf-8" } },
  );
