# PWGL Debugger

PWGL Debugger is a lightweight WebGL call logger that wraps canvas contexts
and records WebGL API usage frame-by-frame for inspection in the browser console.

The debugger is **read-only**: it does not modify rendering behavior.
All collected data is exposed via a console-only object.

![Console Demo](https://asjs-dev.github.io/pwgl/assets/debugger.png)

## Activation

Import and call `init()` once during application startup:

```js
import { init } from "./debugger/debugger.js";

init({
  maxFrameCount: 5,
  flags: 0,
});
```

This overrides `HTMLCanvasElement.prototype.getContext` so every WebGL context
returned on the page is automatically wrapped.

## Console usage

When initialized, the debugger logs a `PWGL Debugger` object to the console.

To interact with it:
1. Open the browser console.
2. Right-click the logged object.
3. Select **"Store as global variable"** (e.g. `temp1`).

Or type **`PWGLDebugger.instances[0].toString()`** into the console

The stored object exposes:

- `snapshots` - an array of per-frame WebGL call records
- `toString()` - prints formatted, colorized output to the console

## Formatting flags

Flags are combined using bitwise OR:

- `SHOW_CALL_STACKS = 1`  
  Include captured JavaScript call stacks.

- `SHOW_ORIGINAL_VALUES = 2`  
  Skip WebGL constant name conversion.

- `SHOW_ARRAYS = 4`  
  Print full array contents instead of compact placeholders.

Example:

```js
temp1.toString(1 | 2 | 4);
```

## Snapshot structure

Each frame snapshot is an array of recorded calls.
A single call entry contains:

- `stackTrace` - optional captured call stack
- `currentCallDurationMS` - time since the previous call
- `sumFrameDurationMS` - cumulative time within the frame
- `prop` - invoked WebGL method name
- `args` - method arguments (formatted based on flags)

This is intended for low-level inspection of WebGL state changes,
draw calls, and performance characteristics directly from the console.