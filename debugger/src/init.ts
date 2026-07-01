import type { DebuggerOptions } from "./types";
import { debugContext } from "./debugContext";
import { panel } from "./panel";

type DestroyFn = () => void;

let cleanup: DestroyFn | null = null;

/**
 * Initialize the PWGL debugger.
 * Overrides `HTMLCanvasElement.prototype.getContext` so that every
 * WebGL context returned on the page is wrapped by a debug proxy.
 *
 * Call this once during application startup.
 */
export const init = (options: DebuggerOptions = {}): DestroyFn => {
  cleanup?.();

  const destroyPanel = panel();
  const getContextFunc = HTMLCanvasElement.prototype.getContext;

  let cleanedUp = false;

  HTMLCanvasElement.prototype.getContext = function (
    this: HTMLCanvasElement,
    contextId: string,
    optionsOrAttributes?: unknown,
  ) {
    const context = getContextFunc.call(this, contextId as "2d", optionsOrAttributes);

    return contextId.startsWith("webgl") && context
      ? debugContext(context as WebGL2RenderingContext, options)
      : context;
  } as typeof HTMLCanvasElement.prototype.getContext;

  const destroy: DestroyFn = () => {
    if (cleanedUp) {
      return;
    }

    cleanedUp = true;
    HTMLCanvasElement.prototype.getContext = getContextFunc;

    PWGLDebugger.instances.forEach((instance) => instance.cleanup && instance.cleanup());
    PWGLDebugger.instances.length = 0;

    destroyPanel();

    if (cleanup === destroy) {
      cleanup = null;
    }
  };

  cleanup = destroy;

  return destroy;
};
