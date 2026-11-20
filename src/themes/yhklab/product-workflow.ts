import { MarkdownTabs } from "./components/MarkdownTabs";
import {
  testimonialComponent,
  type TestimonialItem,
} from "./components/TestimonialCarousel";
import { slot } from "./deck-comparison-layout";

const groupId = "coding-testimonials";
const card = (label: string, text: string): TestimonialItem => ({
  label,
  paragraphs: [text],
  attribution: `Mock · ${label}`,
});
const roles: [string, string, TestimonialItem[]][] = [
  [
    "draft",
    "初稿",
    [
      card("记录者", "先把问题和原始观察记下来。"),
      card("整理者", "用标签把同一组观察放到一起。"),
      card("编辑", "草稿里先分开事实和推测。"),
    ],
  ],
  [
    "review",
    "复核稿",
    [
      card("复核者", "每条结论都能点回对应的原始记录。"),
      card("交接者", "未确认的项留在下一轮清单里。"),
      card("维护者", "保留两个版本，才看得出哪里修过。"),
    ],
  ],
];

export function productWorkflow() {
  const views = roles.map(([id, label, items]) => ({
    id,
    label,
    content: testimonialComponent(`testimonials-${id}-workflow`, items),
  }));
  const components = Object.fromEntries(
    views.map(({ content }) => [content.id, content]),
  );
  const tabs = MarkdownTabs({
    id: groupId,
    components,
    media: true,
    items: views.map(({ id, label, content }) => ({
      id: `${groupId}:${id}:tab`,
      label,
      html: slot(content.id),
    })),
  });
  return {
    html: slot(tabs.id),
    components: { ...components, [tabs.id]: tabs },
  };
}
