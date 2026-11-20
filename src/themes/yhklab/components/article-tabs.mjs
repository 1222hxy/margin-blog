import { createTabsAutoplay, tabsAutoplayMs } from "./tabs-autoplay.mjs";
import { followTabAnchor } from "./tabs-deep-link.mjs";

/** Primary, non-sticky Markdown tabs. This factory renders on the server and
 * in the browser; the surrounding Flight shell only supplies shared services. */
export function createArticleTabs(React, { staging, analytics } = {}) {
  const {
    createElement: h,
    Suspense,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
  } = React;
  const PanelStage = staging ?? React.createContext(null);
  const dormantStage = { staged: true, dormant: true, defer: () => () => {} };
  const useAutoplay = createTabsAutoplay(React);
  const itemClass =
    "text-cta min-h-10 inline-flex items-center justify-center gap-1 px-4 py-3 rounded-full whitespace-nowrap transition-[background-color,color] ease-curve-d duration-medium";
  const motion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)");

  function PendingPanel() {
    const stage = useContext(PanelStage);
    useLayoutEffect(() => stage?.defer(), [stage]);
    return null;
  }

  function TabPanels({ item, all, onReady }) {
    const parent = useContext(PanelStage);
    const deferParent = parent?.defer;
    const [pending, setPending] = useState(0);
    const [visible, setVisible] = useState(item.id);
    const lastPanel = useRef(item);
    const region = useRef(null);
    const height = useRef(null);
    const switching = visible !== item.id;
    const defer = useCallback(() => {
      setPending((n) => n + 1);
      const done = deferParent?.();
      return () => {
        setPending((n) => n - 1);
        done?.();
      };
    }, [deferParent]);
    const staged = useMemo(() => ({ defer, staged: true }), [defer]);
    useLayoutEffect(() => {
      if (!onReady || switching || pending || parent?.staged) return;
      onReady(item.id);
    }, [item.id, onReady, parent?.staged, pending, switching]);

    useLayoutEffect(() => {
      if (!switching) lastPanel.current = item;
    }, [item, switching]);
    useLayoutEffect(() => {
      if (!switching || pending) return;
      const frame = requestAnimationFrame(() => {
        const container = region.current;
        const next = container?.children[1];
        height.current =
          !parent?.staged &&
          !motion()?.matches &&
          next instanceof HTMLElement &&
          typeof container.animate === "function"
            ? { from: container.offsetHeight, to: next.offsetHeight }
            : null;
        lastPanel.current = item;
        setVisible(item.id);
      });
      return () => cancelAnimationFrame(frame);
    }, [item, parent?.staged, pending, switching]);
    useLayoutEffect(() => {
      const container = region.current;
      const panel = container?.firstElementChild;
      const size = height.current;
      height.current = null;
      const preference = motion();
      if (
        !(panel instanceof HTMLElement) ||
        !size ||
        size.from === size.to ||
        parent?.staged ||
        preference?.matches ||
        typeof container.animate !== "function"
      )
        return;
      const clipPath =
        size.from < size.to ? "inset(-100vmax -100vmax 0)" : "none";
      const animation = container.animate(
        [
          { height: `${size.from}px`, clipPath },
          { height: `${size.to}px`, clipPath },
        ],
        { duration: 240, easing: "cubic-bezier(0.2, 0, 0, 1)" },
      );
      const cancel = () => animation.cancel();
      if (preference?.addEventListener)
        preference.addEventListener("change", cancel);
      else preference?.addListener(cancel);
      const resize =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(([entry]) => {
              if (
                entry &&
                Math.round(
                  entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height,
                ) !== size.to
              )
                cancel();
            })
          : null;
      resize?.observe(panel, { box: "border-box" });
      return () => {
        cancel();
        if (preference?.removeEventListener)
          preference.removeEventListener("change", cancel);
        else preference?.removeListener(cancel);
        resize?.disconnect();
      };
    }, [parent?.staged, visible]);

    const panel = (tab, concealed, standby = false) =>
      h(
        PanelStage.Provider,
        {
          key: tab.id,
          value: standby ? dormantStage : concealed ? staged : parent,
        },
        h(
          "div",
          {
            "aria-hidden": concealed || undefined,
            hidden: standby || undefined,
            inert: concealed || undefined,
            className: concealed
              ? "flow-root min-w-0 invisible absolute top-0 w-full"
              : "flow-root min-w-0",
          },
          h(
            Suspense,
            { fallback: h(PendingPanel) },
            h("div", {
              id: `${tab.id}-panel`,
              role: "tabpanel",
              "aria-labelledby": tab.id,
              className: "",
              ...(tab.ssrHtml !== undefined
                ? { dangerouslySetInnerHTML: { __html: tab.ssrHtml } }
                : { children: tab.content }),
            }),
          ),
        ),
      );
    return h(
      "div",
      null,
      h(
        "div",
        { ref: region, "aria-busy": switching, className: "relative min-w-0" },
        all
          ? [
              panel(switching ? lastPanel.current : item, false),
              ...(switching ? [panel(item, true)] : []),
              ...all
                .filter((tab) => tab.id !== visible && tab.id !== item.id)
                .map((tab) => panel(tab, true, true)),
            ]
          : switching
            ? [panel(lastPanel.current, false), panel(item, true)]
            : panel(item, false),
      ),
    );
  }

  function reveal(scroller, button) {
    if (!scroller || !button || scroller.scrollWidth <= scroller.clientWidth)
      return;
    const region = scroller.getBoundingClientRect();
    const item = button.getBoundingClientRect();
    const style = getComputedStyle(scroller);
    const left =
      region.left + (Number.parseFloat(style.scrollPaddingLeft) || 0);
    const right =
      region.right - (Number.parseFloat(style.scrollPaddingRight) || 0);
    const mobile = window.matchMedia("(width < 48rem)").matches;
    const rtl = style.direction === "rtl";
    const delta = mobile
      ? rtl
        ? item.right - right
        : item.left - left
      : item.left < left
        ? item.left - left
        : Math.max(0, item.right - right);
    const max = scroller.scrollWidth - scroller.clientWidth;
    if (mobile || delta)
      scroller.scrollTo({
        left: Math.max(
          rtl ? -max : 0,
          Math.min(rtl ? 0 : max, scroller.scrollLeft + delta),
        ),
        behavior: motion()?.matches ? "instant" : "smooth",
      });
  }

  return function ArticleTabs({
    groupId,
    anchorId,
    items,
    keepMounted,
    autoplay,
  }) {
    const [selected, select] = useState(0);
    const [ready, setReady] = useState(null);
    const root = useRef(null);
    const activeKey = items[selected].id;
    const hasLinkAnchors = items.some((item) => item.linkAnchor);
    const advance = useCallback(
      () => select((index) => (index + 1) % items.length),
      [items.length],
    );
    const rotates = autoplay && items.length > 1;
    const rotation = useAutoplay({
      enabled: rotates,
      group: root,
      key: activeKey,
      ready: ready === activeKey,
      advance,
    });
    useEffect(() => {
      const requested = new URLSearchParams(location.search).get("video");
      if (!requested) return;
      const index = items.findIndex((item) => item.videoId === requested);
      if (index >= 0) select(index);
    }, [items]);
    const stopRotation = rotation.stop;
    useEffect(
      () =>
        followTabAnchor(root.current, items, (index) => {
          if (rotates) stopRotation();
          select(index);
        }),
      [items, rotates, stopRotation],
    );
    const scroller = useRef(null);
    const buttons = useRef([]);
    const seen = useRef(new Set());
    const [inView, setInView] = useState(false);
    useEffect(() => {
      if (!analytics || typeof IntersectionObserver === "undefined") return;
      const observer = new IntersectionObserver(
        ([entry]) => setInView(entry.isIntersecting),
        { threshold: 0.5 },
      );
      observer.observe(scroller.current);
      return () => observer.disconnect();
    }, []);
    useEffect(() => {
      const identifier = `${groupId}-${items[selected].id}`;
      if (!inView || seen.current.has(identifier)) return;
      seen.current.add(identifier);
      analytics?.logComponentVisibilityChanged({
        analyticsAction: identifier,
        metadata: { visible: "true", trigger: "auto", variant: "tab-panel" },
      });
    }, [groupId, inView, items, selected]);

    function activate(index) {
      if (rotates) rotation.stop();
      reveal(scroller.current, buttons.current[index]);
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
      select(index);
      analytics?.logTabChanged({
        identifier: `${groupId}-${items[index].id}`,
        metadata: { index: String(index) },
      });
    }
    function move(event) {
      if (rotates) rotation.stop();
      const from = buttons.current.indexOf(event.target);
      if (from < 0) return;
      const direction =
        getComputedStyle(event.currentTarget).direction === "rtl" ? -1 : 1;
      const index = {
        Home: 0,
        End: items.length - 1,
        ArrowRight: (from + direction + items.length) % items.length,
        ArrowLeft: (from - direction + items.length) % items.length,
      }[event.key];
      if (typeof index !== "number") return;
      event.preventDefault();
      buttons.current[index]?.click();
      buttons.current[index]?.focus({ preventScroll: true });
    }

    const controls = items.map((item, index) => {
      const active = selected === index;
      const countdown = rotates && active;
      return h(
        "button",
        {
          key: item.id,
          ref: (el) => {
            buttons.current[index] = el;
          },
          type: "button",
          role: "tab",
          "aria-selected": active,
          "aria-controls": `${item.id}-panel`,
          id: item.id,
          className:
            itemClass +
            (countdown ? " relative isolate overflow-hidden" : "") +
            " hover:bg-primary-12" +
            (active ? " bg-primary-4" : ""),
          onClick: () => activate(index),
        },
        countdown
          ? h("span", {
              key: rotation.elapsed,
              "aria-hidden": true,
              className:
                "NIBANa_countdown absolute inset-0 -z-10 bg-primary-12",
              style: {
                animationDuration: `${tabsAutoplayMs}ms`,
                animationDelay: `${-rotation.elapsed}ms`,
                animationPlayState: rotation.running ? "running" : "paused",
              },
            })
          : null,
        h("span", null, item.label),
      );
    });
    const track = h(
      "div",
      { className: "relative min-w-fit R7Wy8a_track" },
      h(
        "div",
        { className: "toc-collision-target mx-auto w-max" },
        h(
          "div",
          {
            className:
              "relative flex items-center gap-2 rounded-full border border-primary-12 p-1",
          },
          controls,
        ),
      ),
    );
    const scrollable = h(
      "nav",
      {
        ref: scroller,
        className:
          "scrollable scrollable-horizontal scroll-mt-32 py-1 R7Wy8a_fixedEdges",
        style: {
          "--scrollable-edge-gutter": "var(--tabs-gutter)",
          "--scrollable-edge-fade": "var(--tabs-fade)",
        },
        role: "tablist",
        "aria-label": "标签",
      },
      track,
    );
    const list = h(
      "div",
      { className: "@container w-full" },
      h(
        "div",
        { className: "max-w-container @container w-full _39j3JG_container" },
        h("div", { className: "_39j3JG_region" }, scrollable),
      ),
    );
    return h(
      "div",
      { className: "group col-span-full not-first:mt-16 not-last:mb-16" },
      h(
        "div",
        {
          id: anchorId,
          ref: rotates || hasLinkAnchors ? root : undefined,
          className: "flex flex-col gap-8",
          onFocusCapture: rotates ? rotation.onFocus : undefined,
          onKeyDown: move,
        },
        list,
        h(TabPanels, {
          item: items[selected],
          all: keepMounted ? items : undefined,
          onReady: rotates ? setReady : undefined,
        }),
      ),
    );
  };
}
