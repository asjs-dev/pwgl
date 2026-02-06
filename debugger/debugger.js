import { enumCheck } from "../extensions/utils/enumCheck";
import { enterFrame } from "../extensions/utils/enterFrame";

/**
 * Show call stacks when formatting snapshots.
 * @constant {number}
 */
export const SHOW_CALL_STACK = 1;

/**
 * Replace numeric constants with readable names (requires `PWGL.Const`).
 * @constant {number}
 */
export const SHOW_READABLE_NAMES = 2;

/**
 * Show full array arguments when formatting snapshots.
 * By default arrays are displayed in compact form (shortened to `[Type(length)]`).
 * Pass this flag to show the original array contents instead.
 * @constant {number}
 */
export const SHOW_ARRAYS = 4;

const _noopConvert = (values) => values;

const _noopDebug = (value, target) =>
  function (...args) {
    return value.apply(target, args);
  };

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

const _debug = (context) => {
  const programs = [];
  const debug = new Map();
  const constMap = PWGL
    ? Object.entries(PWGL.Const).reduce((acc, val) => {
        acc[val[1]] = val[0];
        return acc;
      }, {})
    : {};

  const render = () => {
    if (frames === 2) {
      ef.stop();
      callbackFV = _noopDebug;
    }
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

    const convert = enumCheck(options, SHOW_READABLE_NAMES)
      ? (values) => values.map((v) => constMap[v] ?? v)
      : _noopConvert;

    const result = [];

    debug.forEach((value, key) =>
      result.push(
        value
          .map((list) =>
            convert(convertArrays(list.slice(showCallStack ? 0 : 1))).join(" "),
          )
          .join("\n"),
      ),
    );

    return result;
  };

  const debugCallback = (value, target, prop, args) =>
    function (...args) {
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
        const now = Date.now();
        const lastCallMS = now - lastTimestamp;
        sumMS += lastCallMS;
        lastTimestamp = now;
        debug
          .get(latestProgram)
          .push([
            _captureStack(),
            `frame ${frames}`,
            `[${lastCallMS}ms]`,
            `[${sumMS}ms]:`,
            prop,
            ...args,
          ]);
      }

      return value.apply(target, args);
    };

  let callbackFV = debugCallback;
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
        ? callbackFV(value, target, prop)
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
export const init = () => {
  const getContextFV = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (...args) {
    const context = getContextFV.call(this, ...args);
    return args[0].startsWith("webgl") ? _debug(context) : context;
  };
};
