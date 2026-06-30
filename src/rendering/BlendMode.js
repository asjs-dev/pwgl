const _createBlendMode = (functions, equations) => ({
  functionName: "blendFunc" + (functions.length < 3 ? "" : "Separate"),
  functions,
  equationName: "blendEquation" + (!equations || equations.length < 2 ? "" : "Separate"),
  equations: equations || [WebGL2RenderingContext.FUNC_ADD],
});

/**
 * @typedef {Object} BlendModeInfo
 * @property {string} functionName
 * @property {Array<number>} functions
 * @property {string} equationName
 * @property {Array<number>} equations
 */

/**
 * @typedef {function} createBlendMode
 * @param {Array<number>} functions
 * @param {Array<number>} equations
 * @returns {BlendModeInfo}
 */

/**
 * @typedef {Object} BlendMode
 * @property {createBlendMode} createBlendMode
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
  createBlendMode: _createBlendMode,

  NONE: _createBlendMode([0, 0]),

  NORMAL_PM: _createBlendMode([WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA]),
  ADD_PM: _createBlendMode([WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE]),
  MULTIPLY_PM: _createBlendMode([
    WebGL2RenderingContext.DST_COLOR,
    WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA,
    WebGL2RenderingContext.ONE,
    WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA,
  ]),
  SCREEN_PM: _createBlendMode([
    WebGL2RenderingContext.ONE,
    WebGL2RenderingContext.ONE_MINUS_SRC_COLOR,
    WebGL2RenderingContext.ONE,
    WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA,
  ]),

  ADD_NPM: _createBlendMode([
    WebGL2RenderingContext.SRC_ALPHA,
    WebGL2RenderingContext.ONE,
    WebGL2RenderingContext.ONE,
    WebGL2RenderingContext.ONE,
  ]),

  SRC_IN: _createBlendMode([WebGL2RenderingContext.DST_ALPHA, WebGL2RenderingContext.ZERO]),
  SRC_OUT: _createBlendMode([WebGL2RenderingContext.ONE_MINUS_DST_ALPHA, WebGL2RenderingContext.ZERO]),
  SRC_ATOP: _createBlendMode([WebGL2RenderingContext.DST_ALPHA, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA]),
  DST_OVER: _createBlendMode([WebGL2RenderingContext.ONE_MINUS_DST_ALPHA, WebGL2RenderingContext.ONE]),
  DST_IN: _createBlendMode([WebGL2RenderingContext.ZERO, WebGL2RenderingContext.SRC_ALPHA]),
  DST_OUT: _createBlendMode([WebGL2RenderingContext.ZERO, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA]),
  DST_ATOP: _createBlendMode([WebGL2RenderingContext.ONE_MINUS_DST_ALPHA, WebGL2RenderingContext.SRC_ALPHA]),
  XOR: _createBlendMode([WebGL2RenderingContext.ONE_MINUS_DST_ALPHA, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA]),

  NORMAL: _createBlendMode([
    WebGL2RenderingContext.SRC_ALPHA,
    WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA,
    WebGL2RenderingContext.ONE,
    WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA,
  ]),
  ADD: _createBlendMode([
    WebGL2RenderingContext.SRC_ALPHA,
    WebGL2RenderingContext.DST_ALPHA,
    WebGL2RenderingContext.ONE,
    WebGL2RenderingContext.DST_ALPHA,
  ]),
  MULTIPLY: _createBlendMode([WebGL2RenderingContext.DST_COLOR, WebGL2RenderingContext.ZERO]),
  SCREEN: _createBlendMode([
    WebGL2RenderingContext.SRC_ALPHA,
    WebGL2RenderingContext.ONE_MINUS_SRC_COLOR,
    WebGL2RenderingContext.ONE,
    WebGL2RenderingContext.ONE_MINUS_SRC_COLOR,
  ]),
  OVERLAY: _createBlendMode([WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA]),
  EXCLUSION: _createBlendMode([WebGL2RenderingContext.ONE_MINUS_DST_COLOR, WebGL2RenderingContext.ONE_MINUS_SRC_COLOR]),
  LIGHTEN: _createBlendMode([WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE], [WebGL2RenderingContext.MAX]),
  DARKEN: _createBlendMode([WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE], [WebGL2RenderingContext.MIN]),
  SHADOW: _createBlendMode([WebGL2RenderingContext.DST_COLOR, WebGL2RenderingContext.SRC_COLOR]),
};
