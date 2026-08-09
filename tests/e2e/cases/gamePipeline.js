import {
  BrightnessFilter,
  FilterRenderer,
  Framebuffer,
  Image,
  NormalMapRenderer,
  Stage2D,
  Texture,
} from "../../../src/exports";
import { createAtlasSource, createContext, createImage, setRendererSize, HEIGHT, WIDTH } from "../helpers";

export const gamePipeline = {
  id: "game-pipeline",
  title: "Game demo lifecycle",
  expectation: "A filtered colored grid with a blue normal-map preview in the top-right. Repeated renders must remain identical and complete.",
  create() {
    const context = createContext();
    const sceneRenderer = new Stage2D({ context, maxRenderCount: 5 });
    const heightRenderer = new Stage2D({ context, maxRenderCount: 5 });
    const normalRenderer = new NormalMapRenderer({ context });
    const compositor = new Stage2D({ context, maxRenderCount: 2 });
    const scene = new Framebuffer();
    const filteredScene = new Framebuffer();
    const heightMap = new Framebuffer();
    const normalMap = new Framebuffer();
    const texture = new Texture();
    const colorSource = createAtlasSource();
    const heightSource = createAtlasSource(["#202020", "#606060", "#a0a0a0", "#e0e0e0"]);
    const filterRenderer = new FilterRenderer({
      context,
      sourceTexture: scene,
      filters: [new BrightnessFilter({ intensity: 1.08 })],
    });

    [sceneRenderer, heightRenderer, normalRenderer, compositor, filterRenderer].forEach(setRendererSize);
    sceneRenderer.clearBeforeRender = heightRenderer.clearBeforeRender = compositor.clearBeforeRender = true;
    sceneRenderer.clearColor.set(0.02, 0.025, 0.04, 1);
    heightRenderer.clearColor.set(0, 0, 0, 1);
    compositor.clearColor.set(0.02, 0.025, 0.04, 1);
    normalRenderer.heightMap = heightMap;

    for (let row = 0; row < 3; row++) {
      for (let column = 0; column < 5; column++) {
        const x = 48 + column * 116;
        const y = 48 + row * 104;
        sceneRenderer.container.addChild(createImage(texture, x, y, row + column & 3, 98));
        heightRenderer.container.addChild(createImage(texture, x, y, row + column & 3, 98));
      }
    }

    const sceneImage = new Image(filteredScene);
    sceneImage.transform.width = WIDTH;
    sceneImage.transform.height = HEIGHT;
    compositor.container.addChild(sceneImage);
    const normalPreview = new Image(normalMap);
    normalPreview.transform.x = WIDTH - 174;
    normalPreview.transform.y = 14;
    normalPreview.transform.width = 160;
    normalPreview.transform.height = 90;
    compositor.container.addChild(normalPreview);

    return {
      context,
      render() {
        texture.source = colorSource;
        sceneRenderer.renderToFramebuffer(scene);
        texture.source = heightSource;
        heightRenderer.renderToFramebuffer(heightMap);
        normalRenderer.renderToFramebuffer(normalMap);
        filterRenderer.renderToFramebuffer(filteredScene);
        compositor.render();
      },
    };
  },
};
