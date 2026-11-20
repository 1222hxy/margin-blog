/** Small React adapter for the current Flight shell. The chart controller and
 * its menu are source code; only generic React, portal and Radix primitives
 * come from the shell's already-loaded singleton. */
export function createArticleChart(React, { staging, createPortal, dropdown }) {
  const {
    createElement: h,
    useRef,
    useState,
    useContext,
    useLayoutEffect,
  } = React;
  function loadSource() {
    return Promise.all([
      import("/yhklab/chart-runtime/markdown-chart-runtime.mjs"),
      import("/yhklab/chart-runtime/markdown-chart-menu.mjs"),
    ]);
  }
  let loading;
  const loadVega = () =>
    import("/yhklab/chart-runtime/vega.mjs").then((mod) => mod.default);
  return function ArticleChart({
    id,
    className,
    caption,
    categoryTitle,
    valueTitle,
    rows,
    benchmark,
    locale,
  }) {
    const stage = useContext(staging);
    const chart = useRef(null);
    const node = useRef(null);
    const pendingStage = useRef(null);
    const stageRef = useRef(stage);
    const [mounted, setMounted] = useState(null);
    useLayoutEffect(() => {
      stageRef.current = stage;
      if (chart.current) chart.current.setStage(stage);
      else {
        pendingStage.current?.();
        pendingStage.current = stage?.defer?.();
      }
      return () => {
        pendingStage.current?.();
        pendingStage.current = null;
      };
    }, [stage]);
    useLayoutEffect(() => {
      let alive = true;
      function finishWaiting() {
        pendingStage.current?.();
        pendingStage.current = null;
      }
      (loading ??= loadSource())
        .then(([{ mountArticleChart }, { createChartMenu }]) => {
          if (!alive || !node.current) return;
          const controller = mountArticleChart(
            node.current,
            {
              id,
              caption,
              categoryTitle,
              valueTitle,
              rows,
              benchmark,
              stage: stageRef.current,
            },
            { loadVega, placeholderIsSlot: true },
          );
          chart.current = controller;
          finishWaiting();
          return controller.ready.then((layout) => {
            if (alive && layout)
              setMounted({ ...layout, Menu: createChartMenu(React, dropdown) });
          });
        })
        .catch((error) => {
          if (!alive) return;
          finishWaiting();
          console.error("Could not load the article chart:", error);
        });
      return () => {
        alive = false;
        chart.current?.dispose();
        chart.current = null;
      };
    }, [id, caption, categoryTitle, valueTitle, rows, benchmark]);
    return h(
      React.Fragment,
      null,
      h("div", { ref: node, id, className, style: { height: 400 } }),
      mounted &&
        !stage?.staged &&
        createPortal(
          h(mounted.Menu, {
            id,
            view: mounted.view,
            scope: mounted.scope,
            locale,
          }),
          mounted.actions,
        ),
    );
  };
}
