import {
  SHOW_CALL_STACK,
  SHOW_ORIGINAL_VALUES,
  SHOW_ARRAYS,
} from "./constants";
import { enumCheck } from "../extensions/utils/enumCheck";
import { enterFrame } from "../extensions/utils/enterFrame";
import { clamp } from "../extensions/utils/clamp";
import { getFormat } from "./logFormatter";

const _noopConvert = (values) => values;

// prettier-ignore
const _captureStack = () =>
    "\n" +
    (new Error()).stack
      .split("\n")
      .slice(3)
      .map((v) => v.trim().slice(3))
      .join("\n") +
    "\n->";

/**
 * @typedef {Array<any>} DebugEntry
 * @description A single recorded call entry. Typical shape:
 * [ capturedStack?, `frame N`, `[delta ms]`, `[sum ms]:`, propName, ...args ]
 */

/**
 * @typedef {Map<any, DebugEntry[]>} SnapshotsMap
 * @description Map of program objects to arrays of recorded entries.
 */

const _debug = (context, maxFrameCount = 2) => {
  const programs = [];
  const debug = new Map();
  const constMap = PWGL
    ? Object.entries(PWGL.Const).reduce((acc, val) => {
        acc[val[1]] = val[0];
        return acc;
      }, {})
    : {};

  const convertToReadableNames = (values) =>
    values.map((v) => constMap[v] ?? v);

  const render = () => {
    if (frames === maxFrameCount) ef.stop();
    frames++;
  };

  /**
   * Produce a formatted array of log lines.
   * @param {number} [options=0] Bitmask of SHOW_* flags to control formatting.
   * @returns {string[]} Formatted lines describing recorded snapshots.
   */
  const toString = (options = 0) => {
    const showCallStack = enumCheck(options, SHOW_CALL_STACK);

    const convertArrays = enumCheck(options, SHOW_ARRAYS)
      ? _noopConvert
      : (values) =>
          values.map((v) =>
            v && (Array.isArray(v) || v.constructor.name.endsWith("Array"))
              ? `[${v.constructor.name}(${v.length})]`
              : v,
          );

    const convert = enumCheck(options, SHOW_ORIGINAL_VALUES)
      ? _noopConvert
      : convertToReadableNames;

    let contextIndex = 0;

    debug.forEach((program) => {
      console.log(
        `%c < CONTEXT #${++contextIndex} > `,
        "background: #000; color: #00ff00; font-weight: bold;",
      );

      program.map((list) => {
        const format = getFormat(
          list.lastCallMS,
          list.prop,
          convertToReadableNames(list.args),
        );

        console.log(
          "%c" +
            format.icon + " " +
            `${format.label}: ` +
            [
              ...(showCallStack ? [list.stackTrace] : []),
              `frame #${list.frame}`,
              `${list.sumMS}ms`,
              `${list.lastCallMS}ms`,
              `[${list.prop}]`,
              `( ${convert(convertArrays(list.args)).join(", ")} )`,
            ].join(" | "),
          format.style,
        );
      });
    });
  };

  const debugCallback = (value, target, prop) =>
    function (...args) {
      if (frames <= maxFrameCount) {
        if (prop === "useProgram") {
          const program = args[0];
          if (!programs.includes(program)) {
            programs.push(program);
            debug.set(program, []);
            latestProgram = program;
            lastTimestamp = Date.now();
            sumMS = 0;
          } else latestProgram = null;
        }

        if (latestProgram) {
          const logsForProgram = debug.get(latestProgram);
          const length = logsForProgram.length;
          const now = Date.now();
          const lastCallMS = now - lastTimestamp;
          sumMS += lastCallMS;
          lastTimestamp = now;

          if (length > 0) logsForProgram[length - 1].lastCallMS = lastCallMS;

          logsForProgram.push({
            stackTrace: _captureStack(),
            frame: frames,
            lastCallMS: 0,
            sumMS: sumMS,
            prop: prop,
            args: args,
          });
        }
      }

      return value.apply(target, args);
    };

  let latestProgram;
  let lastTimestamp;
  let sumMS;
  let ef;
  let frames = 0;

  ef = enterFrame(render);

  const debugInstance = {
    canvas: context.canvas,
    snapshots: debug,
    toString: toString,
  };

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
 * Replace `HTMLCanvasElement.prototype.getContext` so that every canvas context
 * returned in the page is wrapped by the PWGL debugger proxy.
 *
 * Call `init()` once (for example during app startup) to enable the debugger.
 * @returns {void}
 */
export const init = (maxFrameCount = 2) => {
  const getContextFV = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (...args) {
    const context = getContextFV.call(this, ...args);
    return args[0].startsWith("webgl")
      ? _debug(context, clamp(maxFrameCount, 2, 20))
      : context;
  };
};
