// Pixel magnifier: a loupe in the stage corner shows the render pixels around the pointer
// enlarged without smoothing, so per-pixel filters (FXAA, Sharpen, Film grain) become visible.
// `draw()` copies from the WebGL canvas right after each render, in the same frame, so the
// context needs no preserveDrawingBuffer.

// Device pixels per render pixel, and the loupe size in CSS pixels.
const ZOOM = 8;
const SIZE = 176;

export const createMagnifier = (stage, source, toggle) => {
  const loupe = document.createElement("canvas");
  loupe.className = "loupe";
  stage.appendChild(loupe);
  const ctx = loupe.getContext("2d");
  // Pointer position in render pixels; null until the pointer is over the canvas (center).
  let pointer = null;

  const track = (event) => {
    const rect = source.getBoundingClientRect();
    pointer = {
      x: ((event.clientX - rect.left) / rect.width) * source.width,
      y: ((event.clientY - rect.top) / rect.height) * source.height,
    };
  };
  source.addEventListener("pointermove", track);
  source.addEventListener("pointerdown", track);

  const sync = () => (loupe.hidden = !toggle.checked);
  toggle.addEventListener("change", sync);
  sync();

  return {
    draw() {
      if (loupe.hidden) return;
      const size = Math.max(1, Math.round((SIZE * devicePixelRatio) / ZOOM)) * ZOOM;
      if (loupe.width !== size) loupe.width = loupe.height = size;

      const span = size / ZOOM;
      const x = Math.floor(pointer?.x ?? source.width / 2);
      const y = Math.floor(pointer?.y ?? source.height / 2);
      const sx = Math.min(Math.max(0, x - (span >> 1)), Math.max(0, source.width - span));
      const sy = Math.min(Math.max(0, y - (span >> 1)), Math.max(0, source.height - span));

      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(source, sx, sy, span, span, 0, 0, size, size);
      // Outline the pixel under the pointer.
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = Math.max(1, devicePixelRatio);
      ctx.strokeRect((x - sx) * ZOOM, (y - sy) * ZOOM, ZOOM, ZOOM);
    },
  };
};
