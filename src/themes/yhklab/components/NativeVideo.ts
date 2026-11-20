import React from "react";
import { renderToString } from "react-dom/server";
import type { NativeComponent } from "../../openai/types";
import { mediaLayout } from "./media-layout.mjs";
import { createMediaCaption } from "./media-caption.mjs";
import { createVideoControls } from "./video-controls.mjs";
import { createVideoIcons } from "./video-icons.mjs";
import { createVideoPlayer } from "./video-player.mjs";
import { createVideoState } from "./video-player-state.mjs";
import { createVideoSettings } from "./video-settings.mjs";
import { createVideoView } from "./video-view.mjs";
import { videoTransport as flight } from "./video-transport";

export interface VideoItem {
  id: string;
  src: string;
  poster?: string;
  label: string;
  caption?: string;
  captionStyle?: "media";
  captionLink?: { href: string; label: string };
  ratio?: string;
  mobileRatio?: string;
  autoplay?: boolean;
  loop?: boolean;
  keyline?: boolean;
  portraitFrame?: boolean;
  width?: "wide" | "center";
}

const icons = createVideoIcons(React);
const View = createVideoView(React, {
  MediaCaption: createMediaCaption(React),
  layout: mediaLayout(),
  staging: undefined,
  createPortal: undefined,
  Player: createVideoPlayer(
    React,
    createVideoState(React),
    createVideoControls(
      React,
      icons,
      createVideoSettings(React, icons.IconButton),
    ),
  ),
});
const dependencyChunks = [
  ...new Set([
    flight.react.chunk,
    flight.reactDom.chunk,
    flight.staging.chunk,
    flight.overlay.chunk,
  ]),
];

export function nativeVideo(item: VideoItem): NativeComponent {
  if (!/^[a-z][a-z0-9-]*$/.test(item.id))
    throw new Error("Expected a video anchor ID.");
  return {
    id: item.id,
    html: renderToString(React.createElement(View, item)),
    model: [
      "$",
      "$L" + flight.flightId,
      null,
      Object.fromEntries(
        Object.entries(item).map(([key, value]) => [
          key,
          typeof value === "string" && value.startsWith("$")
            ? "$" + value
            : value,
        ]),
      ),
    ],
    modules: [
      {
        id: flight.flightId,
        value: [flight.moduleId, [...dependencyChunks, flight.url], "default"],
      },
    ],
  };
}
