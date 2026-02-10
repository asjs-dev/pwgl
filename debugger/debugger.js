import {
  SHOW_CALL_STACKS,
  SHOW_ORIGINAL_VALUES,
  SHOW_ARRAYS,
} from "./constants";
import { enumCheck } from "../extensions/utils/enumCheck";
import { enterFrame } from "../extensions/utils/enterFrame";
import { clamp } from "../extensions/utils/clamp";
import { getFormat } from "./logFormatter";
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
const _captureStack = () =>
  (new Error()).stack
    .split("\n")
    .slice(3)
    .map((v) => v.trim().slice(3));

/**
 * @ignore
 */
// prettier-ignore
const _captureStackFormatted = () =>
  "\n   | " + _captureStack().join("\n   | ");

/**
 * @ignore
 */
const _debug = (context, options = {}) => {
  const MAX_FRAME_COUNT = clamp(options.maxFrameCount ?? 5, 0, 20),
    FLAGS = options.flags ?? 0,
    debug = [],
    maxLengths = [],
    constMap = PWGL
      ? Object.entries(PWGL.Const).reduce((acc, [name, value]) => {
          acc[value] = name;
          return acc;
        }, {})
      : {};

  let currentFrame,
    currentTimestamp,
    logsForFrame,
    maxLengthsForFrame,
    sumFrameDurationMS,
    frames = -1;

  const convertToReadableNames = (values) =>
    values.map((v) => constMap[v] ?? v);

  const convertArrays = enumCheck(FLAGS, SHOW_ARRAYS)
    ? _noopConvert
    : (values) =>
        values.map((v) =>
          v && (Array.isArray(v) || v.constructor?.name?.endsWith("Array"))
            ? `[${v.constructor.name}(${v.length})]`
            : v,
        );

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
   * Print all collected snapshots to the console using formatted output.
   */
  const toString = () => {
    debug.forEach((frame, frameId) => {
      console.log(
        "%c > FRAME #" + frameId + " => ",
        "background:#000;color:#00ff00;font-weight:bold;",
      );

      const maxLengthsForFrame = maxLengths[frameId];

      frame.forEach((entry, index) => {
        const format = getFormat(
          entry.currentCallDurationMS,
          entry.prop,
          convertToReadableNames(entry.args),
        );

        console.log(
          "%c " +
            format.icon +
            " " +
            format.label +
            "|" +
            `${String(entry.sumFrameDurationMS).padStart(maxLengthsForFrame.sumFrameDurationMS)}ms|` +
            `${String(entry.currentCallDurationMS).padStart(maxLengthsForFrame.currentCallDurationMS)}ms|` +
            ` ${String(entry.prop).padStart(maxLengthsForFrame.prop)}` +
            (entry.args.length ? `( ${convert(entry.args).join(" ")} )` : "") +
            entry.stackTrace,
          `${format.style}t:${index};`,
        );
      });
    });
  };

  /**
   * Proxy wrapper for intercepted WebGL function calls.
   */
  const debugCallback = (value, target, prop) =>
    function (...args) {
      if (frames <= MAX_FRAME_COUNT) {
        if (currentFrame !== frames) {
          logsForFrame = [];
          maxLengthsForFrame = {};
          debug[frames] = logsForFrame;
          maxLengths[frames] = maxLengthsForFrame;
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
            maxLengthsForFrame.currentCallDurationMS = Math.max(
              String(delta).length,
              maxLengthsForFrame.currentCallDurationMS ?? 0,
            );
          }

          logsForFrame.push({
            stackTrace: convertCallStack(),
            currentCallDurationMS: 0,
            sumFrameDurationMS: sumFrameDurationMS,
            prop: prop,
            args: convertArrays(
              args.map((v) =>
                [null, undefined].includes(v) ? `${v}` : v === "" ? '""' : v,
              ),
            ),
          });

          maxLengthsForFrame.sumFrameDurationMS = Math.max(
            String(sumFrameDurationMS).length,
            maxLengthsForFrame.sumFrameDurationMS ?? 0,
          );
          maxLengthsForFrame.prop = Math.max(
            prop.length,
            maxLengthsForFrame.prop ?? 0,
          );
        }
      }

      return value.apply(target, args);
    };

  const debugInstance = {
    canvas: context.canvas,
    snapshots: debug,
    toString: toString,
  };

  enterFrame(render);
  PWGLDebugger.instances.push(debugInstance);

  console.log("PWGL Debugger", debugInstance);

  return new Proxy(context, {
    get(target, prop) {
      const value = target[prop];
      return typeof value === "function"
        ? debugCallback(value, target, prop)
        : value;
    },
  });
};

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
  const getContextFV = HTMLCanvasElement.prototype.getContext;

  HTMLCanvasElement.prototype.getContext = function (...args) {
    const context = getContextFV.call(this, ...args);
    return args[0] && args[0].startsWith("webgl")
      ? _debug(context, options)
      : context;
  };
};
