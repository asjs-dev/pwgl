import {
  SHOW_CALL_STACKS,
  SHOW_ORIGINAL_VALUES,
  SHOW_ARRAYS,
} from "./constants";
import { enumCheck } from "../extensions/utils/enumCheck";
import { enterFrame } from "../extensions/utils/enterFrame";
import { clamp } from "../extensions/utils/clamp";
import { noopReturnsWith } from "../extensions/utils/noopReturnsWith";

/**
 * @typedef {Object} DebugCall
 * @property {string} stackTrace Captured call stack (optional).
 * @property {number} currentCallDurationMS Time since the previous call.
 * @property {number} sumFrameDurationMS Accumulated time within the frame.
 * @property {string} prop Invoked WebGL method name.
 * @property {Array<any>} args Method arguments.
 */

/**
 * @typedef {Array<DebugCall>} FrameSnapshot
 * A list of recorded WebGL calls within a single frame.
 */

/**
 * @ignore
 */
const _noopConvert = (values) => values;

/**
 * @ignore
 */
// prettier-ignore
const _captureStackFormatted = () => "\n\n<i>Stack trace:\n| " + 
  (new Error()).stack
    .split("\n")
    .slice(3)
    .map((v) => {
      const splitted = v.trim().slice(3).split(" (");
      return splitted[1] 
        ? "<a href=\"" + splitted[1].slice(0, -1) + "\" target=\"_blank\">" + splitted[0] + "</a>" 
        : v;
    })
    .join("\n| ") + "</i>";

/**
 * @ignore
 */
const _convertArrays = (values) =>
  values.map((v) =>
    v && (Array.isArray(v) || v.constructor?.name?.endsWith("Array"))
      ? `[${v.constructor.name}(${v.length})]`
      : v,
  );
/**
 * Wrap a WebGL rendering context with a debug proxy.
 *
 * The proxy intercepts method calls, records timing and arguments,
 * and stores per-frame snapshots in `PWGLDebugger.instances`.
 *
 * @param {WebGLRenderingContext|WebGL2RenderingContext} context Original WebGL context.
 * @param {object} [options={}] Debugger options.
 * @param {number} [options.maxFrameCount=5] Maximum number of recorded frames (clamped to 0..20).
 * @param {number} [options.flags=0] Bitmask of `PWGLDebugger.SHOW_*` flags.
 * @returns {WebGLRenderingContext|WebGL2RenderingContext} Proxy-wrapped context.
 */
export const debugContext = (context, options = {}) => {
  const MAX_FRAME_COUNT = clamp(options.maxFrameCount ?? 5, 0, 20),
    FLAGS = options.flags ?? 0,
    debug = [],
    constMap = PWGL
      ? Object.entries(PWGL.Const).reduce((acc, [name, value]) => {
          acc[value] = name;
          return acc;
        }, {})
      : {};

  let currentFrame,
    currentTimestamp,
    logsForFrame,
    sumFrameDurationMS,
    frames = -1;

  const convertToReadableNames = (values) =>
    values.map((v) => constMap[v] ?? v);

  const convertArrays = enumCheck(FLAGS, SHOW_ARRAYS)
    ? _noopConvert
    : _convertArrays;

  const convert = enumCheck(FLAGS, SHOW_ORIGINAL_VALUES)
    ? _noopConvert
    : convertToReadableNames;

  const convertCallStack = enumCheck(FLAGS, SHOW_CALL_STACKS)
    ? _captureStackFormatted
    : noopReturnsWith("");

  /**
   * Advance frame counter.
   * Called once per rendered frame.
   */
  const render = () => frames++;

  /**
   * Proxy wrapper for intercepted WebGL function calls.
   */
  const debugCallback = (value, target, prop) =>
    function (...args) {
      if (frames <= MAX_FRAME_COUNT) {
        if (currentFrame !== frames) {
          logsForFrame = [];
          debug[frames] = logsForFrame;
          currentFrame = frames;
          currentTimestamp = Date.now();
          sumFrameDurationMS = 0;
        }

        if (currentFrame >= 0) {
          const length = logsForFrame.length,
            now = Date.now(),
            delta = now - currentTimestamp;
          sumFrameDurationMS += delta;
          currentTimestamp = now;

          if (length > 0)
            logsForFrame[length - 1].currentCallDurationMS = delta;

          logsForFrame.push({
            stackTrace: convertCallStack(),
            currentCallDurationMS: 0,
            sumFrameDurationMS: sumFrameDurationMS,
            prop: prop,
            args: convert(
              convertArrays(
                args.map((v) =>
                  [null, undefined].includes(v) ? `${v}` : v === "" ? '""' : v,
                ),
              ),
            ),
          });
        }
      }

      return value.apply(target, args);
    };

  enterFrame(render);

  PWGLDebugger.instances.push({
    canvas: context.canvas,
    snapshots: debug,
  });

  return new Proxy(context, {
    get(target, prop) {
      const value = target[prop];
      return typeof value === "function"
        ? debugCallback(value, target, prop)
        : value;
    },
  });
};
