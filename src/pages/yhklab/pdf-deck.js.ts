import type { APIRoute } from "astro";
import layout from "../../themes/yhklab/components/media-layout.mjs?raw";
import compose from "../../themes/yhklab/components/pdf-components.mjs?raw";
import deck from "../../themes/yhklab/components/pdf-deck.mjs?raw";
import reader from "../../themes/yhklab/components/pdf-reader.mjs?raw";
import page from "../../themes/yhklab/components/pdf-page.mjs?raw";
import rail from "../../themes/yhklab/components/pdf-rail.mjs?raw";
import controls from "../../themes/yhklab/components/pdf-controls.mjs?raw";
import document from "../../themes/yhklab/components/pdf-document.mjs?raw";
import notes from "../../themes/yhklab/components/pdf-notes.mjs?raw";
import interaction from "../../themes/yhklab/components/pdf-interaction.mjs?raw";
import { pdfTransport as runtime } from "../../themes/yhklab/components/pdf-transport";

const definitions = [
  layout,
  compose,
  deck,
  reader,
  page,
  rail,
  controls,
  document,
  notes,
  interaction,
]
  .map((source) => source.replace(/^\s*export function /, "function "))
  .join("\n");

export const GET: APIRoute = () =>
  new Response(
    `(() => {
${definitions}
(globalThis.TURBOPACK ||= []).push([window.document.currentScript, ${runtime.moduleId}, chunk => {
  const document = window.document;
  if (!document.querySelector('link[data-yhklab-deck]')) {
    const style = document.createElement('link');
    style.rel = 'stylesheet'; style.href = '/yhklab/pdf-deck.css'; style.dataset.yhklabDeck = '';
    document.head.append(style);
  }
  const View = createPdfComponents(chunk.i(${runtime.react.id}), { createPdfDeck, createPdfReader, createPdfPage, createPdfRail, createPdfControls, createPdfDocument, createPdfNotes, createPdfInteraction }, { grid: mediaLayout().grid, staging: chunk.i(${runtime.staging.id}).b });
  chunk.s(['default', 0, View]);
}]);
})();`,
    { headers: { "Content-Type": "application/javascript; charset=utf-8" } },
  );
