// Form controls built from parameter descriptors (see registry-advanced.js). Each control
// reads its start value from the filter and reports changes through `onInput(value)`.

const decimalsOf = (step) => (String(step).split(".")[1] || "").length;

export const formatValue = (param, value) => Number(value).toFixed(decimalsOf(param.step));

export const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const createRange = (param, value, onInput) => {
  const input = element("input");
  input.type = "range";
  input.min = param.min;
  input.max = param.max;
  input.step = param.step;
  input.value = value;
  const output = element("output", "param-value", formatValue(param, value));
  input.addEventListener("input", () => {
    output.textContent = formatValue(param, input.value);
    onInput(Number(input.value));
  });
  return [input, output];
};

const createSelect = (param, value, onInput) => {
  const input = element("select");
  for (const option of param.options) {
    const node = element("option", "", option.label);
    node.value = option.value;
    node.selected = option.value === Number(value);
    input.appendChild(node);
  }
  input.addEventListener("change", () => onInput(Number(input.value)));
  return [input];
};

const createCheckbox = (param, value, onInput) => {
  const input = element("input");
  input.type = "checkbox";
  input.checked = Boolean(value);
  input.addEventListener("change", () => onInput(input.checked));
  return [input];
};

const BUILDERS = { range: createRange, select: createSelect, checkbox: createCheckbox };

export const createControl = (param, value, onInput) => {
  const row = element("label", `param param-${param.control}`);
  row.appendChild(element("span", "param-label", param.label));
  for (const node of BUILDERS[param.control](param, value, onInput)) row.appendChild(node);
  return row;
};
