import { debugContext } from "./debugContext";
import { panel } from "./panel";

let cleanup;

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
  cleanup && cleanup();

  const destroyPanel = panel();

  const getContextFV = HTMLCanvasElement.prototype.getContext;
  let cleanedUp = false;

  HTMLCanvasElement.prototype.getContext = function (...args) {
    const context = getContextFV.call(this, ...args);
    return args[0] && args[0].startsWith("webgl") ? debugContext(context, options) : context;
  };

  const destroy = () => {
    if (cleanedUp) {
      return;
    }

    cleanedUp = true;
    HTMLCanvasElement.prototype.getContext = getContextFV;

    if (typeof PWGLDebugger !== "undefined" && PWGLDebugger.instances) {
      PWGLDebugger.instances.forEach((instance) => instance.cleanup && instance.cleanup());
      PWGLDebugger.instances.length = 0;
    }

    destroyPanel();

    if (cleanup === destroy) {
      cleanup = null;
    }
  };

  cleanup = destroy;

  return destroy;
};
