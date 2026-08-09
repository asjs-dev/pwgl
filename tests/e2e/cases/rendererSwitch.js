import { NormalMapRenderer, Stage2D, Framebuffer } from "../../../src/exports";
import { createAtlas, createContext, createImage, setRendererSize } from "../helpers";

export const rendererSwitch = {
  id: "renderer-switch",
  title: "Program and framebuffer switching",
  expectation: "A stable blue-violet normal map made from twelve height tiles. Repeated renders must not drop tiles or reuse the wrong VAO/program.",
  create() {
    const context = createContext();
    const heightRenderer = new Stage2D({ context, maxRenderCount: 4 });
    const normalRenderer = new NormalMapRenderer({ context });
    const heightMap = new Framebuffer();
    const texture = createAtlas();
    setRendererSize(heightRenderer);
    setRendererSize(normalRenderer);
    heightRenderer.clearBeforeRender = true;
    heightRenderer.clearColor.set(0, 0, 0, 1);
    normalRenderer.heightMap = heightMap;

    for (let i = 0; i < 12; i++) {
      const image = createImage(texture, 70 + (i % 4) * 132, 44 + Math.floor(i / 4) * 105, i & 3, 112);
      image.color.set(0.2, 0.2 + (i % 4) * 0.2, 0.2, 1);
      heightRenderer.container.addChild(image);
    }

    return {
      context,
      render() {
        heightRenderer.renderToFramebuffer(heightMap);
        normalRenderer.render();
      },
    };
  },
};
