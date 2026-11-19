import React from "react";
import { renderToString } from "react-dom/server";
import { createArticleTabs } from "./article-tabs.mjs";
import {
  tabsChunkId,
  tabsChunkUrl,
  tabsDependencies,
  tabsFlightId,
} from "./tabs-transport";
import tokens from "../../openai/native/tokens.json";
import { expandComponents, htmlModel } from "../../openai/lib/native";
import { escapeHtml } from "../../openai/lib/html";
import type { NativeComponent } from "../../openai/types";

export interface TabItem {
  id: string;
  label: string;
  html: string;
}
interface MarkdownTabsOptions {
  id: string;
  items: readonly TabItem[];
  components?: Record<string, NativeComponent>;
}

const ArticleTabs = createArticleTabs(React);
const chunks = [
  ...Object.values(tabsDependencies).map(({ chunk }) => chunk),
  tabsChunkUrl,
];
const flightString = (s: string) => (s.startsWith("$") ? "$" + s : s);

export function MarkdownTabs({
  id,
  items,
  components = {},
}: MarkdownTabsOptions): NativeComponent {
  if (
    !items.length ||
    new Set(items.map((item) => item.id)).size !== items.length
  ) {
    throw new Error("Tabs need unique items.");
  }
  const panel = (html: string) =>
    `<section class="${escapeHtml(tokens.tabContentGrid)}">${html}</section>`;
  const html = renderToString(
    React.createElement(ArticleTabs, {
      groupId: id,
      items: items.map(({ id, label, html }, index) => ({
        id,
        label,
        ssrHtml:
          index === 0 ? panel(expandComponents(html, components)) : undefined,
      })),
    }),
  );
  return {
    id,
    html,
    model: [
      "$",
      "$L" + tabsFlightId,
      null,
      {
        groupId: flightString(id),
        items: items.map(({ id, label, html }) => ({
          id: flightString(id),
          label: flightString(label),
          content: htmlModel(panel(html), components)[0],
        })),
      },
    ],
    modules: [{ id: tabsFlightId, value: [tabsChunkId, chunks, "default"] }],
  };
}
