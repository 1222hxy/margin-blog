export function createPdfInteraction({
  useState,
  useRef,
  useEffect,
  useCallback,
}) {
  return function usePdfInteraction(frame, sizeRegion) {
    const previousFocus = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [supported, setSupported] = useState(false),
      [active, setActive] = useState(false);
    useEffect(() => {
      const target = sizeRegion.current;
      const update = ([entry] = []) => {
        const box = entry?.borderBoxSize[0];
        const rect = box ? null : target.getBoundingClientRect();
        const width = Math.floor(box?.inlineSize ?? rect.width),
          height = box?.blockSize ?? rect.height;
        setSize((old) =>
          old.width === width && old.height === height
            ? old
            : { width, height },
        );
      };
      update();
      const observer =
        typeof ResizeObserver === "undefined"
          ? null
          : new ResizeObserver(update);
      observer?.observe(target, { box: "border-box" });
      return () => observer?.disconnect();
    }, []);
    useEffect(() => {
      setSupported(
        !!(frame.current?.requestFullscreen && document.fullscreenEnabled),
      );
      const onChange = () => {
        const next = document.fullscreenElement === frame.current;
        setActive(next);
        if (!next && previousFocus.current) {
          previousFocus.current.focus({ preventScroll: true });
          previousFocus.current = null;
        }
      };
      document.addEventListener("fullscreenchange", onChange);
      return () => document.removeEventListener("fullscreenchange", onChange);
    }, []);
    const toggle = useCallback(async () => {
      try {
        if (document.fullscreenElement === frame.current)
          await document.exitFullscreen();
        else {
          previousFocus.current = document.activeElement;
          await frame.current?.requestFullscreen();
        }
      } catch {
        setSupported(false);
        previousFocus.current = null;
      }
    }, []);
    function trapTab(event) {
      if (!active || event.key !== "Tab") return;
      const choices = Array.from(
        frame.current.querySelectorAll(
          'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ),
      ).filter(
        (node) => !node.closest("[inert]") && node.getClientRects().length,
      );
      const first = choices[0],
        last = choices.at(-1);
      if (event.shiftKey && event.target === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && event.target === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    return { size, fullscreen: { supported, active, toggle }, trapTab };
  };
}
