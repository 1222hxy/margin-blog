import fs from "node:fs";
const root = "src/content/tsx";
fs.mkdirSync(root, { recursive: true });
fs.mkdirSync("src/generated", { recursive: true });
const entries = fs
  .readdirSync(root)
  .filter((f) => f.endsWith(".json"))
  .sort()
  .map((f) => ({
    id: f.slice(0, -5),
    data: JSON.parse(fs.readFileSync(root + "/" + f, "utf8")),
  }));
const active = entries.filter((e) => !e.data.draft);
for (const e of entries) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e.id))
    throw Error("Invalid TSX slug: " + e.id);
  if (!fs.existsSync(root + "/" + e.id + ".tsx"))
    throw Error("Missing TSX component: " + e.id);
}
const code =
  active
    .map((e, i) => "import Entry" + i + ' from "../content/tsx/' + e.id + '";')
    .join("\n") +
  '\nimport type {ComponentType} from "react";\nexport const tsxComponents: Record<string,ComponentType> = {' +
  active.map((e, i) => JSON.stringify(e.id) + ": Entry" + i).join(",") +
  "};\n";
fs.writeFileSync("src/generated/tsx-registry.ts", code);
