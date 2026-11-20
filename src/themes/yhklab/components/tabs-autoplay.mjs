export const tabsAutoplayMs = 6000;

function containsPointer(root, { clientX, clientY }) {
  const tabset = root.querySelector('[role="tab"]')?.parentElement;
  const panel = root.querySelector(
    '[role="tabpanel"]:not([inert] [role="tabpanel"])',
  );
  const rects = [
    tabset,
    panel?.querySelector("[data-tabs-autoplay-content]") ?? panel,
  ]
    .filter(Boolean)
    .map((node) => node.getBoundingClientRect());
  return (
    rects.length > 0 &&
    clientX >= Math.min(...rects.map((rect) => rect.left)) &&
    clientX <= Math.max(...rects.map((rect) => rect.right)) &&
    clientY >= Math.min(...rects.map((rect) => rect.top)) &&
    clientY <= Math.max(...rects.map((rect) => rect.bottom))
  );
}

// Original primary-tab countdown: runs only on a visible, ready panel on a
// fine-pointer device, pauses for hover, and stops after manual interaction.
export function createTabsAutoplay(React) {
  const { useCallback, useEffect, useRef, useState } = React;
  return function useTabsAutoplay({ enabled, group, key, ready, advance }) {
    const [eligible, setEligible] = useState(false);
    const [onscreen, setOnscreen] = useState(false);
    const [hover, setHover] = useState(false);
    const [stopped, setStopped] = useState(false);
    const [elapsed, setElapsed] = useState({ key, ms: 0 });
    const memory = useRef({ key, ms: 0 });
    const keyboard = useRef(true);
    const mouse = useRef(null);
    const stop = useCallback(() => setStopped(true), []);

    useEffect(() => {
      if (!enabled || !group.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
      const refresh = () =>
        setEligible(!reduced.matches && fine.matches && !document.hidden);
      const useKeyboard = () => {
        keyboard.current = true;
      };
      const usePointer = () => {
        keyboard.current = false;
      };
      const abort = new AbortController();
      const { signal } = abort;
      reduced.addEventListener("change", refresh, { signal });
      fine.addEventListener("change", refresh, { signal });
      document.addEventListener("visibilitychange", refresh, { signal });
      window.addEventListener("keydown", useKeyboard, {
        capture: true,
        signal,
      });
      window.addEventListener("pointerdown", usePointer, {
        capture: true,
        signal,
      });
      const observer = new IntersectionObserver(
        ([entry]) => setOnscreen(entry.isIntersecting),
        { threshold: 0.25 },
      );
      observer.observe(group.current);
      refresh();
      return () => {
        abort.abort();
        observer.disconnect();
      };
    }, [enabled, group]);

    useEffect(() => {
      const root = group.current;
      if (!enabled || !root) return;
      function move(event) {
        mouse.current = { clientX: event.clientX, clientY: event.clientY };
        setHover(containsPointer(root, mouse.current));
      }
      function leave() {
        mouse.current = null;
        setHover(false);
      }
      if (mouse.current) setHover(containsPointer(root, mouse.current));
      root.addEventListener("mousemove", move);
      root.addEventListener("mouseleave", leave);
      return () => {
        root.removeEventListener("mousemove", move);
        root.removeEventListener("mouseleave", leave);
      };
    }, [enabled, group, key, ready]);

    const running =
      enabled && ready && eligible && onscreen && !hover && !stopped;
    useEffect(() => {
      if (!enabled) return;
      if (key !== memory.current.key) memory.current = { key, ms: 0 };
      const progress = memory.current;
      setElapsed({ ...progress });
      if (!running) return;
      const start = performance.now();
      const timer = window.setTimeout(
        advance,
        Math.max(0, tabsAutoplayMs - progress.ms),
      );
      return () => {
        window.clearTimeout(timer);
        progress.ms = Math.min(
          tabsAutoplayMs,
          progress.ms + performance.now() - start,
        );
      };
    }, [enabled, key, advance, running]);

    return {
      stop,
      onFocus: () => {
        if (keyboard.current) stop();
      },
      running,
      elapsed: elapsed.key === key ? elapsed.ms : 0,
    };
  };
}
