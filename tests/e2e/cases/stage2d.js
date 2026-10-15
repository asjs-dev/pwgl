import { BlendMode, Stage2D, Texture, TintType } from "../../../src/exports";
import {
  BACKGROUND,
  checker,
  createCanvas,
  createSmallContext,
  createSmallStage,
  createSprite,
  quadrants,
  rgba,
  SMALL_HEIGHT,
  SMALL_WIDTH,
  solid,
} from "../helpers";

const RGBY = ["#ff0000", "#00ff00", "#0000ff", "#ffff00"];

export const painterOrder = {
  id: "painter-order",
  group: "Stage2D",
  title: "Painter order",
  expectation: "Red, green and blue rectangles overlap. Later children draw on top, the background shows the clear color.",
  create() {
    const context = createSmallContext();
    const stage = createSmallStage(context, { maxRenderCount: 8 });
    [
      ["#ff0000", 20, 20, 100, 90],
      ["#00ff00", 60, 40, 100, 70],
      ["#0000ff", 100, 60, 100, 60],
    ].forEach(([color, x, y, width, height]) => stage.container.addChild(createSprite(new Texture(solid(color)), x, y, width, height)));

    return {
      context,
      render: () => stage.render(),
      async check(t) {
        await t.renders(3);
        t.expectPx("red only", 30, 30, rgba("#ff0000"));
        t.expectPx("green over red", 80, 50, rgba("#00ff00"));
        t.expectPx("blue over green", 120, 80, rgba("#0000ff"));
        t.expectPx("background", 240, 135, BACKGROUND);
        await t.expectStable();
      },
    };
  },
};

export const batchSplit = {
  id: "batch-split",
  group: "Stage2D",
  title: "Batch split",
  expectation: "Twelve tiles in a 4×3 grid with maxRenderCount 5, so the batch flushes three times. Every tile must be present.",
  create() {
    const context = createSmallContext();
    const stage = createSmallStage(context, { maxRenderCount: 5 });
    const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];
    for (let i = 0; i < 12; i++) {
      stage.container.addChild(createSprite(new Texture(solid(colors[i % 6])), 8 + (i % 4) * 62, 6 + Math.floor(i / 4) * 46, 54, 40));
    }

    return {
      context,
      render: () => stage.render(),
      async check(t) {
        await t.renders(3);
        const probes = [];
        for (let i = 0; i < 12; i++) probes.push([`tile ${i + 1}`, 35 + (i % 4) * 62, 26 + Math.floor(i / 4) * 46, rgba(colors[i % 6])]);
        t.expectPxAll("tiles", probes, 40);
      },
    };
  },
};

export const atlasCrop = {
  id: "atlas-crop",
  group: "Stage2D",
  title: "Atlas crop",
  expectation: "One 2×2 atlas texture, four images each cropped to a different quadrant: red, green, blue, yellow from left to right.",
  create() {
    const context = createSmallContext();
    const stage = createSmallStage(context, { maxRenderCount: 4 });
    const atlas = new Texture(quadrants(RGBY));
    for (let i = 0; i < 4; i++) {
      const image = createSprite(atlas, 8 + i * 62, 40, 54, 64);
      const x = (i & 1) * 0.5;
      const y = (i >> 1) * 0.5;
      image.textureCrop.setRect({ x, y, width: x + 0.5, height: y + 0.5 });
      stage.container.addChild(image);
    }

    return {
      context,
      render: () => stage.render(),
      async check(t) {
        await t.renders(2);
        RGBY.forEach((color, i) => t.expectPx(`quadrant ${i + 1}`, 35 + i * 62, 72, rgba(color)));
      },
    };
  },
};

export const tintTypes = {
  id: "tint-types",
  group: "Stage2D",
  title: "Tint types",
  expectation:
    "Grey tiles tinted with NONE, MULTIPLY red, GRAYSCALE green, OVERRIDE blue and ADD red. The last tile is orange with GRAYSCALE and must stay orange.",
  create() {
    const context = createSmallContext();
    const stage = createSmallStage(context, { maxRenderCount: 8 });
    const grey = new Texture(solid("#808080"));
    const orange = new Texture(solid("#ff8000"));
    const specs = [
      ["NONE", grey, TintType.NONE, [1, 1, 1, 1], [128, 128, 128, 255]],
      ["MULTIPLY", grey, TintType.MULTIPLY, [1, 0, 0, 1], [128, 0, 0, 255]],
      ["GRAYSCALE", grey, TintType.GRAYSCALE, [0, 1, 0, 1], [0, 128, 0, 255]],
      ["OVERRIDE", grey, TintType.OVERRIDE, [0, 0, 1, 1], [0, 0, 255, 255]],
      ["ADD", grey, TintType.ADD, [0.25, 0, 0, 0], [192, 128, 128, 255]],
      ["GRAYSCALE on color", orange, TintType.GRAYSCALE, [0, 1, 0, 1], [255, 128, 0, 255]],
    ];
    specs.forEach(([, texture, type, color], i) => {
      const image = createSprite(texture, 6 + (i % 3) * 83, 8 + Math.floor(i / 3) * 68, 77, 60);
      image.tintType = type;
      image.color.set(...color);
      stage.container.addChild(image);
    });

    return {
      context,
      render: () => stage.render(),
      async check(t) {
        await t.renders(2);
        specs.forEach(([name, , , , expected], i) => t.expectPx(name, 44 + (i % 3) * 83, 38 + Math.floor(i / 3) * 68, expected, 36));
      },
    };
  },
};

export const blendModes = {
  id: "blend-modes",
  group: "Stage2D",
  title: "Blend modes",
  expectation:
    "A blue-ish square drawn over mid grey with each blend mode. NORMAL, ADD, MULTIPLY and SCREEN have exact expected colors; the rest must render without errors.",
  create() {
    const context = createSmallContext();
    const stage = createSmallStage(context, { maxRenderCount: 32 });
    stage.container.addChild(createSprite(new Texture(solid("#808080")), 0, 0, SMALL_WIDTH, SMALL_HEIGHT));
    const over = new Texture(solid("#4080c0"));
    const modes = ["NORMAL", "ADD", "MULTIPLY", "SCREEN", "OVERLAY", "EXCLUSION", "LIGHTEN", "DARKEN", "SRC_ATOP", "DST_OVER", "XOR", "SHADOW"];
    modes.forEach((mode, i) => {
      const image = createSprite(over, 6 + (i % 6) * 42, 10 + Math.floor(i / 6) * 66, 36, 56);
      image.blendMode = BlendMode[mode];
      stage.container.addChild(image);
    });
    const expected = { NORMAL: [64, 128, 192, 255], ADD: [192, 255, 255, 255], MULTIPLY: [32, 64, 96, 255], SCREEN: [160, 192, 224, 255] };

    return {
      context,
      render: () => stage.render(),
      async check(t) {
        await t.renders(2);
        modes.forEach((mode, i) => {
          const x = 24 + (i % 6) * 42;
          const y = 38 + Math.floor(i / 6) * 66;
          if (expected[mode]) t.expectPx(mode, x, y, expected[mode], 40);
          else t.note(`${mode} → ${t.formatPixel(t.px(x, y))}`);
        });
      },
    };
  },
};

export const repeatTextures = {
  id: "repeat-textures",
  group: "Stage2D",
  title: "Repeat textures",
  expectation:
    "A checkerboard texture repeated 4×4.5 on the left. On the right the same texture uses random rotation per cell; it must be identical on every frame.",
  create() {
    const context = createSmallContext();
    const stage = createSmallStage(context, { maxRenderCount: 4, useRepeatTextures: true });
    const texture = new Texture(checker("#ffffff", "#000000"));
    const plain = createSprite(texture, 0, 0, 128, 144);
    const rotated = createSprite(texture, 128, 0, 128, 144);
    [plain, rotated].forEach((image) => {
      image.textureTransform.repeatX = 4;
      image.textureTransform.repeatY = 4.5;
      stage.container.addChild(image);
    });
    rotated.textureTransform.repeatRandomRotation = 1;

    return {
      context,
      render: () => stage.render(),
      async check(t) {
        await t.renders(2);
        // One checker cell is 128 / (4 * 2) = 16 px wide and 144 / (4.5 * 2) = 16 px high.
        t.expectPx("cell (0,0) white", 8, 8, [255, 255, 255, 255], 50);
        t.expectPx("cell (1,0) black", 24, 8, [0, 0, 0, 255], 50);
        t.expectPx("cell (0,1) black", 8, 24, [0, 0, 0, 255], 50);
        t.expectPx("cell (5,3) white", 88, 56, [255, 255, 255, 255], 50);
        await t.expectStable("random rotation stable");
      },
    };
  },
};

export const quadDistortion = {
  id: "quad-distortion",
  group: "Stage2D",
  title: "Quad distortion",
  expectation:
    "A red rectangle whose top-left corner is pulled to the middle of its top edge, giving a trapezoid. The cut-off corner must show the background.",
  create() {
    const context = createSmallContext();
    const stage = createSmallStage(context, { maxRenderCount: 2, useDistortion: true });
    const image = createSprite(new Texture(solid("#ff0000")), 64, 32, 128, 80);
    image.distortion.topLeftX = 0.5;
    stage.container.addChild(image);

    return {
      context,
      render: () => stage.render(),
      async check(t) {
        await t.renders(2);
        t.expectPx("cut corner is background", 70, 36, BACKGROUND);
        t.expectPx("center is red", 150, 80, [255, 0, 0, 255]);
        t.expectPx("bottom-left still red", 70, 106, [255, 0, 0, 255]);
      },
    };
  },
};

// ---------- projective distortion ----------

const CELLS = 8;
const QUAD = { x: 16, y: 8, width: 224, height: 128 };
// Trapezoid corners in the unit quad (TL, TR, BR, BL): a floor seen in perspective.
const TRAPEZOID = [0.3, 0, 0.7, 0, 1, 1, 0, 1];

const checkerGrid = (cells, size = 64) =>
  createCanvas(size, size, (context) => {
    const cell = size / cells;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, size, size);
    context.fillStyle = "#000000";
    for (let j = 0; j < cells; j++) for (let i = (j + 1) % 2; i < cells; i += 2) context.fillRect(i * cell, j * cell, cell, cell);
  });

const toScreen = (corners) => corners.map((value, index) => (index % 2 ? QUAD.y + value * QUAD.height : QUAD.x + value * QUAD.width));

// Unit square → quad (TL, TR, BR, BL) homography.
const homography = ([x0, y0, x1, y1, x2, y2, x3, y3]) => {
  const dx1 = x1 - x2;
  const dx2 = x3 - x2;
  const dy1 = y1 - y2;
  const dy2 = y3 - y2;
  const sx = x0 - x1 + x2 - x3;
  const sy = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (sx * dy2 - dx2 * sy) / den;
  const h = (dx1 * sy - sx * dy1) / den;
  return (u, v) => {
    const w = g * u + h * v + 1;
    return [((x1 - x0 + g * x1) * u + (x3 - x0 + h * x3) * v + x0) / w, ((y1 - y0 + g * y1) * u + (y3 - y0 + h * y3) * v + y0) / w];
  };
};

// The texture coordinate the old per-triangle (affine) mapping gives at a screen point; the
// triangle strip splits the quad along the TR–BL diagonal.
const affineUv = ([x0, y0, x1, y1, x2, y2, x3, y3], [px, py]) => {
  const triangles = [
    [[x0, y0, 0, 0], [x1, y1, 1, 0], [x3, y3, 0, 1]],
    [[x1, y1, 1, 0], [x3, y3, 0, 1], [x2, y2, 1, 1]],
  ];
  for (const [a, b, c] of triangles) {
    const den = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
    const wa = ((b[1] - c[1]) * (px - c[0]) + (c[0] - b[0]) * (py - c[1])) / den;
    const wb = ((c[1] - a[1]) * (px - c[0]) + (a[0] - c[0]) * (py - c[1])) / den;
    const wc = 1 - wa - wb;
    if (wa >= 0 && wb >= 0 && wc >= 0) return [wa * a[2] + wb * b[2] + wc * c[2], wa * a[3] + wb * b[3] + wc * c[3]];
  }
};

const lineDistance = ([ax, ay], [bx, by], [px, py]) => Math.abs((bx - ax) * (py - ay) - (by - ay) * (px - ax)) / Math.hypot(bx - ax, by - ay);

const WHITE = [255, 255, 255, 255];
const BLACK = [0, 0, 0, 255];
const cellColor = (i, j) => ((i + j) % 2 ? BLACK : WHITE);

// Probes at the projected centers of the checker cells at least 4 px away from every cell
// edge, and how many of them the affine mapping would color wrong.
const projectiveProbes = (screen) => {
  const map = homography(screen);
  const probes = [];
  let affineMisses = 0;
  for (let j = 0; j < CELLS; j++)
    for (let i = 0; i < CELLS; i++) {
      const center = map((i + 0.5) / CELLS, (j + 0.5) / CELLS);
      const [a, b, c, d] = [
        [i, j],
        [i + 1, j],
        [i + 1, j + 1],
        [i, j + 1],
      ].map(([u, v]) => map(u / CELLS, v / CELLS));
      if (Math.min(...[[a, b], [b, c], [c, d], [d, a]].map(([from, to]) => lineDistance(from, to, center))) < 4) continue;
      const [x, y] = center.map(Math.round);
      probes.push([`cell (${i},${j})`, x, y, cellColor(i, j)]);
      const [u, v] = affineUv(screen, center);
      if (cellColor(Math.floor(u * CELLS), Math.floor(v * CELLS)) !== cellColor(i, j)) affineMisses++;
    }
  return { probes, affineMisses };
};

const createProjectiveCase = ({ id, title, repeat }) => ({
  id,
  group: "Stage2D",
  title,
  expectation: `A ${CELLS}×${CELLS} black-and-white checkerboard${
    repeat ? " (a 4×4 texture repeated 2×2)" : ""
  } on a trapezoid, mapped like a floor in perspective: cell edges stay straight and continuous across the quad diagonal.`,
  create() {
    const context = createSmallContext();
    const stage = createSmallStage(context, { maxRenderCount: 2, useRepeatTextures: repeat });
    const image = createSprite(new Texture(checkerGrid(repeat ? CELLS / 2 : CELLS)), QUAD.x, QUAD.y, QUAD.width, QUAD.height);
    image.distortion.cache.set(TRAPEZOID);
    if (repeat) image.textureTransform.repeatX = image.textureTransform.repeatY = 2;
    stage.container.addChild(image);
    const { probes, affineMisses } = projectiveProbes(toScreen(TRAPEZOID));

    return {
      context,
      render: () => stage.render(),
      async check(t) {
        await t.renders(2);
        t.check("an affine mapping would fail some probes", affineMisses > 0, `${affineMisses}/${probes.length}`);
        t.expectPxAll("homography cells", probes, 60);
        await t.expectStable();
      },
    };
  },
});

export const projectiveDistortion = createProjectiveCase({
  id: "projective-distortion",
  title: "Projective distortion",
  repeat: false,
});

export const projectiveRepeatDistortion = createProjectiveCase({
  id: "projective-repeat-distortion",
  title: "Projective distortion, repeat texture",
  repeat: true,
});

export const concaveDistortion = {
  id: "concave-distortion",
  group: "Stage2D",
  title: "Concave distortion",
  expectation:
    "A checkerboard whose bottom-right corner is pulled inside the quad, giving a concave arrowhead. It falls back to the affine mapping and renders without errors.",
  create() {
    const context = createSmallContext();
    const stage = createSmallStage(context, { maxRenderCount: 2 });
    const image = createSprite(new Texture(checkerGrid(CELLS)), QUAD.x, QUAD.y, QUAD.width, QUAD.height);
    image.distortion.cache.set([0, 0, 1, 0, 0.35, 0.35, 0, 1]);
    stage.container.addChild(image);
    const at = (u, v) => [Math.round(QUAD.x + u * QUAD.width), Math.round(QUAD.y + v * QUAD.height)];

    return {
      context,
      render: () => stage.render(),
      async check(t) {
        await t.renders(2);
        // The TL–TR–BL triangle keeps the undistorted mapping: unit (0.06,0.06) is cell (0,0).
        t.expectPx("top-left cell white", ...at(0.06, 0.06), WHITE, 60);
        t.expectPx("cell (1,0) black", ...at(0.19, 0.06), BLACK, 60);
        t.expectPx("outside the concave corner is background", ...at(0.8, 0.8), BACKGROUND);
        await t.expectStable();
      },
    };
  },
};

const filled = (size, color) =>
  createCanvas(size, size, (context) => {
    context.fillStyle = color;
    context.fillRect(0, 0, size, size);
  });

export const mipmapFilters = {
  id: "mipmap-filters",
  group: "Stage2D",
  title: "Mipmap min filters",
  expectation:
    "Three small squares from 64×64 textures: red with a mipmap filter, green switched to a mipmap filter at runtime, blue with LINEAR. None may turn black from missing mipmaps.",
  create() {
    const context = createSmallContext();
    const stage = createSmallStage(context, { maxRenderCount: 4 });
    const mipmapped = new Texture(filled(64, "#ff0000"));
    const switched = new Texture(filled(64, "#00ff00"));
    const linear = new Texture(filled(64, "#0000ff"));
    [mipmapped, switched, linear].forEach((texture) => (texture.maxMipMapLevel = 6));
    mipmapped.minFilter = WebGL2RenderingContext.LINEAR_MIPMAP_LINEAR;
    [mipmapped, switched, linear].forEach((texture, index) => stage.container.addChild(createSprite(texture, 24 + index * 80, 56, 16, 16)));

    return {
      context,
      render: () => stage.render(),
      async check(t) {
        await t.renders(2);
        t.expectPx("mipmap filter red", 32, 64, rgba("#ff0000"));
        t.expectPx("LINEAR green", 112, 64, rgba("#00ff00"));
        t.expectPx("LINEAR blue", 192, 64, rgba("#0000ff"));
        switched.minFilter = WebGL2RenderingContext.NEAREST_MIPMAP_NEAREST;
        await t.renders(2);
        t.expectPx("switched to mipmap filter, still green", 112, 64, rgba("#00ff00"));
        await t.expectStable();
      },
    };
  },
};

export const textureResize = {
  id: "texture-resize",
  group: "Stage2D",
  title: "Texture size change",
  expectation:
    "A texture swaps its 8×8 red source for a 64×64 blue one with a 2 px yellow border. The border must reach the sprite edges, so the new size reached the shader.",
  create() {
    const context = createSmallContext();
    const stage = createSmallStage(context, { maxRenderCount: 2 });
    const texture = new Texture(solid("#ff0000"));
    stage.container.addChild(createSprite(texture, 20, 20, 64, 64));

    return {
      context,
      render: () => stage.render(),
      async check(t) {
        await t.renders(1);
        t.expectPx("before swap red", 52, 52, rgba("#ff0000"));
        texture.source = createCanvas(64, 64, (canvasContext) => {
          canvasContext.fillStyle = "#ffff00";
          canvasContext.fillRect(0, 0, 64, 64);
          canvasContext.fillStyle = "#0000ff";
          canvasContext.fillRect(2, 2, 60, 60);
        });
        await t.renders(1);
        t.expectPx("after swap interior blue", 52, 52, rgba("#0000ff"));
        t.expectPxAll(
          "border pixels yellow",
          [
            ["left", 20, 52, rgba("#ffff00")],
            ["right", 83, 52, rgba("#ffff00")],
            ["top", 52, 20, rgba("#ffff00")],
            ["bottom", 52, 83, rgba("#ffff00")],
          ],
        );
        await t.expectStable();
      },
    };
  },
};

export const sharedContextStages = {
  id: "shared-context-stages",
  group: "Stage2D",
  title: "Two stages on one context",
  expectation:
    "Two Stage2D renderers share a context and alternate every frame: red and green tiles on the left, blue, yellow and cyan tiles on the right. Program switches must not mix up texture slots.",
  create() {
    const context = createSmallContext();
    const left = createSmallStage(context, { maxRenderCount: 8 });
    const right = new Stage2D({ context, maxRenderCount: 8 });
    right.setSize(SMALL_WIDTH, SMALL_HEIGHT);
    const leftColors = ["#ff0000", "#00ff00"];
    const rightColors = ["#0000ff", "#ffff00", "#00ffff"];
    leftColors.forEach((color, index) => left.container.addChild(createSprite(new Texture(filled(16 + index * 16, color)), 8 + index * 56, 40, 48, 64)));
    rightColors.forEach((color, index) => right.container.addChild(createSprite(new Texture(filled(8 + index * 24, color)), 128 + index * 42, 40, 36, 64)));

    return {
      context,
      render() {
        left.render();
        right.render();
      },
      async check(t) {
        await t.renders(4);
        t.expectPxAll(
          "tiles",
          [...leftColors.map((color, index) => [color, 32 + index * 56, 72, rgba(color)]), ...rightColors.map((color, index) => [color, 146 + index * 42, 72, rgba(color)])],
        );
        await t.expectStable("identical on repeated frames", 3);
      },
    };
  },
};

export const stage2dCases = [
  painterOrder,
  batchSplit,
  atlasCrop,
  tintTypes,
  blendModes,
  repeatTextures,
  quadDistortion,
  projectiveDistortion,
  projectiveRepeatDistortion,
  concaveDistortion,
  mipmapFilters,
  textureResize,
  sharedContextStages,
];
