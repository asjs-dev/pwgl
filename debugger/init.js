import { debugContext } from "./debugContext";
import { panel } from "./panel";

/**
 * Initialize the PWGL debugger.
 * Overrides `HTMLCanvasElement.prototype.getContext` so that every
 * WebGL context returned on the page is wrapped by a debug proxy.
 *
 * Call this once during application startup.
 *
 * @param {object} options
 * @param {number} [options.maxFrameCount=5] Maximum number of frames recorded.
 * @param {number} [options.flags=0] Bitmask of SHOW_* flags controlling output.
 */
export const init = (options = {}) => {
  panel();

  const getContextFV = HTMLCanvasElement.prototype.getContext;

  HTMLCanvasElement.prototype.getContext = function (...args) {
    const context = getContextFV.call(this, ...args);
    return args[0] && args[0].startsWith("webgl")
      ? debugContext(context, options)
      : context;
  };
};
