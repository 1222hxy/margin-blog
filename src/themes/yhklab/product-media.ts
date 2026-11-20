import type { NativeComponent } from "../openai/types";
import { MarkdownTabs } from "./components/MarkdownTabs";
import { nativeEmbed } from "./components/NativeEmbed";
import { demoVideo } from "./product-video";

import type { MediaDemoId } from "./media-demo-ids";

const mark = (id: string) =>
  `<template data-openai-component="${id}"></template>`;
const localDemo = (slug: string) => `/yhklab/demos/${slug}/`;

function mediaTabs(
  id: string,
  tabs: [
    slug: string,
    label: string,
    content: NativeComponent,
    isVideo?: boolean,
  ][],
) {
  const components = Object.fromEntries(
    tabs.map(([, , content]) => [content.id, content]),
  );
  const group = MarkdownTabs({
    id,
    components,
    media: true,
    items: tabs.map(([slug, label, content, isVideo]) => ({
      id: `${id}:${slug}:tab`,
      label,
      html: mark(content.id),
      videoId: isVideo === false ? undefined : content.id,
    })),
  });
  return {
    html: mark(group.id),
    components: { ...components, [group.id]: group },
  };
}

export function productMediaDemo(id: MediaDemoId) {
  switch (id) {
    case "mechanical-design":
      return mediaTabs("mechanical-design-examples", [
        [
          "draft",
          "初稿",
          demoVideo("video-structure-draft", "结构演示初稿，无声路径示意", {
            poster: "matrix",
            caption: "Mock · 初稿：用节点和连线把零件关系画出来。",
          }),
        ],
        [
          "review",
          "复核稿",
          demoVideo("video-structure-review", "结构演示复核稿，无声路径示意", {
            ratio: "2/1",
            caption: "Mock · 复核稿：沿连接逐项复查结构。",
          }),
        ],
      ]);
    case "lamp-design":
      return mediaTabs("lamp-design-examples", [
        [
          "design-video",
          "设计视频",
          demoVideo("video-design-process", "设计过程，无声路径示意", {
            ratio: "9/16",
            mobileRatio: "9/16",
            keyline: false,
            portraitFrame: true,
            poster: "matrix",
          }),
        ],
        [
          "lamp-builder",
          "交互预览",
          nativeEmbed({
            id: "embed-design-process",
            src: localDemo("design"),
            title: "Mock · 设计过程交互预览",
            fullscreen: true,
          }),
          false,
        ],
      ]);
    case "interactive-worlds":
      return mediaTabs("frontend-examples", [
        [
          "path",
          "路径场景",
          demoVideo("video-scene-path", "路径场景，无声节点示意", {
            caption: "Mock · 沿连线回放记录顺序。",
            captionLink: { href: localDemo("path"), label: "打开路径场景" },
          }),
        ],
        [
          "nodes",
          "节点场景",
          demoVideo("video-scene-nodes", "节点场景，无声节点示意", {
            poster: "matrix",
            caption: "Mock · 在场景里调整显示的节点数。",
            captionLink: { href: localDemo("nodes"), label: "打开节点场景" },
          }),
        ],
      ]);
    case "web-design":
    case "cad-showcase": {
      const video = demoVideo(
        `video-${id}`,
        id === "web-design"
          ? "页面设计，无声路径示意"
          : "几何展示，无声路径示意",
        { poster: id === "web-design" ? "notes" : "matrix" },
      );
      return { html: mark(video.id), components: { [video.id]: video } };
    }
  }
}
