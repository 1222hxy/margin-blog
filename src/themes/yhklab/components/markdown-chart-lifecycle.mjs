export function matchesChartHash(id) {
  try {
    return decodeURIComponent(window.location.hash.slice(1)) === id;
  } catch {
    return false;
  }
}

// The reference preflights within 2000px in idle time, or observes within 1000px.
export function scheduleChartLoad(anchor, start) {
  if (typeof IntersectionObserver === "undefined") {
    const timer = window.setTimeout(start, 0);
    return () => window.clearTimeout(timer);
  }
  const intersection = new IntersectionObserver(
    (entries) => {
      if (entries.some(({ isIntersecting }) => isIntersecting)) start();
    },
    { rootMargin: "1000px" },
  );
  intersection.observe(anchor);
  const idle = () => {
    const rect = anchor.getBoundingClientRect();
    if (
      rect.height > 0 &&
      rect.bottom >= 0 &&
      rect.top <= window.innerHeight + 2000
    )
      start();
  };
  const stopIdle =
    typeof window.requestIdleCallback === "function"
      ? (() => {
          const handle = window.requestIdleCallback(idle);
          return () => window.cancelIdleCallback(handle);
        })()
      : (() => {
          const handle = window.setTimeout(idle, 200);
          return () => window.clearTimeout(handle);
        })();
  return () => {
    intersection.disconnect();
    stopIdle();
  };
}

export function observeChartSize(host, view, onError) {
  if (typeof ResizeObserver === "undefined") return () => {};
  let width = host.clientWidth;
  let height = host.clientHeight;
  const observer = new ResizeObserver(() => {
    const nextWidth = host.clientWidth;
    const nextHeight = host.clientHeight;
    if (
      !nextWidth ||
      !nextHeight ||
      (width === nextWidth && height === nextHeight)
    )
      return;
    width = nextWidth;
    height = nextHeight;
    view
      .signal("width", width)
      .signal("height", height)
      .resize()
      .runAsync()
      .catch(onError);
  });
  observer.observe(host);
  return () => observer.disconnect();
}
