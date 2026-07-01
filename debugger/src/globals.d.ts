import type { PWGLDebuggerGlobal } from "./types";

declare global {
  interface Window {
    PWGLDebugger: PWGLDebuggerGlobal;
  }

  const PWGLDebugger: PWGLDebuggerGlobal;
}

export {};