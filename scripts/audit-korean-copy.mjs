import fs from "node:fs";
import path from "node:path";
import { parse, babelParse } from "vue/compiler-sfc";
const failures = [];
const allowed =
  /Deepria|deepria|cloud|Google|GitHub|Markdown|AI|Enter|Shift|Ctrl/gi;
function check(value, file, line) {
  if (!value || !/[A-Za-z]{2,}/.test(value.replace(allowed, ""))) return;
  failures.push({ file, line, text: value });
}
function files(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? files(path.join(dir, entry.name))
        : [path.join(dir, entry.name)],
    );
}
for (const file of files("src").filter((file) => file.endsWith(".vue"))) {
  const { descriptor } = parse(fs.readFileSync(file, "utf8"));
  const seen = new Set();
  function visitTemplate(node) {
    if (!node || seen.has(node)) return;
    seen.add(node);
    if (node.type === 2) check(node.content.trim(), file, node.loc.start.line);
    for (const attr of node.props || [])
      if (
        attr.type === 6 &&
        [
          "title",
          "placeholder",
          "label",
          "aria-label",
          "alt",
          "description",
          "eyebrow",
        ].includes(attr.name)
      )
        check(attr.value?.content, file, attr.loc.start.line);
    for (const child of node.children || []) visitTemplate(child);
    for (const branch of node.branches || []) visitTemplate(branch);
  }
  visitTemplate(descriptor.template?.ast);
  const source = descriptor.scriptSetup?.content || descriptor.script?.content;
  if (source) {
    const ast = babelParse(source, { sourceType: "module" });
    function visit(node) {
      if (!node || typeof node !== "object") return;
      if (
        node.type === "CallExpression" &&
        node.callee?.object?.name === "message" &&
        ["success", "error", "warning", "info"].includes(
          node.callee?.property?.name,
        ) &&
        node.arguments[0]?.type === "StringLiteral"
      )
        check(node.arguments[0].value, file, node.loc.start.line);
      for (const [key, value] of Object.entries(node)) {
        if (["loc", "start", "end", "extra"].includes(key)) continue;
        if (Array.isArray(value)) value.forEach(visit);
        else if (value && typeof value === "object") visit(value);
      }
    }
    visit(ast);
  }
}
if (
  !/[가-힣]/.test(
    JSON.parse(fs.readFileSync("public/manifest.webmanifest", "utf8"))
      .description,
  )
)
  failures.push({
    file: "public/manifest.webmanifest",
    text: "Description must be Korean",
  });
if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
} else
  console.log(
    "Korean UI copy check passed (static text, UI attributes and literal toast messages).",
  );
