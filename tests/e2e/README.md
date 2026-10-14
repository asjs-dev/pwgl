# PWGL visual E2E

Run the browser dashboard:

```sh
npm run test:e2e
```

The dashboard opens in the browser and runs every check on load (add `?manual` to the URL to start them yourself). **Run all checks** builds every case on its own WebGL2 context, renders it and checks pixels, GL errors, shader and console errors and context state; the sidebar shows each case as pass, fail or warn, and selecting a case that has not run yet checks it. Pixel checks use a tolerance, so small GPU differences pass. **Watch** replays the checks frame by frame and marks every probed pixel on the frame.

The selected case also renders live with metrics. Use **Render 120×** to expose stale buffer, VAO, program, texture-slot and framebuffer state. Use **Lose/restore context** to verify resource reconstruction. The dashboard records WebGL buffer, program, VAO and draw calls separately for the first, repeated, stress and restored renders, and compares the default framebuffer with the first render (`MATCH` or the number of differing pixels). **Copy report** copies the adapter, every check result and the metrics of the selected case for comparison between refactor steps and physical devices.

**Run benchmark** (or `?benchmark` in the URL instead of the checks) renders every case of the Benchmark group on its own context: by default 10 warm-up frames, then 5 runs of 100 frames (a case can lower them). `Date.now()` advances 1 ms per render, so each render is a new render pass and per-frame texture uploads are deterministic. The report adds a table per case with the median and mean CPU ms/frame (GPU time is not measured; the GPU queue is drained between runs), the final frame hash, and per-frame draw, texture-upload, texture-parameter, mipmap, bind, uniform and buffer-upload calls. Compare numbers only between runs on the same machine, browser and adapter; run it at least three times and use the median. `window.pwglE2E.runBenchmarks()` resolves with the same table and score block for browser automation.

The benchmark ends with one score against a baseline saved for the current adapter (the WebGL renderer shown in the sidebar): `score = 1000 × geomean over compared cases of (baselineMedianMs / medianMs)`, so 1000 equals the baseline and higher is faster. The band `[low–high]` applies the same formula to each case's upper- and lower-quartile run times; the baseline gets its own band from its saved run times. The verdict is `better` or `worse` only when the two bands do not overlap, otherwise `within noise`. A case is compared when it is in both runs, did not error and has the same `frames` and `runs`; missing, new, errored and reconfigured cases are listed and the score is marked `partial (n/m cases)`. A case whose frame hash changed is still scored but listed, because its rendered output differs. Without a baseline the score is `n/a`.

**Save baseline** stores the error-free cases of the last benchmark in `localStorage` per adapter, **Compare to baseline** rescores the last results, and a finished benchmark compares automatically. **Export baseline** downloads `pwgl-benchmark-baseline.json`; **Import baseline** loads such a file for the current adapter and warns when its adapter or user agent differs. `window.pwglE2E.saveBaseline()` and `window.pwglE2E.compareToBaseline()` do the same for automation.

Instrumentation exists only in the E2E harness and is not included in PWGL builds.

`npm run test:e2e:build` verifies that every case compiles without starting a browser.

## Adding a case

1. Add a case `{ id, group, title, expectation, create }` to a module in `cases/`. Set `losesContext: true` if the case loses its context on purpose.
2. Return `{ context, render, check }` from `create()`. `check(t)` is optional and async; without it the case is checked for a non-blank, stable frame.
3. Register the case in `cases/index.js`.

A Benchmark case sets `benchmark` to its options (`{ frames, runs, warmup }`, `{}` for the defaults) and may return a `ready` promise from `create()` that the benchmark and its check await (for example a video that must start playing); `ready` fails the case after 5 s. Any case may return `dispose()` to release what it owns (videos, streams, timers); the dashboard calls it before destroying the case's context. Media playback is the app's job, not PWGL's, so the case cleans up its own media.

`check(t)` drives the case and asserts on the result:

- `t.renders(count, render?)` renders, by default with the case's `render`, and collects GL errors.
- `t.px(x, y)`, `t.region(x, y, width, height)`, `t.snapshot()` and `t.diffCount(snapshot)` read the frame, top-down.
- `t.expectPx(name, x, y, rgba, tolerance?)`, `t.expectPxAll(label, probes, tolerance?)`, `t.check(name, ok, detail?, warnOnly?)`, `t.expectStable(name?, count?)` and `t.note(text)` report results.

Cases must be deterministic, use the public PWGL API, avoid network assets, and explain the expected visual result in one sentence. Pixel-checked cases use `createSmallContext()` (256×144) so their coordinates stay readable.

## Coverage

- Stage2D: painter order, batch splitting, atlas crops, tint types, blend modes, repeat textures, quad distortion, blend-mode flushes, mipmap min filters, texture size changes and two stages sharing one context.
- Display, textures and input: text, animated frames, texture source swaps, live canvas textures, runtime resize and pointer hit-tests.
- Filters: every filter against an unfiltered reference, framebuffer attachment and multi-pass ping-pong.
- Lighting: light, normal map and shadow, contact shadows of thin casters with soft and flattened shadows, ambient occlusion and 400 shadow-casting lights.
- Benchmark: 10k sprites from four textures in five batches, 10k sprites in 8-level nested container chains, more textures than texture units, one live canvas texture and one playing video texture shared by 2 000 sprites.
- Renderers and lifecycle: shared-context program/VAO switching, the `webgl/sh/script.js` game pipeline, buffer allocation and context loss and restore.
