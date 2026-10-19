// Parameter descriptor helpers and the parameters every filter shares.
// A descriptor: { property, label, control: "range" | "select" | "checkbox", default,
// initial, ...control options }. `default` is the library default (the snippet omits it),
// `initial` is the value a newly added filter starts with in the playground.

export const range = (property, label, min, max, step, defaultValue, initial = defaultValue) => ({
  property,
  label,
  control: "range",
  min,
  max,
  step,
  default: defaultValue,
  initial,
});

// `options`: [{ label, value, code }]; `code` is the source expression the snippet prints.
export const select = (property, label, options, defaultValue, initial = defaultValue) => ({
  property,
  label,
  control: "select",
  options,
  default: defaultValue,
  initial,
});

export const checkbox = (property, label, defaultValue = false) => ({
  property,
  label,
  control: "checkbox",
  default: defaultValue,
  initial: defaultValue,
});

// BaseFilter: mix with the original and the radial fade.
export const ADVANCED_PARAMS = [
  range("mix", "Mix", 0, 1, 0.01, 1),
  checkbox("isRadial", "Radial fade"),
  checkbox("invertRadial", "Invert radial"),
  range("centerX", "Center X", 0, 1, 0.01, 0.5),
  range("centerY", "Center Y", 0, 1, 0.01, 0.5),
  range("size", "Size", 0.05, 2, 0.01, 1),
  range("roundness", "Roundness", 0, 1, 0.01, 1),
  range("transition", "Transition", 0.1, 8, 0.1, 1),
];

// BaseTextureFilter: placement of the filter texture.
export const TEXTURE_PARAMS = [
  range("translateX", "Texture X", -1, 1, 0.01, 0),
  range("translateY", "Texture Y", -1, 1, 0.01, 0),
  range("cropX", "Crop X", 0, 1, 0.01, 0),
  range("cropY", "Crop Y", 0, 1, 0.01, 0),
  range("cropWidth", "Crop width", 0.05, 1, 0.01, 1),
  range("cropHeight", "Crop height", 0.05, 1, 0.01, 1),
];
