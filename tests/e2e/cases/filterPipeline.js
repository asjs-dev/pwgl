import { BlurFilter, BrightnessFilter, FilterRenderer, Framebuffer, Stage2D } from "../../../src/exports";
import { createAtlas, createContext, createImage, setRendererSize } from "../helpers";

export const filterPipeline = {
  id: "filter-pipeline",
  group: "Filters",
  title: "Framebuffer filter ping-pong",
  expectation:
    "A softly blurred bright 5×3 tile grid. No black frame, stale framebuffer, missing tile or alternating output is valid.",
  create() {
    const context = createContext();
    const stage = new Stage2D({ context, maxRenderCount: 5 });
    const source = new Framebuffer();
    const filters = new FilterRenderer({
      context,
      sourceTexture: source,
      filters: [new BrightnessFilter({ intensity: 1.15 }), new BlurFilter({ intensity: 1.25 })],
    });
    const texture = createAtlas();
    setRendererSize(stage);
    setRendererSize(filters);
    stage.clearBeforeRender = true;
    stage.clearColor.set(0.02, 0.025, 0.04, 1);

    for (let row = 0; row < 3; row++) {
      for (let column = 0; column < 5; column++) {
        stage.container.addChild(createImage(texture, 62 + column * 112, 46 + row * 104, (row + column) & 3, 96));
      }
    }

    return {
      context,
      render() {
        // stage.render();
        stage.renderToFramebuffer(source);
        filters.render();
      },
    };
  },
};
