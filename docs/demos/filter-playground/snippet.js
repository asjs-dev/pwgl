// Read-only code view of the current chain: only non-default options are listed, so the
// snippet reproduces exactly what is on screen. Copy uses the Clipboard API and silently
// falls back to selecting the text.

import { formatValue } from "./controls.js";
import { ADVANCED_PARAMS } from "./registry-advanced.js";
import { isDefault } from "./registry.js";

// Longest single-line options object before it is split one option per line.
const MAX_INLINE_LENGTH = 64;
const INDENT = "    ";

const codeOf = (param, value) => {
  if (param.control === "checkbox") return String(Boolean(value));
  if (param.control === "select") {
    return param.options.find((option) => option.value === Number(value))?.code ?? String(value);
  }
  return String(Number(formatValue(param, value)));
};

const optionsOf = (entry) => {
  const { definition, filter } = entry;
  const options = [];
  if (entry.texture) options.push(`texture: ${entry.texture}Texture`);
  for (const param of [...definition.params, ...ADVANCED_PARAMS]) {
    const value = filter[param.property];
    if (!isDefault(param, value)) options.push(`${param.property}: ${codeOf(param, value)}`);
  }
  if (!filter.on) options.push("on: false");
  return options;
};

const filterCode = (entry) => {
  const options = optionsOf(entry);
  const name = entry.definition.name;
  if (!options.length) return `${INDENT}new ${name}(),`;

  const inline = `{ ${options.join(", ")} }`;
  if (inline.length <= MAX_INLINE_LENGTH) return `${INDENT}new ${name}(${inline}),`;
  return `${INDENT}new ${name}({\n${options.map((option) => `${INDENT}  ${option},`).join("\n")}\n${INDENT}}),`;
};

export const createSnippetCode = (entries) =>
  [
    "const filterRenderer = new FilterRenderer({",
    "  context,",
    "  sourceTexture: framebuffer,",
    entries.length ? "  filters: [" : "  filters: [],",
    ...(entries.length ? [...entries.map(filterCode), "  ],"] : []),
    "});",
  ].join("\n");

const selectText = (node) => {
  const range = document.createRange();
  range.selectNodeContents(node);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
};

export const createSnippet = (root, chain) => {
  const code = root.querySelector("#snippet-code");
  const copyButton = root.querySelector("#copy-button");
  const status = root.querySelector("#copy-status");

  const render = () => {
    code.textContent = createSnippetCode(chain.entries);
    status.textContent = "";
  };

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(code.textContent);
      status.textContent = "Copied";
    } catch {
      selectText(code);
    }
  });

  chain.subscribe(render);
  render();
};
