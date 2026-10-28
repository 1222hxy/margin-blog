import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "./ui/dialog";
type Entry = {
  title: string;
  description: string;
  body: string;
  url: string;
  tags: string[];
};
const normalize = (value: string) =>
  value.normalize("NFKC").toLocaleLowerCase();
export default function Search() {
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState(""),
    [items, setItems] = useState<Entry[] | null>(null),
    [status, setStatus] = useState<"idle" | "loading" | "error" | "ready">(
      "idle",
    ),
    [attempt, setAttempt] = useState(0),
    [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
    const key = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === "k" &&
        !e.isComposing
      ) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    if (!open || items !== null) return;
    const controller = new AbortController();
    setStatus("loading");
    fetch("/search.json", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error("Search unavailable");
        return r.json();
      })
      .then((data: unknown) => {
        if (
          !Array.isArray(data) ||
          !data.every(
            (i) =>
              typeof i.title === "string" &&
              typeof i.description === "string" &&
              typeof i.body === "string" &&
              typeof i.url === "string" &&
              i.url.startsWith("/posts/") &&
              Array.isArray(i.tags) &&
              i.tags.every((t: unknown) => typeof t === "string"),
          )
        )
          throw Error("Invalid search index");
        if (!controller.signal.aborted) {
          setItems(data);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });
    return () => controller.abort();
  }, [open, items, attempt]);
  const index = useMemo(
    () =>
      (items || []).map((i) => ({
        ...i,
        titleKey: normalize(i.title),
        tagsKey: normalize(i.tags.join(" ")),
        textKey: normalize(
          i.title + " " + i.description + " " + i.tags.join(" ") + " " + i.body,
        ),
      })),
    [items],
  );
  const results = useMemo(() => {
    const words = normalize(query).trim().split(/\s+/).filter(Boolean);
    return index
      .filter((i) => words.every((w) => i.textKey.includes(w)))
      .map((i) => ({
        entry: i,
        score: words.reduce(
          (score, w) =>
            score +
            (i.titleKey.includes(w) ? 5 : i.tagsKey.includes(w) ? 3 : 1),
          0,
        ),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map((i) => i.entry);
  }, [index, query]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        disabled={!ready}
        className="search-trigger"
        aria-label="搜索文章"
      >
        搜索 <kbd>Ctrl K</kbd>
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(event) => {
          if (matchMedia("(pointer: coarse)").matches) event.preventDefault();
        }}
      >
        <DialogTitle>搜索文章</DialogTitle>
        <DialogDescription>搜索标题、标签或正文，支持中文。</DialogDescription>
        <input
          className="search-input"
          type="search"
          name="article-search"
          autoComplete="off"
          aria-label="搜索关键词"
          placeholder="例如：数学、设计…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div
          className="search-results"
          aria-live="polite"
          aria-busy={status === "loading"}
        >
          {status === "idle" || status === "loading" ? (
            <p>正在加载文章…</p>
          ) : status === "error" ? (
            <div>
              <p>文章暂时无法加载，请检查网络后重试。</p>
              <button className="pill" onClick={() => setAttempt((n) => n + 1)}>
                重新加载
              </button>
            </div>
          ) : results.length ? (
            results.map((i) => (
              <a key={i.url} href={i.url}>
                <strong>{i.title}</strong>
                <small>{i.description}</small>
              </a>
            ))
          ) : (
            <p>
              {query.trim()
                ? "没有找到相关文章，试试更短的关键词。"
                : "还没有已发布的文章。"}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
