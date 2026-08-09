# PWGL visual E2E

Run the browser dashboard:

```sh
npm run test:e2e
```

Open the printed local URL and inspect each case against its expected result. Use **Render 120×** to expose stale buffer, VAO, program, texture-slot and framebuffer state. Use **Lose/restore context** to verify resource reconstruction.

`npm run test:e2e:build` verifies that every case compiles without starting a browser.

## Adding a case

1. Add a module to `cases/` that exports `{ id, title, expectation, create }`.
2. Return `{ context, render }` from `create()`.
3. Register the case in `cases/index.js`.

Cases must be deterministic, use the public PWGL API, avoid network assets, and explain the expected visual result in one sentence.

## Refactor coverage

- `stage2d-batch`: dynamic instance buffers, texture slots, painter order and blend-mode flushes.
- `renderer-switch`: shared-context program/VAO switching and framebuffer-derived normal maps.
- `filter-pipeline`: framebuffer attachment and multi-pass filter ping-pong.
- `game-pipeline`: the `webgl/sh/script.js` pattern of shared-context renderer switching, live texture-source changes and filtering back into the source framebuffer.

Together these cover the PWGL lifecycle patterns used by `webgl/sh/script.js`. More expensive lighting and automatic screenshots can be added as separate cases without changing the dashboard.
