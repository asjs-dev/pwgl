![logo](https://github.com/asjs-dev/pwgl/blob/main/docs/logo.png?raw=true)

A JavaScript framework for creating 2D WebGL 2.0 things

### Demos:
- https://codepen.io/iroshan/pen/rNMKbWv
- https://codepen.io/iroshan/pen/MWEwYww
- https://codepen.io/iroshan/pen/zYoQgEG
- https://codepen.io/iroshan/pen/NWbzLaE
- https://codepen.io/iroshan/pen/VwbxdGw

### Features:
* Batch rendering (10.000 elements - 60fps)
* Dynamic 2.5D lights and shadows
* Element picker (can click on rendered items)
* Image filters (Blur, Pixelate, Distortion, etc.)
    * https://github.com/asjs-dev/pwgl/blob/main/src/filters
* Video textures
* and many other features...

### Minified version
* https://github.com/asjs-dev/pwgl/blob/main/dist/pwgl.min.js

### How to use

Create your index html ( include pwgl.min.js )

```html
<!DOCTYPE html>
<html>
    <head>
        <script src="pwgl.min.js" type="text/javascript"></script>
    </head>
    <body>
    </body>
</html>
```

Add your script

```javascript
class Application {
  constructor() {}
}
PWGL.Utils.initApplication(function(isWebGl2Supported) {
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

    this._stageContainer  = document.body;

    // create context
    this._context = new PWGL.Context();

    // create stage 2d renderer
    this._stage2DRenderer = new PWGL.Stage2D({
      config : {
        context : this._context
      }
    });

    this._stageContainer.appendChild(this._context.canvas);

    // create renderable element
    this._image               = new PWGL.Image(PWGL.Texture.loadImage("your/image/path/here"));
    this._image.props.x       = width * .5;
    this._image.props.y       = height * .5;
    this._image.props.width   = 320;
    this._image.props.height  = 240;
    this._image.props.anchorX =
    this._image.props.anchorY = .5;
    this._stage2DRenderer.container.addChild(this._image);

    // resize context and renderers
    this._context.setCanvasSize(width,   height);
    this._stage2DRenderer.setSize(width, height);

    this._onBeforeUnloadBound = this._onBeforeUnload.bind(this);
    this._renderBound = this._render.bind(this);
    this._requestAnimationFrameId;

    window.addEventListener("beforeunload", this._onBeforeUnloadBound);

    // set fps meter
    PWGL.FPS.start(60);

    // start render cycle
    this._requestAnimationFrameId = requestAnimationFrame(this._renderBound);
  }

  _render() {
    if (this._requestAnimationFrameId) {
      PWGL.FPS.update();
      let delay = PWGL.FPS.delay;

      console.log("delay:", PWGL.FPS.delay);
      console.log("fps:", PWGL.FPS.fps.toFixed(2));

      // rotate the image
      this._image.props.rotation += .001;

      // render the state
      this._stage2DRenderer.render();

      this._requestAnimationFrameId = requestAnimationFrame(this._renderBound);
    }
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

PWGL.Utils.initApplication(function(isWebGl2Supported) {
  if (!isWebGl2Supported) {
    // WebGL 2 is not supported
    return;
  }

  new Application();
});
```

Add filter renderer

```javascript
class Application {
  constructor() {
    const width = 800;
    const height = 600;

    this._stageContainer  = document.body;

    // create context
    this._context = new PWGL.Context();

    // create framebuffer for the stage 2d renderer
    this._stage2DRendererFramebuffer = new PWGL.Framebuffer();

    // create stage 2d renderer
    this._stage2DRenderer = new PWGL.Stage2D({
      config : {
        context : this._context
      }
    });

    // create filter renderer and set the framebuffer as texture source
    this._filterRenderer = new PWGL.FilterRenderer({
      config : {
        context : this._context
      },
      texture : this._stage2DRendererFramebuffer,
      filters : [
        new PWGL.PixelateFilter(5),
        new PWGL.VignetteFilter(1, 3, 1, 0, 0, 0)
      ]
    });

    this._stageContainer.appendChild(this._context.canvas);

    // create renderable element
    this._image               = new PWGL.Image(PWGL.Texture.loadImage("your/image/path/here"));
    this._image.props.x       = width * .5;
    this._image.props.y       = height * .5;
    this._image.props.width   = 320;
    this._image.props.height  = 240;
    this._image.props.anchorX =
    this._image.props.anchorY = .5;
    this._stage2DRenderer.container.addChild(this._image);

    // resize context and renderers
    this._context.setCanvasSize(width,   height);
    this._stage2DRenderer.setSize(width, height);
    this._filterRenderer.setSize(width,  height);

    this._onBeforeUnloadBound = this._onBeforeUnload.bind(this);
    this._renderBound = this._render.bind(this);
    this._requestAnimationFrameId;

    window.addEventListener("beforeunload", this._onBeforeUnloadBound);

    // set fps meter
    PWGL.FPS.start(60);

    // start render cycle
    this._requestAnimationFrameId = requestAnimationFrame(this._renderBound);
  }

  _render() {
    if (this._requestAnimationFrameId) {
      PWGL.FPS.update();
      let delay = PWGL.FPS.delay;

      console.log("delay:", PWGL.FPS.delay);
      console.log("fps:", PWGL.FPS.fps.toFixed(2));

      // rotate the image
      this._image.props.rotation += .001;

      // render the state to framebuffer
      this._stage2DRenderer.renderToFramebuffer(this._stage2DRendererFramebuffer);
      // render filters
      this._filterRenderer.render();

      this._requestAnimationFrameId = requestAnimationFrame(this._renderBound);
    }
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

PWGL.Utils.initApplication(function(isWebGl2Supported) {
  if (!isWebGl2Supported) {
    // WebGL 2 is not supported
    return;
  }

  new Application();
});
```
