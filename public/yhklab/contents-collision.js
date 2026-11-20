const selector = '.toc-collision-target';
const clearance = 32;

export function watchRailCollision(body, rail, show, signal) {
  if (typeof IntersectionObserver === 'undefined') return show(true);

  const targets = new Set(), intersecting = new Set();
  let frame = 0, refreshTargets = false, measured = false;

  function update() {
    const bounds = rail.getBoundingClientRect();
    for (const target of intersecting) {
      const rect = target.getBoundingClientRect();
      if (rect.left >= bounds.right || rect.right <= bounds.left ||
          rect.top >= bounds.bottom + clearance || rect.bottom <= bounds.top - clearance) continue;
      const { opacity, visibility } = getComputedStyle(target);
      if (opacity !== '0' && visibility !== 'hidden') return show(false);
    }
    show(true);
  }

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting && targets.has(entry.target)) intersecting.add(entry.target);
      else intersecting.delete(entry.target);
    }
    measured = true;
    update();
  });

  function observeTargets() {
    const next = new Set(body.querySelectorAll(selector));
    for (const target of targets) {
      if (next.has(target)) continue;
      observer.unobserve(target);
      targets.delete(target);
      intersecting.delete(target);
    }
    for (const target of next) {
      if (targets.has(target)) continue;
      targets.add(target);
      observer.observe(target);
    }
  }

  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (refreshTargets) {
        refreshTargets = false;
        observeTargets();
      }
      if (measured || !targets.size) update();
    });
  }

  observeTargets();
  if (!targets.size) show(true);
  const mutations = new MutationObserver(records => {
    if (records.some(record => record.type === 'childList')) refreshTargets = true;
    if (refreshTargets || records.some(record => targets.has(record.target))) schedule();
  });
  mutations.observe(body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
  const resize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
  resize?.observe(rail);
  window.addEventListener('scroll', schedule, { passive: true, signal });
  window.addEventListener('resize', schedule, { signal });
  signal.addEventListener('abort', () => {
    observer.disconnect();
    mutations.disconnect();
    resize?.disconnect();
    cancelAnimationFrame(frame);
  }, { once: true });
}
