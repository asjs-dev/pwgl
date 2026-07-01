export type DebugCall = {
  stackTrace: string;
  currentCallDurationMS: number;
  sumFrameDurationMS: number;
  prop: string;
  args: unknown[];
};

type FrameSnapshot = DebugCall[];

type DebuggerInstance = {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  snapshots: FrameSnapshot[];
  cleanup?: () => void;
};

export type DebuggerOptions = {
  maxFrameCount?: number;
  flags?: number;
};

export type PWGLDebuggerGlobal = {
  version: string;
  SHOW_CALL_STACKS: number;
  SHOW_ORIGINAL_VALUES: number;
  SHOW_ARRAYS: number;
  init: (options?: DebuggerOptions) => () => void;
  instances: DebuggerInstance[];
};
