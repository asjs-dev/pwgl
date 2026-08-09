import { Stage2D } from "../../../src/exports";
import { createAtlas, createContext, createImage, setRendererSize } from "../helpers";

export const bufferLifecycle = {
  id: "buffer-lifecycle",
  title: "Buffer allocation and uploads",
  expectation:
    "A complete 6×3 colored tile grid. First, repeated and stress renders must be identical while the metrics expose allocation and upload behaviour.",
  create() {
    const context = createContext();
    const renderer = new Stage2D({ context, maxRenderCount: 4 });
    const texture = createAtlas();
    setRendererSize(renderer);
    renderer.clearBeforeRender = true;
    renderer.clearColor.set(0.025, 0.04, 0.065, 1);

    for (let row = 0; row < 3; row++) {
      for (let column = 0; column < 6; column++) {
        renderer.container.addChild(createImage(texture, 48 + column * 98, 48 + row * 104, (row * 2 + column) & 3, 86));
      }
    }

    return { context, render: () => renderer.render() };
  },
};
