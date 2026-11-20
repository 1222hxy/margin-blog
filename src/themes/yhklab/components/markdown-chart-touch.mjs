const bar = "g.mark-rect.role-mark path";

function nearestMark(host, x, y) {
  const hit = document.elementFromPoint(x, y);
  if (!host.contains(hit)) return null;
  const direct = hit.closest(bar);
  if (direct || hit.closest("g.role-mark"))
    return { target: direct ?? hit, x, y, above: !!direct };
  let nearest;
  for (const target of host.querySelectorAll(bar)) {
    const { left, right, top, bottom, width, height } =
      target.getBoundingClientRect();
    if (!width || !height) continue;
    const d = Math.hypot(
      x - Math.max(left, Math.min(right, x)),
      y - Math.max(top, Math.min(bottom, y)),
    );
    if (d > 12 || (nearest && d >= nearest.d)) continue;
    nearest = {
      target,
      x: Math.max(left + 1, Math.min(right - 1, x)),
      y: Math.max(top + 1, Math.min(bottom - 1, y)),
      d,
      above: true,
    };
  }
  return nearest ?? { target: hit, x, y, above: false };
}

export function bindChartTouch(host, scroll, signal, clear, activate) {
  let tap;
  host.addEventListener(
    "touchstart",
    (event) => {
      const point = event.touches.length === 1 && event.touches[0];
      tap = point ? [point.clientX, point.clientY, scroll.scrollLeft] : null;
      clear();
    },
    { signal, passive: true },
  );
  host.addEventListener(
    "touchend",
    (event) => {
      const start = tap;
      tap = null;
      const point = event.changedTouches[0];
      if (!start || !point || event.touches.length) return;
      const { clientX: x, clientY: y } = point;
      if (
        Math.abs(x - start[0]) > 6 ||
        Math.abs(y - start[1]) > 6 ||
        Math.abs(scroll.scrollLeft - start[2]) > 1
      )
        return clear();
      event.preventDefault();
      const mark = nearestMark(host, x, y);
      if (!mark) return;
      activate(mark);
    },
    { signal, passive: false },
  );
  host.addEventListener(
    "touchcancel",
    () => {
      tap = null;
      clear();
    },
    { signal, passive: true },
  );
}
