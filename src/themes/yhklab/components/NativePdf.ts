import React from "react";
import { renderToString } from "react-dom/server";
import type { NativeComponent } from "../../openai/types";
import { mediaLayout } from "./media-layout.mjs";
import { createPdfComponents } from "./pdf-components.mjs";
import { createPdfDeck } from "./pdf-deck.mjs";
import { createPdfReader } from "./pdf-reader.mjs";
import { createPdfPage } from "./pdf-page.mjs";
import { createPdfRail } from "./pdf-rail.mjs";
import { createPdfControls } from "./pdf-controls.mjs";
import { createPdfDocument } from "./pdf-document.mjs";
import { createPdfNotes } from "./pdf-notes.mjs";
import { createPdfInteraction } from "./pdf-interaction.mjs";
import { pdfTransport as flight } from "./pdf-transport";

export interface PdfItem {
  id: string;
  src: string;
  title: string;
  poster?: string;
  ratio?: string;
  fill?: boolean;
  initialSlide?: number;
  defaultThumbnails?: boolean;
  thumbnails?: boolean;
  allowFullscreen?: boolean;
}

const View = createPdfComponents(
  React,
  {
    createPdfDeck,
    createPdfReader,
    createPdfPage,
    createPdfRail,
    createPdfControls,
    createPdfDocument,
    createPdfNotes,
    createPdfInteraction,
  },
  { grid: mediaLayout().grid, staging: undefined },
);

export function nativePdf(item: PdfItem): NativeComponent {
  if (!/^[a-z][a-z0-9-]*$/.test(item.id))
    throw Error("Expected a PDF anchor ID.");
  const props = {
    ...item,
    title: item.title.startsWith("$") ? "$" + item.title : item.title,
  };
  return {
    id: item.id,
    html: renderToString(React.createElement(View, item)),
    model: ["$", "$L" + flight.flightId, null, props],
    modules: [
      {
        id: flight.flightId,
        value: [
          flight.moduleId,
          [flight.react.chunk, flight.staging.chunk, flight.url],
          "default",
        ],
      },
    ],
  };
}
