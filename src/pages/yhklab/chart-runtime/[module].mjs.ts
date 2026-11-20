import type { APIRoute, GetStaticPaths } from "astro";
import vega from "../../../../node_modules/vega/build/vega.min.js?raw";

const modules = import.meta.glob<string>(
  "../../../themes/yhklab/components/{markdown-bar,markdown-chart,product-chart}-*.mjs",
  { eager: true, import: "default", query: "?raw" },
);
export const getStaticPaths: GetStaticPaths = () => [
  ...Object.entries(modules).map(([path, source]) => ({
    params: {
      module: path
        .split("/")
        .at(-1)!
        .replace(/\.mjs$/, ""),
    },
    props: { source },
  })),
  {
    params: { module: "vega" },
    props: {
      source: `const module={exports:{}};const exports=module.exports;\n${vega}\nexport default module.exports;`,
    },
  },
];

export const GET: APIRoute = ({ props }) =>
  new Response(props.source, {
    headers: { "Content-Type": "application/javascript; charset=utf-8" },
  });
