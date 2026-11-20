import type { APIRoute } from "astro";
import card from "../../themes/yhklab/components/testimonial-card.mjs?raw";
import controls from "../../themes/yhklab/components/testimonial-controls.mjs?raw";
import state from "../../themes/yhklab/components/testimonial-state.mjs?raw";
import view from "../../themes/yhklab/components/testimonial-view.mjs?raw";
import { testimonialTransport as runtime } from "../../themes/yhklab/components/testimonial-transport";

const declarations = [card, controls, state, view]
  .map((source) => source.replace(/^\s*export function /, "function "))
  .join("\n");

export const GET: APIRoute = () =>
  new Response(
    `(() => {
${declarations}
(globalThis.TURBOPACK ||= []).push([document.currentScript, ${runtime.moduleId}, chunk => {
  const react = chunk.i(${runtime.react.id});
  const cards = createTestimonialCard(react);
  const view = createTestimonialView(react, {
    cards,
    controls: createTestimonialControls(react, cards),
    useCarouselState: createTestimonialState(react),
  });
  chunk.s(['default', 0, view]);
}]);
})();`,
    { headers: { "Content-Type": "application/javascript; charset=utf-8" } },
  );
