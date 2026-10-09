# PWGL visual E2E

Run the browser dashboard:

```sh
npm run test:e2e
```

The dashboard opens in the browser and runs every check on load (add `?manual` to the URL to start them yourself). **Run all checks** builds every case on its own WebGL2 context, renders it and checks pixels, GL errors, shader and console errors and context state; the sidebar shows each case as pass, fail or warn, and selecting a case that has not run yet checks it. Pixel checks use a tolerance, so small GPU differences pass. **Watch** replays the checks frame by frame and marks every probed pixel on the frame.

The selected case also renders live with metrics. Use **Render 120×** to expose stale buffer, VAO, program, texture-slot and framebuffer state. Use **Lose/restore context** to verify resource reconstruction. The dashboard records WebGL buffer, program, VAO and draw calls separately for the first, repeated, stress and restored renders, and compares the default framebuffer with the first render (`MATCH` or the number of differing pixels). **Copy report** copies the adapter, every check result and the metrics of the selected case for comparison between refactor steps and physical devices.

Instrumentation exists only in the E2E harness and is not included in PWGL builds.

`npm run test:e2e:build` verifies that every case compiles without starting a browser.

## Adding a case

1. Add a case `{ id, group, title, expectation, create }` to a module in `cases/`. Set `losesContext: true` if the case loses its context on purpose.
2. Return `{ context, render, check }` from `create()`. `check(t)` is optional and async; without it the case is checked for a non-blank, stable frame.
3. Register the case in `cases/index.js`.

`check(t)` drives the case and asserts on the result:

- `t.renders(count, render?)` renders, by default with the case's `render`, and collects GL errors.
- `t.px(x, y)`, `t.region(x, y, width, height)`, `t.snapshot()` and `t.diffCount(snapshot)` read the frame, top-down.
- `t.expectPx(name, x, y, rgba, tolerance?)`, `t.expectPxAll(label, probes, tolerance?)`, `t.check(name, ok, detail?, warnOnly?)`, `t.expectStable(name?, count?)` and `t.note(text)` report results.

Cases must be deterministic, use the public PWGL API, avoid network assets, and explain the expected visual result in one sentence. Pixel-checked cases use `createSmallContext()` (256×144) so their coordinates stay readable.

## Coverage

- Stage2D: painter order, batch splitting, atlas crops, tint types, blend modes, repeat textures, quad distortion and blend-mode flushes.
- Display, textures and input: text, animated frames, texture source swaps, live canvas textures, runtime resize and pointer hit-tests.
- Filters: every filter against an unfiltered reference, framebuffer attachment and multi-pass ping-pong.
- Lighting: light, normal map and shadow, contact shadows of thin casters with soft and flattened shadows, ambient occlusion and 400 shadow-casting lights.
- Renderers and lifecycle: shared-context program/VAO switching, the `webgl/sh/script.js` game pipeline, buffer allocation and context loss and restore.
