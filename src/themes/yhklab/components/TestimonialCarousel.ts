import React from "react";
import { renderToString } from "react-dom/server";
import { createTestimonialCard } from "./testimonial-card.mjs";
import { createTestimonialControls } from "./testimonial-controls.mjs";
import { createTestimonialState } from "./testimonial-state.mjs";
import { createTestimonialView } from "./testimonial-view.mjs";
import { testimonialTransport as flight } from "./testimonial-transport";
import type { NativeComponent } from "../../openai/types";

export interface TestimonialItem {
  label: string;
  // HTML is restricted to inline HAST serialized by the trusted Markdown compiler.
  paragraphs: readonly (string | { html: string })[];
  attribution?: string;
  image?: string;
  imageAlt?: string;
  triggerLogo?: string;
  triggerLogoAlt?: string;
  imageDisplay?: "logo" | "avatar";
  removeQuotes?: boolean;
}

const cards = createTestimonialCard(React);
const View = createTestimonialView(React, {
  cards,
  controls: createTestimonialControls(React, cards),
  useCarouselState: createTestimonialState(React),
});
const className = "group col-span-full not-first:mt-6 py-8";
const flightText = (text: string) => (text.startsWith("$") ? "$" + text : text);

export function testimonialComponent(
  id: string,
  items: readonly TestimonialItem[],
  eyebrow?: string,
): NativeComponent {
  if (
    items.length === 0 ||
    items.some((item) => !item.label.trim() || !item.paragraphs.length)
  ) {
    throw new Error(
      "Testimonials need a label and at least one paragraph per card.",
    );
  }
  const props = { items, eyebrow };
  const encode = (item: TestimonialItem) =>
    Object.fromEntries(
      Object.entries(item).map(([key, value]) => [
        key,
        Array.isArray(value)
          ? value.map((paragraph) =>
              typeof paragraph === "string"
                ? flightText(paragraph)
                : { html: flightText(paragraph.html) },
            )
          : typeof value === "string"
            ? flightText(value)
            : value,
      ]),
    );
  return {
    id,
    html: renderToString(
      React.createElement(
        "div",
        { className },
        React.createElement(View, props),
      ),
    ),
    model: [
      "$",
      "div",
      null,
      {
        className,
        children: [
          "$",
          "$L" + flight.flightId,
          null,
          {
            items: items.map(encode),
            ...(eyebrow ? { eyebrow: flightText(eyebrow) } : {}),
          },
        ],
      },
    ],
    modules: [
      {
        id: flight.flightId,
        value: [flight.moduleId, [flight.react.chunk, flight.url], "default"],
      },
    ],
  };
}
