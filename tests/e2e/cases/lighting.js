import {
  AmbientOcclusionMapRenderer,
  Framebuffer,
  Light,
  LightRenderer,
  NormalMapRenderer,
  Texture,
  Utils,
} from "../../../src/exports";
import { createSmallContext, createSmallStage, createSprite, SMALL_HEIGHT, SMALL_WIDTH, solid } from "../helpers";

// A floor with pillars: the scene is drawn once in color and once as a height map
// (red: occluder bottom, green: occluder top), then normal map, optional AO and lights.
const createLightScene = ({ pillars = [], pillarHeight = "#00ff00", ao = false, maxLights = 16 }) => {
  const context = createSmallContext();
  const sceneFramebuffer = new Framebuffer();
  const heightFramebuffer = new Framebuffer();
  const normalFramebuffer = new Framebuffer();
  const aoFramebuffer = new Framebuffer();
  const light = new LightRenderer({
    context,
    maxRenderCount: maxLights,
    sourceTexture: ao ? aoFramebuffer : sceneFramebuffer,
    normalMap: normalFramebuffer,
    heightMap: heightFramebuffer,
  });
  const scene = createSmallStage(context, { maxRenderCount: 64, lightRenderer: light });
  const heights = createSmallStage(context, { maxRenderCount: 64 });
  heights.clearColor.set(0, 0, 0, 1);
  const normal = new NormalMapRenderer({ context, heightMap: heightFramebuffer });
  const occlusion = ao
    ? new AmbientOcclusionMapRenderer({ context, sourceTexture: sceneFramebuffer, heightMap: heightFramebuffer, samples: 3, radius: 30, multiplier: 30, depthMultiplier: 0.3 })
    : null;
  [light, normal, occlusion].forEach((renderer) => renderer?.setSize(SMALL_WIDTH, SMALL_HEIGHT));

  const floor = new Texture(solid("#9a9a9a"));
  const pillar = new Texture(solid("#d0c0a0"));
  const floorHeight = new Texture(solid("#000000"));
  const pillarHeightTexture = new Texture(solid(pillarHeight));
  scene.container.addChild(createSprite(floor, 0, 0, SMALL_WIDTH, SMALL_HEIGHT));
  heights.container.addChild(createSprite(floorHeight, 0, 0, SMALL_WIDTH, SMALL_HEIGHT));
  pillars.forEach(([x, y, width, height]) => {
    scene.container.addChild(createSprite(pillar, x, y, width, height));
    heights.container.addChild(createSprite(pillarHeightTexture, x, y, width, height));
  });

  return {
    context,
    scene,
    heights,
    occlusion,
    sceneFramebuffer,
    heightFramebuffer,
    render() {
      scene.renderToFramebuffer(sceneFramebuffer);
      heights.renderToFramebuffer(heightFramebuffer);
      normal.renderToFramebuffer(normalFramebuffer);
      occlusion?.renderToFramebuffer(aoFramebuffer);
      light.render();
    },
  };
};

const createLight = (x, y, z, radius, color) => {
  const light = new Light();
  light.transform.x = x;
  light.transform.y = y;
  light.transform.z = z;
  light.transform.width = radius;
  light.color.set(...color);
  return light;
};

export const lightPipeline = {
  id: "light-pipeline",
  group: "Lighting",
  title: "Light, normal map and shadow",
  expectation:
    "A floor with one tall pillar and a point light to its left. Near the light is brighter than the far corner, and the area behind the pillar is in shadow.",
  create() {
    const scene = createLightScene({ pillars: [[120, 60, 16, 24]] });
    scene.scene.container.addChild(createLight(80, 72, 40, 180, [1, 0.95, 0.85, 3]));

    return {
      context: scene.context,
      render: scene.render,
      async check(t) {
        await t.renders(3);
        const near = t.luminance(t.px(90, 72));
        const far = t.luminance(t.px(250, 8));
        const shadow = t.luminance(t.px(160, 72));
        const open = t.luminance(t.px(80, 112));
        const { maxLuminance } = t.region(0, 0, SMALL_WIDTH, SMALL_HEIGHT);
        t.check("frame is not blank", maxLuminance > 30, `max luminance ${maxLuminance.toFixed(0)}`);
        t.check("near light brighter than far corner", near > far + 15, `${near.toFixed(0)} vs ${far.toFixed(0)}`);
        t.check("behind pillar darker than open floor at same distance", shadow < open * 0.6, `${shadow.toFixed(0)} vs ${open.toFixed(0)}`);
        await t.expectStable();
      },
    };
  },
};

// Thin casters far from the light are where sparse shadow sampling breaks first: their shadow must
// start solid at the caster, for both soft and flattened shadows.
const createShadowSamplingCase = (flatten) => ({
  id: flatten ? "shadow-sampling-flat" : "shadow-sampling",
  group: "Lighting",
  title: flatten ? "Flattened shadow sampling" : "Shadow sampling",
  expectation: `Five 3 px poles in a row, lit from the left by one ${flatten ? "flattenShadow " : ""}point light. Each pole's shadow must be solid right behind it, at every distance from the light, and identical on repeated frames.`,
  create() {
    const poles = [40, 80, 120, 160, 200].map((x) => [x, 71, 3, 3]);
    const scene = createLightScene({ pillars: poles, pillarHeight: "#00c800" });
    const light = createLight(10, 72, 60, 300, [1, 1, 1, 3]);
    light.flattenShadow = flatten;
    scene.scene.container.addChild(light);

    return {
      context: scene.context,
      render: scene.render,
      async check(t) {
        await t.renders(2);
        const probes = [];
        poles.forEach(([x]) => {
          // Floor 12 px above the shadow line, at the same distance from the light.
          const open = t.luminance(t.px(x + 6, 60));
          for (const dx of [5, 7, 9]) {
            const lum = t.luminance(t.px(x + dx, 72));
            probes.push({ name: `pole x${x} +${dx}px`, x: x + dx, ok: lum < open * 0.6, detail: `${lum.toFixed(0)} vs ${open.toFixed(0)}` });
          }
        });
        const bad = probes.filter((probe) => !probe.ok);
        t.check(
          `${probes.length - bad.length}/${probes.length} contact shadow samples dark`,
          !bad.length,
          bad
            .slice(0, 4)
            .map((probe) => `${probe.name} ${probe.detail}`)
            .join("; "),
        );
        await t.expectStable();
      },
    };
  },
});

export const ambientOcclusion = {
  id: "ambient-occlusion",
  group: "Lighting",
  title: "Ambient occlusion + directional light",
  expectation:
    "Three pillars, an AmbientOcclusionMapRenderer pass and a directional light. Floor next to a pillar must be darker than open floor, both in the raw AO pass and after lighting.",
  create() {
    const scene = createLightScene({
      ao: true,
      pillars: [
        [60, 50, 24, 40],
        [140, 30, 30, 30],
        [190, 90, 30, 30],
      ],
    });
    const light = createLight(128, 72, 300, 100, [1, 1, 1, 1]);
    light.type = Light.Type.DIRECTIONAL;
    light.castShadow = false;
    light.transform.rotation = 45 * Utils.THETA;
    scene.scene.container.addChild(light);

    return {
      context: scene.context,
      render: scene.render,
      async check(t) {
        await t.renders(2, () => {
          scene.scene.renderToFramebuffer(scene.sceneFramebuffer);
          scene.heights.renderToFramebuffer(scene.heightFramebuffer);
          scene.occlusion.render();
        });
        const aoNear = t.luminance(t.px(56, 70));
        const aoOpen = t.luminance(t.px(16, 126));
        t.check("AO pass darkens floor next to a pillar", aoNear < aoOpen - 4, `${aoNear.toFixed(0)} vs ${aoOpen.toFixed(0)}`);
        await t.renders(3);
        const nearPillar = t.luminance(t.px(56, 70));
        const openFloor = t.luminance(t.px(16, 126));
        const { maxLuminance } = t.region(0, 0, SMALL_WIDTH, SMALL_HEIGHT);
        t.check("frame is not blank", maxLuminance > 30, `max luminance ${maxLuminance.toFixed(0)}`);
        t.check("occluded floor darker than open floor", nearPillar < openFloor, `${nearPillar.toFixed(0)} vs ${openFloor.toFixed(0)}`, true);
        await t.expectStable();
      },
    };
  },
};

export const lightStress = {
  id: "light-stress",
  group: "Lighting",
  title: "Many shadow-casting lights",
  expectation: "400 shadow-casting point lights over twelve pillars, rendered for 20 frames. Reports the average frame time; above 33 ms is a warning.",
  create() {
    const pillars = [];
    for (let i = 0; i < 12; i++) pillars.push([16 + (i % 6) * 40, 30 + Math.floor(i / 6) * 60, 12, 20]);
    const scene = createLightScene({ pillars, maxLights: 400 });
    for (let i = 0; i < 400; i++) {
      scene.scene.container.addChild(
        createLight((i % 20) * 13 + 6, Math.floor(i / 20) * 7.5 + 4, 30, 40, [0.3 + (i % 3) * 0.3, 0.6, 1 - (i % 3) * 0.3, 0.4]),
      );
    }

    return {
      context: scene.context,
      render: scene.render,
      async check(t) {
        scene.render();
        t.finish();
        const startedAt = performance.now();
        for (let i = 0; i < 20; i++) {
          scene.render();
          t.finish();
        }
        const ms = (performance.now() - startedAt) / 20;
        const { maxLuminance } = t.region(0, 0, SMALL_WIDTH, SMALL_HEIGHT);
        t.check("context still alive", !t.context.isLost(), t.context.isLost() ? "lost" : "ok");
        t.check("frame is not blank", maxLuminance > 30, `max luminance ${maxLuminance.toFixed(0)}`);
        t.check("average frame time ≤ 33 ms", ms <= 33, `${ms.toFixed(1)} ms (GPU-synced)`, true);
      },
    };
  },
};

export const lightingCases = [lightPipeline, createShadowSamplingCase(false), createShadowSamplingCase(true), ambientOcclusion, lightStress];
