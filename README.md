# PWGL – 2D WebGL2 JavaScript Framework

![PWGL](https://github.com/asjs-dev/pwgl/blob/main/docs/assets/logo.v2x0.5.png?raw=true)
PWGL (Programmable WebGL) is a JavaScript framework for creating **2D WebGL2 applications**.

![Game Demo](https://github.com/asjs-dev/pwgl/blob/main/docs/assets/game.png?raw=true)

---

## Demos

- [Top View Game Demo](https://asjs-dev.github.io/pwgl/examples/shGameDemo.html)
- [Custom Renderer - Wolfenstein 3D](https://asjs-dev.github.io/pwgl/examples/wolfenstein.html)
- [Card Game Demo](https://asjs-dev.github.io/pwgl/examples/cardGameDemo.html)
- [Displacement Filter](https://asjs-dev.github.io/pwgl/examples/rainDropsDemo.html)
- [2D Lights and Shadows](https://asjs-dev.github.io/pwgl/examples/lightDemo.html)
- [Lights, Shadows and Filters](https://asjs-dev.github.io/pwgl/examples/boatDemo.html)
- [Journey](https://asjs-dev.github.io/pwgl/examples/journeyDemo.html)

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
    PWGLExtensions.utils.enterFrame(this._renderBound);
  }

  _render(fps, delay) {
    // console.log("delay:", delay);
    // console.log("fps:", fps.toFixed(2));

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
    PWGLExtensions.utils.enterFrame(this._renderBound);
  }

  _render(fps, delay) {
    // console.log("delay:", delay);
    // console.log("fps:", fps.toFixed(2));

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

---

## Core Library Architecture

PWGL is organized into modular components within the `src/` directory, each responsible for specific functionality in the 2D WebGL rendering pipeline.

### Core (`src/core/`)

Low-level utilities providing WebGL context management and helper functions.

#### **Context** (`Context.js`)
Manages the WebGL2 rendering context and canvas lifecycle.
- Canvas creation and initialization
- WebGL2 context management with fallback detection
- Texture tracking and resource management
- Context loss/restoration handling
- Canvas size configuration

#### **Buffer** (`Buffer.js`)
Wraps WebGL buffer objects for efficient vertex and index data management.
- Vertex buffer object (VBO) handling
- Index buffer management
- Dynamic buffer updates
- Data type conversions

#### **Utils** (`Utils.js`)
General-purpose utilities and initialization functions.
- `initApplication()` - Detect WebGL2 support and bootstrap the application
- Constants and configuration defaults
- Helper functions for color, matrix, and data manipulation

### Rendering (`src/attributes/`)

Reusable attributes for display elements.

### Rendering (`src/rendering/`)

#### **BlendMode** (`BlendMode.js`)
Enum and constants for blend modes (NORMAL, ADD, MULTIPLY, SCREEN, etc.)
- Determines how pixels are combined when overlapping
- Supports all standard WebGL blend operations

### Textures (`src/textures/`)

#### **Texture** (`Texture.js`)
Represents 2D textures loaded from images, canvas, or video elements.
- Automatic texture binding and management
- Supports filtering modes (LINEAR, NEAREST)
- Mipmap generation
- Video texture streaming

#### **Framebuffer** (`Framebuffer.js`)
Off-screen rendering target for advanced effects.
- Used for filter chains and custom rendering passes
- Supports multiple color attachments
- Enables render-to-texture workflows

#### **Attributes** (`attributes/`)

Configuration objects for transformations and visual properties

### Display (`src/display/`)

Visual elements and scene graph nodes.

#### **Item** (`Item.js`)
Base class for all renderable objects with transform properties.
- Position (`x`, `y`)
- Rotation and scale
- Visibility toggling
- Anchor point for rotation and scaling
- Hierarchical parent-child relationships

#### **BaseDrawable** (`BaseDrawable.js`)
Abstract base for renderable elements with rendering-specific properties.
- Rendering type identification
- Blend mode management
- Color tinting
- Matrix cache for performance

#### **Container** (`Container.js`)
Hierarchical node for organizing display objects.
- Add/remove child elements
- Recursive rendering of children
- Transform inheritance
- Bounds calculation

#### **Image** (`Image.js`)
Textured sprite with advanced visual properties.
- Texture mapping with UV coordinates
- Blend modes and tint effects
- Texture transformations (scale, rotation, offset)
- Texture cropping
- Distortion effects

#### **AnimatedImage** (`AnimatedImage.js`)
Image with frame-based animation support.
- Sprite sheet animation
- Frame sequencing
- Playback control (play, pause, stop)
- Frame rate configuration

#### **Light** (`Light.js`)
Dynamic 2D light source for realistic lighting.
- Point and directional lighting
- Attenuation and falloff
- Color and intensity
- Shadows calculation

#### **StageContainer** (`StageContainer.js`)
Root container for the scene.
- Defines the visible area
- Coordinate transformation
- Viewport management

#### **Text** (`Text.js`)
Drawable text object for rendering strings in the 2D/WebGL canvas.
- Positioning, alignment, and rotation controls
- Style options (font size, color, weight)
- Text wrapping and baseline handling

### Renderer (`src/renderers/`)

Rendering pipeline and frame composition.

#### **BaseRenderer** (`BaseRenderer.js`)
Abstract base for all rendering operations.
- WebGL state management
- Matrix operations
- Shader program linking

#### **BatchRenderer** (`BatchRenderer.js`)
High-performance batch rendering system for optimal GPU utilization.
- Dynamic batching of geometry
- Reduces draw calls significantly (10,000+ elements at 60fps)
- Automatic batch splitting
- Texture atlas support

#### **Stage2D** (`Stage2D.js`)
Main 2D rendering engine with scene graph management.
- Renders hierarchical display objects
- Viewport management
- Interactive element picking (mouse/touch)
- Event propagation (click, hover, drag)
- Supports stable fps rendering at high element counts

#### **FilterRenderer** (`FilterRenderer.js`)
Post-processing effects chain.
- Applies sequential filters to rendered output
- Offscreen rendering to framebuffers
- Multiple filter composition
- Screen-space effects

#### **LightRenderer** (`LightRenderer.js`)
Specialized renderer for dynamic lighting and shadows.
- Real-time shadow map generation
- Soft shadow rendering
- Multiple light support
- Optimized light frustum culling

#### **NormalMapRenderer** (`NormalMapRenderer.js`)
Generates normal maps for surface detail and lighting calculations.
- Converts height maps to normal maps
- Real-time generation
- Used for advanced lighting techniques

#### **AmbientOcclusionMapRenderer** (`AmbientOcclusionMapRenderer.js`)
Generates ambient occlusion maps for realistic shadowing.
- Screen-space ambient occlusion (SSAO)
- Real-time computation
- Enhances visual depth

### Filters (`src/filters/`)

Post-processing effects and image manipulation filters.

#### **BaseFilter** (`BaseFilter.js`)
Abstract base for all filter implementations.
- Intensity parameter
- On/off toggling
- Uniform value storage

#### **Specialized Filter Base Classes:**
- **BaseKernelFilter** - Convolution filters (3x3, 5x5 kernels)
- **BaseSamplingFilter** - Sampling-based effects (blur, bokeh)
- **BaseTextureFilter** - Texture-dependent effects

#### **Available Filters:**

| Filter | Purpose |
| --- | --- |
| **BlurFilter** | Gaussian blur with adjustable radius |
| **PixelateFilter** | Pixelation/mosaic effect |
| **EdgeDetectFilter** | Edge detection (Sobel operator) |
| **SharpenFilter** | Image sharpening/unsharp mask |
| **GrayscaleFilter** | Desaturate to grayscale |
| **SepiaFilter** | Warm vintage tone |
| **InvertFilter** | Color inversion |
| **SaturateFilter** | Increase/decrease saturation |
| **BrightnessContrastFilter** | Brightness and contrast adjustment |
| **GammaFilter** | Gamma correction |
| **TintFilter** | Color overlay tinting |
| **ColorLimitFilter** | Posterization/color reduction |
| **VignetteFilter** | Dark corners vignette effect |
| **RainbowFilter** | Chromatic rainbow shift |
| **DisplacementFilter** | Vertex displacement mapping |
| **MaskFilter** | Selective region masking |
| **ChromaticAberrationFilter** | RGB channel separation effect |
| **GlowFilter** | Bloom/glow effect |

### Math (`src/math/`)

Mathematical types and utilities for geometric calculations.

#### **Matrix3Utilities** (`Matrix3Utilities.js`)
3x3 matrix operations for 2D transformations.
- Matrix multiplication
- Inverse calculation
- Identity matrix
- Efficient transformation composition

#### **PointType** (`PointType.js`)
Point/Vector representation with methods.
- 2D coordinates
- Distance calculations
- Vector operations

#### **RectangleType** (`RectangleType.js`)
Rectangle/Bounding box representation.
- Intersection testing
- Containment checking
- Area calculations

---

## Rendering Pipeline

The typical rendering flow in PWGL:

1. **Setup** - Create Context, Stage2D, and display objects
2. **Update** - Modify transforms, properties, and states
3. **Render** - Call `stage2DRenderer.render()` each frame
4. **Post-Process** - Apply filters via FilterRenderer (optional)
5. **Display** - Canvas composites to screen

## Performance Tips

- Use **batch rendering** by grouping similar objects
- Reuse **textures** and **framebuffers**
- Apply **filters selectively** only when needed
- Use **WebGL2 features** for optimization
- Consider **frustum culling** for large scenes
- Monitor **draw calls** using browser DevTools

## Browser Support

- **Modern browsers** with WebGL2 support: Chrome, Firefox, Edge, Safari (11+)
- **Fallback** to WebGL1 with graceful degradation
- **Mobile support** on iOS Safari and Android Chrome

## Extensions

For additional utilities, input handling, audio, and convenience functions, see the [PWGL Extensions documentation](./extensions/).
