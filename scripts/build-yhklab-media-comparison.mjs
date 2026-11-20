import { spawnSync } from "node:child_process";
import { constants } from "node:fs";
import { copyFile, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const page = new URL(
  "src/pages/themes/openai/astra-sol/components/media-comparison-[sample].astro",
  root,
);
await copyFile(
  new URL("tests/fixtures/media-demo-comparison.astro", root),
  page,
  constants.COPYFILE_EXCL,
);
try {
  const build = spawnSync(
    process.execPath,
    [
      "node_modules/astro/bin/astro.mjs",
      "build",
      "--outDir",
      ".astro/media-comparison",
    ],
    {
      cwd: fileURLToPath(root),
      stdio: "inherit",
    },
  );
  if (build.error) throw build.error;
  if (build.status !== 0)
    throw Error(`Media comparator build failed (${build.status}).`);
} finally {
  await unlink(page);
}
