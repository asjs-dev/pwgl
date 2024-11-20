import { Const } from "../utils/Utils";

/**
 * @typedef {Object} BlendModeInfo
 * @property {string} functionName
 * @property {Array<number>} functions
 * @property {string} equationName
 * @property {Array<number>} equations
*/

/**
 * Create new blend mode
 * @param {Array<number>} functions
 * @param {Array<number>} equations
 * @returns {BlendModeInfo}
 * @ignore
 */
const createBlendMode = (functions, equations) => ({
  functionName: "blendFunc" + (functions.length < 3 ? "" : "Separate"),
  functions: functions,
  equationName:
    "blendEquation" + (!equations || equations.length < 2 ? "" : "Separate"),
  equations: equations || [Const.FUNC_ADD],
});

/**
 * @typedef {Object} BlendMode
 * @property {BlendModeInfo} NONE
 * @property {BlendModeInfo} NORMAL_PM
 * @property {BlendModeInfo} ADD_PM
 * @property {BlendModeInfo} MULTIPLY_PM
 * @property {BlendModeInfo} SCREEN_PM
 * @property {BlendModeInfo} ADD_NPM
 * @property {BlendModeInfo} SRC_IN
 * @property {BlendModeInfo} SRC_OUT
 * @property {BlendModeInfo} SRC_ATOP
 * @property {BlendModeInfo} DST_OVER
 * @property {BlendModeInfo} DST_IN
 * @property {BlendModeInfo} DST_OUT
 * @property {BlendModeInfo} DST_ATOP
 * @property {BlendModeInfo} XOR
 * @property {BlendModeInfo} NORMAL
 * @property {BlendModeInfo} ADD
 * @property {BlendModeInfo} MULTIPLY
 * @property {BlendModeInfo} SCREEN
 * @property {BlendModeInfo} OVERLAY
 * @property {BlendModeInfo} EXCLUSION
 * @property {BlendModeInfo} LIGHTEN
 * @property {BlendModeInfo} DARKEN
 * @property {BlendModeInfo} SHADOW
 */
export const BlendMode = {
  createBlendMode,
  
  NONE: createBlendMode([0, 0]),

  NORMAL_PM: createBlendMode([Const.ONE, Const.ONE_MINUS_SRC_ALPHA]),
  ADD_PM: createBlendMode([Const.ONE, Const.ONE]),
  MULTIPLY_PM: createBlendMode([
    Const.DST_COLOR,
    Const.ONE_MINUS_SRC_ALPHA,
    Const.ONE,
    Const.ONE_MINUS_SRC_ALPHA,
  ]),
  SCREEN_PM: createBlendMode([
    Const.ONE,
    Const.ONE_MINUS_SRC_COLOR,
    Const.ONE,
    Const.ONE_MINUS_SRC_ALPHA,
  ]),

  ADD_NPM: createBlendMode([Const.SRC_ALPHA, Const.ONE, Const.ONE, Const.ONE]),

  SRC_IN: createBlendMode([Const.DST_ALPHA, Const.ZERO]),
  SRC_OUT: createBlendMode([Const.ONE_MINUS_DST_ALPHA, Const.ZERO]),
  SRC_ATOP: createBlendMode([Const.DST_ALPHA, Const.ONE_MINUS_SRC_ALPHA]),
  DST_OVER: createBlendMode([Const.ONE_MINUS_DST_ALPHA, Const.ONE]),
  DST_IN: createBlendMode([Const.ZERO, Const.SRC_ALPHA]),
  DST_OUT: createBlendMode([Const.ZERO, Const.ONE_MINUS_SRC_ALPHA]),
  DST_ATOP: createBlendMode([Const.ONE_MINUS_DST_ALPHA, Const.SRC_ALPHA]),
  XOR: createBlendMode([Const.ONE_MINUS_DST_ALPHA, Const.ONE_MINUS_SRC_ALPHA]),

  NORMAL: createBlendMode([
    Const.SRC_ALPHA,
    Const.ONE_MINUS_SRC_ALPHA,
    Const.ONE,
    Const.ONE_MINUS_SRC_ALPHA,
  ]),
  ADD: createBlendMode([
    Const.SRC_ALPHA,
    Const.DST_ALPHA,
    Const.ONE,
    Const.DST_ALPHA,
  ]),
  MULTIPLY: createBlendMode([Const.DST_COLOR, Const.ZERO]),
  SCREEN: createBlendMode([
    Const.SRC_ALPHA,
    Const.ONE_MINUS_SRC_COLOR,
    Const.ONE,
    Const.ONE_MINUS_SRC_COLOR,
  ]),
  OVERLAY: createBlendMode([Const.ONE, Const.ONE_MINUS_SRC_ALPHA]),
  EXCLUSION: createBlendMode([
    Const.ONE_MINUS_DST_COLOR,
    Const.ONE_MINUS_SRC_COLOR,
  ]),
  LIGHTEN: createBlendMode([Const.ONE, Const.ONE], [Const.MAX]),
  DARKEN: createBlendMode([Const.ONE, Const.ONE], [Const.MIN]),
  SHADOW: createBlendMode([Const.DST_COLOR, Const.SRC_COLOR]),
};
