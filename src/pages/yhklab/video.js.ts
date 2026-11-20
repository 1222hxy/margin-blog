import type { APIRoute } from "astro";
import icons from "../../themes/yhklab/components/video-icons.mjs?raw";
import settings from "../../themes/yhklab/components/video-settings.mjs?raw";
import controls from "../../themes/yhklab/components/video-controls.mjs?raw";
import player from "../../themes/yhklab/components/video-player.mjs?raw";
import layout from "../../themes/yhklab/components/media-layout.mjs?raw";
import caption from "../../themes/yhklab/components/media-caption.mjs?raw";
import state from "../../themes/yhklab/components/video-player-state.mjs?raw";
import view from "../../themes/yhklab/components/video-view.mjs?raw";
import { videoTransport as runtime } from "../../themes/yhklab/components/video-transport";

const definitions = [
  icons,
  settings,
  controls,
  state,
  player,
  caption,
  layout,
  view,
]
  .map((source) => source.replace(/^\s*export function /, "function "))
  .join("\n");

export const GET: APIRoute = () =>
  new Response(
    `(() => {
${definitions}
(globalThis.TURBOPACK ||= []).push([document.currentScript, ${runtime.moduleId}, chunk => {
  const react = chunk.i(${runtime.react.id});
  const icons = createVideoIcons(react);
  const View = createVideoView(react, {
    MediaCaption: createMediaCaption(react),
    layout: mediaLayout(),
    Player: createVideoPlayer(react, createVideoState(react),
      createVideoControls(react, icons, createVideoSettings(react, icons.IconButton))),
    useOverlay: chunk.i(${runtime.overlay.id}).useOverlayContext,
    createPortal: chunk.i(${runtime.reactDom.id}).createPortal,
    staging: chunk.i(${runtime.staging.id}).b,
  });
  chunk.s(['default', 0, View]);
}]);
})();`,
    { headers: { "Content-Type": "application/javascript; charset=utf-8" } },
  );
