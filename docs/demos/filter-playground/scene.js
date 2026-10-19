// Source scene: a Stage2D with a backdrop and two cards, rendered into a Framebuffer that
// feeds the FilterRenderer. Static mode re-renders only after a change; animated mode
// moves the cards and renders every frame.

import { Framebuffer, Image, Stage2D } from "../../assets/pwgl.es.js";

const createImage = (stage2D, texture) => {
  const image = new Image(texture);
  image.transform.anchorX = image.transform.anchorY = 0.5;
  stage2D.container.addChild(image);
  return image;
};

export const createScene = (context, textures) => {
  const stage2D = new Stage2D({ context });
  stage2D.clearBeforeRender = true;
  stage2D.clearColor.set(0, 0, 0, 1);

  const framebuffer = new Framebuffer();
  const backdrop = createImage(stage2D, textures.backdrop);
  const wheel = createImage(stage2D, textures.wheel);
  const checker = createImage(stage2D, textures.checker);

  let width = 1;
  let height = 1;
  let animated = false;
  let dirty = true;
  // Scene clock (s); it only advances while animated, so pausing keeps the last frame.
  let time = 0;

  const layout = () => {
    const card = height * 0.42;
    backdrop.transform.x = width / 2;
    backdrop.transform.y = height / 2;
    backdrop.transform.width = width;
    backdrop.transform.height = height;

    wheel.transform.x = width * (0.28 + Math.sin(time * 0.7) * 0.06);
    wheel.transform.y = height * (0.62 + Math.cos(time * 0.9) * 0.05);
    wheel.transform.width = wheel.transform.height = card;
    wheel.transform.rotation = time * 0.8;

    checker.transform.x = width * (0.72 + Math.cos(time * 0.6) * 0.05);
    checker.transform.y = height * 0.66;
    checker.transform.width = checker.transform.height = card * 0.8;
    checker.transform.rotation = 0.2 + Math.sin(time * 0.5) * 0.3;
  };

  return {
    framebuffer,
    setSize(w, h) {
      width = w;
      height = h;
      stage2D.setSize(w, h);
      dirty = true;
    },
    setAnimated(value) {
      animated = value;
      dirty = true;
    },
    // `dt` is the frame time in seconds.
    render(dt) {
      if (!animated && !dirty) return;
      if (animated) time += dt;
      layout();
      stage2D.renderToFramebuffer(framebuffer);
      dirty = false;
    },
  };
};
