import { BlendMode, Container, Stage2D } from "../../../src/exports";
import { createAtlas, createContext, createImage, setRendererSize } from "../helpers";

export const stage2dBatch = {
  id: "stage2d-batch",
  group: "Stage2D",
  title: "Stage2D batching and blend flush",
  expectation: "Four clean rows of overlapping colored tiles. The additive middle tile must glow without corrupting its neighbours or painter order.",
  create() {
    const context = createContext();
    const renderer = new Stage2D({ context, maxRenderCount: 9 });
    const texture = createAtlas();
    const group = new Container();
    setRendererSize(renderer);
    renderer.clearBeforeRender = true;
    renderer.clearColor.set(0.025, 0.04, 0.065, 1);
    renderer.container.addChild(group);

    for (let row = 0; row < 4; row++) {
      for (let column = 0; column < 7; column++) {
        const image = createImage(texture, 54 + column * 82, 28 + row * 80, (row + column) & 3, 92);
        if (column === 3) {
          image.blendMode = BlendMode.ADD;
          image.color.a = 0.65;
        }
        group.addChild(image);
      }
    }

    return { context, render: () => renderer.render() };
  },
};
