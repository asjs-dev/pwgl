# PWGL Debugger

This small debugger wraps canvas contexts and collects simple snapshots around `useProgram` calls.

Important: the exposed API is only available in the browser developer console (the code logs an object to the console). The debugger does not change rendering behavior — it only observes and records.

## Activation
Import and call `init()` during your app startup:

```js
import { init } from './debugger/debugger.js';

init();
```

This replaces `HTMLCanvasElement.prototype.getContext` so every returned context is wrapped with a debug proxy.

## What appears in the console
When the debugger is active it logs an object to the console containing:

- `snapshots`: a `Map` of program objects to recorded entries.
- `toString(options)`: a helper that returns a formatted array of strings from the recorded entries.

Because the logged object is not exposed globally by default, the easiest way to interact with it is to right-click the logged object in the console and choose "Store as global variable" (Chrome/Edge). This creates a `temp1`-style variable you can use interactively.

## Examples (in the browser console)

1) Open the console, find the `PWGL Debugger` log, right-click → "Store as global variable" (for example `temp1`).

2) Query formatted output:

```js
// default (no extra options)
temp1.toString();

// show call stacks
temp1.toString(1);

// human-readable constant names (if `PWGL.Const` is available)
temp1.toString(2);

// show full array arguments (by default arrays are compacted)
temp1.toString(4);

// combine flags using bitwise OR
temp1.toString(1 | 2 | 4);
```

Constant values (use as numbers if desired):

- `SHOW_CALL_STACK = 1`
- `SHOW_READABLE_NAMES = 2`
- `SHOW_ARRAYS = 4`

## Snapshot entry structure
A single recorded entry (an array) typically contains:

- 0: (optional) short captured call stack string
- 1: `frame N`
- 2: `[delta ms]` — milliseconds since the previous call
- 3: `[sum ms]:` — cumulative milliseconds
- 4: the invoked method name (e.g. `useProgram`)
- remaining elements: the method arguments

This is usually enough to inspect from the console which program was used and how much time elapsed between calls.
