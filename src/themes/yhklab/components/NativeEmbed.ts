import React from "react";
import { renderToString } from "react-dom/server";
import type { NativeComponent } from "../../openai/types";
import { createEmbedView } from "./embed-view.mjs";
import { mediaLayout } from "./media-layout.mjs";
import { embedTransport as flight } from "./embed-transport";

export interface EmbedItem {
  id: string;
  src: string;
  title: string;
  fullscreen: boolean;
}
const View = createEmbedView(React, mediaLayout());

export function nativeEmbed(item: EmbedItem): NativeComponent {
  if (!/^[a-z][a-z0-9-]*$/.test(item.id))
    throw Error("Expected an embed anchor ID.");
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
        value: [flight.moduleId, [flight.react.chunk, flight.url], "default"],
      },
    ],
  };
}
