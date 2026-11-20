import { spawnSync } from "node:child_process";
import { constants } from "node:fs";
import { copyFile, mkdir, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const routes = new URL(
  "src/pages/themes/openai/astra-sol/components/source-testimonial-fixture/",
  root,
);
const fixture = new URL("[id].astro", routes);
await mkdir(routes, { recursive: true });
const files = [
  [fixture, new URL("tests/fixtures/testimonial-parity.astro", root)],
  [
    new URL("content/lab/testimonials-fixture.lab.md", root),
    new URL("tests/fixtures/testimonials.lab.md", root),
  ],
];
const created = [];
try {
  for (const [target, source] of files) {
    await copyFile(source, target, constants.COPYFILE_EXCL);
    created.push(target);
  }
  const result = spawnSync(
    process.execPath,
    [
      "node_modules/astro/bin/astro.mjs",
      "build",
      "--outDir",
      ".astro/testimonial-candidate",
    ],
    {
      cwd: fileURLToPath(root),
      stdio: "inherit",
    },
  );
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(`Testimonial fixture build failed (${result.status}).`);
} finally {
  await Promise.all(created.map((target) => unlink(target)));
}
