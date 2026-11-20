import type { ArticleHeading } from "../../openai/types";
import { part } from "../blocks";
import { renderReadingContents } from "./contentsMarkup";

export function readingContents(headings: readonly ArticleHeading[]) {
  return renderReadingContents(headings, {
    mobile: part("MobileContents"),
    desktop: part("DesktopContents"),
  });
}
