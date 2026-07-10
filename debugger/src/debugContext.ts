import type { DebugCall, DebuggerOptions } from "./types";
import { clamp } from "../../extensions/src/utils/clamp";
import { enterFrame } from "../../extensions/src/utils/enterFrame";
import { enumCheck } from "../../extensions/src/utils/enumCheck";
import { noopReturnsWith } from "../../extensions/src/utils/noopReturnsWith";
import { SHOW_ARRAYS, SHOW_CALL_STACKS, SHOW_ORIGINAL_VALUES } from "./constants";

type SliceableValue = {
  slice: (start?: number, end?: number) => unknown;
};

type FrameLoop = {
  stop: () => void;
};

type DebuggableFunction = (...args: unknown[]) => unknown;

const _noopConvert = (values: unknown[]) => values;

const _sliceUploadedArray = (value: unknown, srcOffset = 0, length?: number) =>
  value && typeof value === "object" && "slice" in value && typeof value.slice === "function" && length
    ? (value as SliceableValue).slice(srcOffset, srcOffset + length)
    : value;

const _noopConvertArrays = (prop: string, values: unknown[]) =>
  prop === "bufferData"
    ? values.map((value, index) =>
        index === 1
          ? _sliceUploadedArray(
              value,
              typeof values[3] === "number" ? values[3] : 0,
              typeof values[4] === "number" ? values[4] : undefined,
            )
          : value,
      )
    : values;

const _captureStackFormatted = () =>
  "\n\n<i>Stack trace:\n| " +
  (new Error().stack ?? "")
    .split("\n")
    .slice(3)
    .map((v) => {
      const splitted = v.trim().slice(3).split(" (");
      return splitted[1] ? `<a href="${splitted[1].slice(0, -1)}" target="_blank">${splitted[0]}</a>` : v;
    })
    .join("\n| ") +
  "</i>";

const _convertArrays = (prop: string, values: unknown[]) =>
  values.map((v) =>
    v && typeof v === "object" && (Array.isArray(v) || v.constructor?.name?.endsWith("Array"))
      ? `[${v.constructor.name}(${(v as { length?: number }).length})]`
      : v,
  );

/**
 * Wrap a WebGL rendering context with a debug proxy.
 *
 * The proxy intercepts method calls, records timing and arguments,
 * and stores per-frame snapshots in `PWGLDebugger.instances`.
 */
export const debugContext = (
  context: WebGL2RenderingContext,
  options: DebuggerOptions = {},
): WebGL2RenderingContext => {
  const MAX_FRAME_COUNT = clamp(options.maxFrameCount ?? 5, 0, 20);
  const FLAGS = options.flags ?? 0;
  const debug: DebugCall[][] = [];
  const constMap: Record<number, string> =
    typeof WebGL2RenderingContext !== "undefined"
      ? Object.entries(WebGL2RenderingContext).reduce<Record<number, string>>((acc, [name, value]) => {
          if (typeof value === "number") {
            acc[value] = name;
          }

          return acc;
        }, {})
      : {};

  let currentFrame: number | undefined;
  let currentTimestamp = 0;
  let logsForFrame: DebugCall[] = [];
  let sumFrameDurationMS = 0;
  let frames = -1;

  const convertToReadableNames = (values: unknown[]) =>
    values.map((v) => (typeof v === "number" ? (constMap[v] ?? v) : v));

  const convertArrays = enumCheck(FLAGS, SHOW_ARRAYS) ? _noopConvertArrays : _convertArrays;

  const convert = enumCheck(FLAGS, SHOW_ORIGINAL_VALUES) ? _noopConvert : convertToReadableNames;

  const convertCallStack = enumCheck(FLAGS, SHOW_CALL_STACKS) ? _captureStackFormatted : noopReturnsWith("");

  /**
   * Advance frame counter.
   * Called once per rendered frame.
   */
  const render = () => frames++;

  /**
   * Proxy wrapper for intercepted WebGL function calls.
   */
  const debugCallback = (value: DebuggableFunction, target: WebGL2RenderingContext, prop: string) =>
    function (...args: unknown[]) {
      if (frames <= MAX_FRAME_COUNT) {
        if (currentFrame !== frames) {
          logsForFrame = [];
          debug[frames] = logsForFrame;
          currentFrame = frames;
          currentTimestamp = Date.now();
          sumFrameDurationMS = 0;
        }

        if (currentFrame >= 0) {
          const length = logsForFrame.length;
          const now = Date.now();
          const delta = now - currentTimestamp;

          sumFrameDurationMS += delta;
          currentTimestamp = now;

          if (length > 0) {
            logsForFrame[length - 1].currentCallDurationMS = delta;
          }

          logsForFrame.push({
            stackTrace: convertCallStack(),
            currentCallDurationMS: 0,
            sumFrameDurationMS,
            prop,
            args: convert(
              convertArrays(
                prop,
                args.map((v) => (v == null ? `${v}` : v === "" ? '""' : v)),
              ),
            ),
          });
        }
      }

      return value.apply(target, args);
    };

  const frameLoop = enterFrame(render) as FrameLoop;

  PWGLDebugger.instances.push({
    canvas: context.canvas,
    snapshots: debug,
    cleanup: () => frameLoop.stop(),
  });

  return new Proxy(context, {
    get(target, prop: keyof WebGL2RenderingContext) {
      const value = target[prop];

      return typeof value === "function" ? debugCallback(value as DebuggableFunction, target, String(prop)) : value;
    },
  });
};
