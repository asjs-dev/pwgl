// ColorLUTFilter grades. Each LUT is drawn as a strip of 16 slices of 16 x 16 side by side
// (256 x 16): red along a slice, green along the rows, blue selects the slice. `grade` maps an
// identity color (0-1) to the graded one. Strips are opaque, as the filter requires.

const LUT_SIZE = 16;

const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (c) => c * c * (3 - 2 * c);

// Teal shadows, warm highlights and a gentle S-curve.
const tealOrange = (r, g, b) => {
  const l = luma(r, g, b);
  return [smooth(r) + (l - 0.5) * 0.25, smooth(g) + 0.04, smooth(b) + (0.5 - l) * 0.3];
};

// Mostly desaturated, darker and blue: moonlight.
const coldNight = (r, g, b) => {
  const l = luma(r, g, b);
  const [dr, dg, db] = [r, g, b].map((c) => mix(c, l, 0.65) * 0.85);
  return [dr * 0.5, dg * 0.72 + 0.02, db + 0.08];
};

// Sepia toned, with lifted blacks and dimmed whites like faded print.
const vintage = (r, g, b) =>
  [
    [0.393, 0.769, 0.189],
    [0.349, 0.686, 0.168],
    [0.272, 0.534, 0.131],
  ].map(([wr, wg, wb], i) => mix([r, g, b][i], wr * r + wg * g + wb * b, 0.7) * 0.82 + 0.1);

// Bleach bypass: luminance overlaid on the color, then partly desaturated; harsh and silvery.
const bleachBypass = (r, g, b) => {
  const l = luma(r, g, b);
  return [r, g, b].map((c) => {
    const overlay = l < 0.5 ? 2 * c * l : 1 - 2 * (1 - c) * (1 - l);
    return mix(mix(c, overlay, 0.8), l, 0.4);
  });
};

// `name` is the key in the texture set (see textures.js) and the snippet's variable prefix.
export const LUTS = [
  { name: "identityLut", label: "Identity", grade: (r, g, b) => [r, g, b] },
  { name: "tealOrangeLut", label: "Teal / orange", grade: tealOrange },
  { name: "coldNightLut", label: "Cold night", grade: coldNight },
  { name: "vintageLut", label: "Vintage", grade: vintage },
  { name: "bleachBypassLut", label: "Bleach bypass", grade: bleachBypass },
];

export const drawLut = (grade) => {
  const canvas = document.createElement("canvas");
  canvas.width = LUT_SIZE * LUT_SIZE;
  canvas.height = LUT_SIZE;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const max = LUT_SIZE - 1;
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const color = grade((x % LUT_SIZE) / max, y / max, Math.floor(x / LUT_SIZE) / max);
      const bytes = color.map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255));
      imageData.data.set([...bytes, 255], (y * canvas.width + x) * 4);
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
};
