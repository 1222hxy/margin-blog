import { useEffect, useState } from "react";
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
export default function Search() {
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState(""),
    [items, setItems] = useState<Entry[]>([]),
    [error, setError] = useState(false);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    if (open && !items.length)
      fetch("/search.json")
        .then((r) => {
          if (!r.ok) throw Error();
          return r.json();
        })
        .then(setItems)
        .catch(() => setError(true));
  }, [open]);
  const words = query.toLocaleLowerCase().trim().split(/\s+/);
  const results = items
    .filter((i) =>
      words.every((w) =>
        (i.title + " " + i.description + " " + i.tags.join(" ") + " " + i.body)
          .toLocaleLowerCase()
          .includes(w),
      ),
    )
    .slice(0, 20);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="search-trigger" aria-label="搜索文章">
        搜索 <kbd>Ctrl K</kbd>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>寻找一段灵感</DialogTitle>
        <DialogDescription>搜索标题、标签或正文，支持中文。</DialogDescription>
        <input
          autoFocus
          className="search-input"
          aria-label="搜索关键词"
          placeholder="输入关键词…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="search-results" aria-live="polite">
          {error ? (
            <p>搜索加载失败，请刷新重试。</p>
          ) : results.length ? (
            results.map((i) => (
              <a key={i.url} href={i.url}>
                <strong>{i.title}</strong>
                <small>{i.description}</small>
              </a>
            ))
          ) : (
            <p>没有找到相关文章。</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
