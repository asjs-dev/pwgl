import * as audio from "./audio";
import * as controls from "./controls";
import * as display from "./display";
import * as utils from "./utils";

window.PWGLExtensions = window.AGLExtensions = {
  version: "{{appVersion}}",
  controls,
  audio,
  display,
  utils: {
    FPSCounter: utils.FPSCounter,
    createStateMachine: utils.createStateMachine,
    areObjectsEqual: utils.areObjectsEqual,
    clamp: utils.clamp,
    mix: utils.mix,
    collisionDetection: utils.collisionDetection,
    cross: utils.cross,
    dot: utils.dot,
    enterFrame: utils.enterFrame,
    enumCheck: utils.enumCheck,
    fract: utils.fract,
    getFPS: utils.getFPS,
    nthCall: utils.nthCall,
    generateDungeon: utils.generateDungeon,
    noop: utils.noop,
    noopReturnsWith: utils.noopReturnsWith,
    arraySet: utils.arraySet,
    removeFromArray: utils.removeFromArray,
    gridMapping: utils.gridMapping,
    random: utils.random,
  },
};

console.log(
  `%cPWGL Extensions v${AGLExtensions.version}\nhttps:\/\/github.com/asjs-dev/pwgl`,
  "background:#222;color:#0F0",
);
