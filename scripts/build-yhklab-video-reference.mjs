import { spawnSync } from "node:child_process";
import { constants } from "node:fs";
import { copyFile, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const fixtures = ["file-video-reference", "file-video-candidate"];
const copied = [];
try {
  for (const id of fixtures) {
    const page = new URL(
      `src/pages/themes/openai/astra-sol/components/${id}.astro`,
      root,
    );
    await copyFile(
      new URL(`tests/fixtures/${id}.astro`, root),
      page,
      constants.COPYFILE_EXCL,
    );
    copied.push(page);
  }
  const build = spawnSync(
    process.execPath,
    [
      "node_modules/astro/bin/astro.mjs",
      "build",
      "--outDir",
      ".astro/video-reference",
    ],
    {
      cwd: fileURLToPath(root),
      stdio: "inherit",
    },
  );
  if (build.error) throw build.error;
  if (build.status !== 0)
    throw Error(`Video fixture build failed (${build.status}).`);
} finally {
  await Promise.all(copied.map((page) => unlink(page)));
}
