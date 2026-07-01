# PWGL Debugger

PWGL Debugger is a lightweight WebGL call logger and in-page panel.
It wraps WebGL contexts returned by `canvas.getContext(...)` and records calls frame-by-frame.

The debugger is read-only: intercepted calls are forwarded to the original context.

![Console Demo](https://asjs-dev.github.io/pwgl/assets/debugger.png)

## Entry point and build output

The debugger entry point is:

- `debugger/src/index.ts`

This file creates a global `window.PWGLDebugger` object and attaches:

- `version`
- `init(options)`
- `instances`
- formatting flags: `SHOW_CALL_STACKS`, `SHOW_ORIGINAL_VALUES`, `SHOW_ARRAYS`

Build config (`debugger/vite.config.ts`) runs type checking, builds the TypeScript source, and generates:

- `dist/pwgl.debugger.es.js`
- `dist/pwgl.debugger.umd.js`

Run build from project root:

```bash
npm run build:debugger
```

## Development

Debugger source files are TypeScript. Run the type checker from the project root:

```bash
npm run typecheck
```

Run debugger unit tests:

```bash
npm run test:run -- tests/debugger/unit
```

## Initialization

Initialize once during app startup:

```js
PWGLDebugger.init({
  maxFrameCount: 5,
  flags: 0,
});
```

`init()` overrides `HTMLCanvasElement.prototype.getContext`, so every `webgl` / `webgl2`
context is automatically wrapped.

It also injects a small debug UI panel (top-left info button) for browsing captured calls.

## Usage examples

UMD bundle in browser:

```html
<script src="./dist/pwgl.debugger.umd.js"></script>
<script>
  PWGLDebugger.init({ maxFrameCount: 5, flags: 0 });
</script>
```

ES module:

```js
import "../dist/pwgl.debugger.es.js";

PWGLDebugger.init({ maxFrameCount: 5, flags: 0 });
```

## Formatting flags

Flags are bitmasks and can be combined with OR (`|`):

- `SHOW_CALL_STACKS = 1` - include captured JavaScript call stacks
- `SHOW_ORIGINAL_VALUES = 2` - keep original argument values (skip enum name mapping)
- `SHOW_ARRAYS = 4` - print full arrays instead of compact `[Type(length)]` form

When `SHOW_ARRAYS` is enabled, `bufferData` entries that include `srcOffset` and
`length` display only the uploaded slice of the source array. The original WebGL call
still receives the unchanged arguments.

Example:

```js
PWGLDebugger.init({
  maxFrameCount: 5,
  flags:
    PWGLDebugger.SHOW_CALL_STACKS |
    PWGLDebugger.SHOW_ORIGINAL_VALUES |
    PWGLDebugger.SHOW_ARRAYS,
});
```

## Recorded data structure

`PWGLDebugger.instances` stores one debugger entry per wrapped context:

- `canvas` - source canvas element
- `snapshots` - array of frames

Each frame is an array of call entries:

- `stackTrace` - optional captured stack trace
- `currentCallDurationMS` - elapsed time since previous call
- `sumFrameDurationMS` - cumulative time within the current frame
- `prop` - called WebGL method name
- `args` - formatted call arguments; arrays are compacted unless `SHOW_ARRAYS` is enabled

## Cleanup

`init()` returns a cleanup function. Calling it restores the original
`HTMLCanvasElement.prototype.getContext`, stops active frame tracking, removes recorded
instances, and detaches the in-page panel.

Calling `PWGLDebugger.init(...)` again also cleans up the previous debugger instance before
installing the new one.

```js
const destroyDebugger = PWGLDebugger.init({ maxFrameCount: 5 });

// later
destroyDebugger();
```
