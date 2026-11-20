import {
  testimonialComponent,
  type TestimonialItem,
} from "./components/TestimonialCarousel";

const carousel: TestimonialItem[] = [
  {
    label: "记录者",
    paragraphs: ["我先写问题，再放进第一条观察。"],
    attribution: "Mock · 记录者",
  },
  {
    label: "复核者",
    paragraphs: ["保留原始数值，才能解释两个版本为什么不同。"],
    attribution: "Mock · 复核者",
  },
  {
    label: "编辑",
    paragraphs: ["整理完毕之后，笔记还能重新打开。"],
    attribution: "Mock · 编辑",
  },
];
const single: TestimonialItem[] = [
  {
    label: "编辑手记",
    paragraphs: ["每条结论都应该能回到它的原始记录。"],
    attribution: "Mock · 编辑手记",
  },
];

export function productTestimonial(id: "customer-carousel" | "customer-quote") {
  return testimonialComponent(
    id,
    id === "customer-carousel" ? carousel : single,
  );
}
