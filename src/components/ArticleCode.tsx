import { useEffect, useRef, useState } from "react";

/** A React-owned code block for interactive TSX articles. */
export default function ArticleCode({
  code,
  language = "text",
}: {
  code: string;
  language?: string;
}) {
  const [ready, setReady] = useState(false);
  const [feedback, setFeedback] = useState("复制代码");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const request = useRef(0);
  useEffect(() => {
    setReady(true);
    return () => {
      request.current++;
      clearTimeout(timer.current);
    };
  }, []);
  useEffect(() => {
    request.current++;
    clearTimeout(timer.current);
    setFeedback("复制代码");
  }, [code]);
  async function copy() {
    const current = ++request.current;
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(code);
      if (current === request.current) setFeedback("已复制");
    } catch {
      if (current === request.current) setFeedback("复制失败");
    }
    if (current === request.current)
      timer.current = setTimeout(() => setFeedback("复制代码"), 1800);
  }
  return (
    <pre data-language={language}>
      <code>{code}</code>
      <button
        type="button"
        className="copy-code"
        disabled={!ready}
        aria-live="polite"
        onClick={copy}
      >
        {feedback}
      </button>
    </pre>
  );
}
