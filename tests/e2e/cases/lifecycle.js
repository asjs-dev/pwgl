import { Texture } from "../../../src/exports";
import { createSmallContext, createSmallStage, createSprite, quadrants, SMALL_HEIGHT, SMALL_WIDTH } from "../helpers";
import { sleep } from "../checks";

export const contextRestore = {
  id: "context-restore",
  group: "Lifecycle",
  title: "Context loss and restore",
  expectation:
    "The WebGL context is deliberately lost with WEBGL_lose_context. PWGL restores it, rebuilds programs and re-uploads textures; the frame must match the one before the loss.",
  losesContext: true,
  create() {
    const context = createSmallContext();
    const stage = createSmallStage(context, { maxRenderCount: 4 });
    stage.container.addChild(createSprite(new Texture(quadrants(["#ff0000", "#00ff00", "#0000ff", "#ffff00"])), 32, 16, 192, 112));

    return {
      context,
      render: () => stage.render(),
      async check(t) {
        await t.renders(2);
        const before = t.snapshot();
        const extension = context.gl.getExtension("WEBGL_lose_context");
        if (!extension) {
          t.check("WEBGL_lose_context available", false, "extension missing");
          return;
        }
        const restored = new Promise((resolve) => context.canvas.addEventListener("webglcontextrestored", () => resolve(true), { once: true }));
        extension.loseContext();
        t.check("context reports lost", context.gl.isContextLost());
        const ok = await Promise.race([restored, sleep(3000).then(() => false)]);
        t.check("context restored within 3 s", ok, ok ? "restored" : "timeout");
        if (!ok) return;
        await sleep(20);
        const { width, height } = context.canvas;
        t.check("canvas size kept after restore", width === SMALL_WIDTH && height === SMALL_HEIGHT, `${width}×${height} (was ${SMALL_WIDTH}×${SMALL_HEIGHT})`);
        await t.renders(2);
        const changed = t.diffCount(before);
        t.check("frame matches pre-loss frame", changed < 50, `${changed} px differ`);
      },
    };
  },
};
