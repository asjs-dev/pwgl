# PWGL – 2D WebGL2 JavaScript Framework

A JavaScript framework for creating **2D WebGL2 applications**.

![Game Demo](https://github.com/asjs-dev/pwgl/blob/main/docs/assets/game.png?raw=true)

---

## Demos

- [Top View Game Demo](https://asjs-dev.github.io/pwgl/example/shGameDemo.html)
- [Custom Renderer - Wolfenstein 3D](https://asjs-dev.github.io/pwgl/example/wolfenstein.html)
- [Card Game Demo](https://asjs-dev.github.io/pwgl/example/cardGameDemo.html)
- [Displacement Filter](https://asjs-dev.github.io/pwgl/example/rainDropsDemo.html)
- [2D Lights and Shadows](https://asjs-dev.github.io/pwgl/example/lightDemo.html)
- [Lights, Shadows and Filters](https://asjs-dev.github.io/pwgl/example/boatDemo.html)
- [Journey](https://asjs-dev.github.io/pwgl/example/journeyDemo.html)

---

## Features

- High-performance batch rendering (10.000+ elements at 60fps)
- Dynamic 2D lights and shadows
- Element picker (clickable renderables)
- Image filters (Blur, Pixelate, Distortion, etc.)
  - [Filters folder](https://github.com/asjs-dev/pwgl/blob/main/src/filters)
- Video textures
- Framebuffer and filter renderers
- Minified and lightweight builds for faster load
- Fully WebGL2 compatible, falls back gracefully if WebGL2 is not supported

---

## Builds

PWGL provides multiple builds for different use cases.

**Vite 4 production builds:**

| File                             | Format                              |
| -------------------------------- | ----------------------------------- |
| `dist/pwgl.es.min.js`            | ES Module, minified                 |
| `dist/pwgl.umd.min.js`           | UMD, minified                       |
| `dist/pwgl.extensions.es.min.js` | ES Module with extensions, minified |
| `dist/pwgl.extensions.umd.js`    | UMD with extensions, minified       |

**Extra highly compressed builds (auto-generated during development/optimization build):**

- `dist/pwgl.min.js` – minimal core build
- `dist/pwgl.extensions.min.js` – minimal build with extensions

> ⚠️ These extra compressed builds are **not standalone build targets** and are produced automatically during the development/optimization build process.

---

## How to use

Create your index html ( include pwgl.min.js )

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="pwgl.min.js" type="text/javascript"></script>
    <script src="pwgl.extensions.min.js" type="text/javascript"></script>
  </head>
  <body></body>
</html>
```

Add your script

```javascript
class Application {
  constructor() {}
}

PWGL.Utils.initApplication(function (isWebGl2Supported) {
  if (!isWebGl2Supported) {
    // WebGL 2 is not supported
    return;
  }

  new Application();
});
```

Create a simple 2d renderer environment

```javascript
class Application {
  constructor() {
    const width = 800;
    const height = 600;

    this._stageContainer = document.body;

    // create context
    this._context = new PWGL.Context();

    // create stage 2d renderer
    this._stage2DRenderer = new PWGL.Stage2D({
      context: this._context,
    });

    this._stageContainer.appendChild(this._context.canvas);

    const imageUrl = "https://picsum.photos/500/300";
    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.src = imageUrl;
    
    // create renderable element
    this._image = new PWGL.Image(
      new PWGL.Texture(image)
    );
    this._image.transform.x = width * 0.5;
    this._image.transform.y = height * 0.5;
    this._image.transform.width = 320;
    this._image.transform.height = 240;
    this._image.transform.anchorX = this._image.transform.anchorY = 0.5;
    this._stage2DRenderer.container.addChild(this._image);

    // resize context and renderers
    this._context.setCanvasSize(width, height);
    this._stage2DRenderer.setSize(width, height);

    this._onBeforeUnloadBound = this._onBeforeUnload.bind(this);
    this._renderBound = this._render.bind(this);
    this._requestAnimationFrameId;

    window.addEventListener("beforeunload", this._onBeforeUnloadBound);

    // start render cycle
    PWGLExtensions.enterFrame(this._renderBound);
  }

  _render(fps, delay) {
    console.log("delay:", PWGLExtensions.FPS.delay);
    console.log("fps:", PWGLExtensions.FPS.fps.toFixed(2));

    // rotate the image
    this._image.transform.rotation += 0.001;

    // render the state
    this._stage2DRenderer.render();
  }

  _destruct() {
    cancelAnimationFrame(this._requestAnimationFrameId);
    window.removeEventListener("beforeunload", this._onBeforeUnloadBound);
    this._stageContainer.removeChild(this._context.canvas);
    this._stage2DRenderer.destruct();
  }

  _onBeforeUnload() {
    this._destruct();
  }
}

PWGL.Utils.initApplication(function (isWebGl2Supported) {
  if (!isWebGl2Supported) {
    // WebGL 2 is not supported
    return;
  }

  new Application();
});
```

Add filter renderer

[Demo](https://codepen.io/iroshan/pen/MYemWXe)
```javascript
class Application {
  constructor() {
    const width = 800;
    const height = 600;

    this._stageContainer = document.body;

    // create context
    this._context = new PWGL.Context();

    // create framebuffer for the stage 2d renderer
    this._stage2DRendererFramebuffer = new PWGL.Framebuffer();

    // create stage 2d renderer
    this._stage2DRenderer = new PWGL.Stage2D({
      context: this._context,
    });

    // create filter renderer and set the framebuffer as texture source
    this._filterRenderer = new PWGL.FilterRenderer({
      context: this._context,
      sourceTexture: this._stage2DRendererFramebuffer,
      filters: [
        new PWGL.PixelateFilter(5),
        new PWGL.VignetteFilter(1, 3, 1, 0, 0, 0),
      ],
    });

    this._stageContainer.appendChild(this._context.canvas);

    const imageUrl = "https://picsum.photos/500/300";
    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.src = imageUrl;
    
    // create renderable element
    this._image = new PWGL.Image(
      new PWGL.Texture(image)
    );
    this._image.transform.x = width * 0.5;
    this._image.transform.y = height * 0.5;
    this._image.transform.width = 320;
    this._image.transform.height = 240;
    this._image.transform.anchorX = this._image.transform.anchorY = 0.5;
    this._stage2DRenderer.container.addChild(this._image);

    // resize context and renderers
    this._context.setCanvasSize(width, height);
    this._stage2DRenderer.setSize(width, height);
    this._filterRenderer.setSize(width, height);

    this._onBeforeUnloadBound = this._onBeforeUnload.bind(this);
    this._renderBound = this._render.bind(this);
    this._requestAnimationFrameId;

    window.addEventListener("beforeunload", this._onBeforeUnloadBound);

    // start render cycle
    PWGLExtensions.enterFrame(this._renderBound);
  }

  _render(fps, delay) {
    console.log("delay:", PWGLExtensions.FPS.delay);
    console.log("fps:", PWGLExtensions.FPS.fps.toFixed(2));

    // rotate the image
    this._image.transform.rotation += 0.001;

    // render the state to framebuffer
    this._stage2DRenderer.renderToFramebuffer(
      this._stage2DRendererFramebuffer
    );
    // render filters
    this._filterRenderer.render();
  }

  _destruct() {
    cancelAnimationFrame(this._requestAnimationFrameId);
    window.removeEventListener("beforeunload", this._onBeforeUnloadBound);
    this._stageContainer.removeChild(this._context.canvas);
    this._stage2DRenderer.destruct();
    this._filterRenderer.destruct();
  }

  _onBeforeUnload() {
    this._destruct();
  }
}

PWGL.Utils.initApplication(function (isWebGl2Supported) {
  if (!isWebGl2Supported) {
    // WebGL 2 is not supported
    return;
  }

  new Application();
});
```
