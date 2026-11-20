/** When a chart URL points at a dormant tab, wait for the new panel to be
 * promoted before scrolling to its now-live anchor. */
export function followTabAnchor(root, items, select) {
  if (!root || !items.some((item) => item.linkAnchor)) return;
  let observer;
  function follow() {
    observer?.disconnect();
    let id;
    try {
      id = decodeURIComponent(location.hash.slice(1));
    } catch {
      return;
    }
    const index = items.findIndex((item) => item.linkAnchor === id);
    if (index < 0) return;
    select(index);
    function reveal() {
      const anchor = document.getElementById(id);
      if (!anchor || !root.contains(anchor) || anchor.closest("[inert]"))
        return;
      observer?.disconnect();
      anchor.scrollIntoView({ block: "start", behavior: "instant" });
    }
    observer = new MutationObserver(reveal);
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["id", "inert"],
    });
    reveal();
  }
  window.addEventListener("hashchange", follow);
  follow();
  return () => {
    window.removeEventListener("hashchange", follow);
    observer?.disconnect();
  };
}
