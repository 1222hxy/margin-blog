// Build two same-origin chart test variants into ignored same-volume folders.
import { spawnSync } from "node:child_process";
import { constants } from "node:fs";
import { copyFile, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const fixture = new URL("content/lab/chart-in-tabs-fixture.lab.md", root);
function build(folder, mode) {
  const built = spawnSync(
    process.execPath,
    [
      "node_modules/astro/bin/astro.mjs",
      "build",
      "--outDir",
      `.astro/${folder}`,
    ],
    {
      cwd: fileURLToPath(root),
      env: { ...process.env, YHKLAB_SOURCE_CHART: mode },
      stdio: "inherit",
    },
  );
  if (built.error) throw built.error;
  if (built.status !== 0)
    throw new Error(`The ${folder} build exited with ${built.status}.`);
}

build("chart-reference", "0");
await copyFile(
  new URL("tests/fixtures/chart-in-tabs.lab.md", root),
  fixture,
  constants.COPYFILE_EXCL,
);
try {
  build("chart-candidate", "1");
} finally {
  await unlink(fixture);
}
