import { AudioItem } from "./audio/AudioItem";
import { AudioMixer } from "./audio/AudioMixer";
import { crossFadeAudioVolumes, fadeAudioVolume } from "./audio/utils";
import { Gamepad } from "./controls/Gamepad";
import { Keyboard } from "./controls/Keyboard";
import { Mouse } from "./controls/Mouse";
import { PressState } from "./controls/PressState";
import { AnimatedWater } from "./display/AnimatedWater";
import { SmoothLight } from "./display/SmoothLight";
import { areObjectsEqual } from "./utils/areObjectsEqual";
import { arraySet } from "./utils/arraySet";
import { clamp } from "./utils/clamp";
import {
  areTwoLinesCollided,
  areTwoRectsCollided,
  distanceBetweenPointAndLine,
  lineToLineIntersection,
  rectToRectIntersection,
} from "./utils/collisionDetection";
import { cross } from "./utils/cross";
import { createStateMachine } from "./utils/stateMachine";
import { dot } from "./utils/dot";
import { generateDungeon } from "./utils/dungeon";
import { enterFrame } from "./utils/enterFrame";
import { enumCheck } from "./utils/enumCheck";
import { FPSCounter } from "./utils/FPSCounter";
import { fract } from "./utils/fract";
import { getFPS } from "./utils/getFPS";
import { getRandomFrom } from "./utils/getRandomFrom";
import { coordToVector, vectorToCoord } from "./utils/gridMapping";
import { hashNoise2D } from "./utils/hashNoise2D";
import { mix } from "./utils/mix";
import { noop } from "./utils/noop";
import { noopReturnsWith } from "./utils/noopReturnsWith";
import { nthCall } from "./utils/nthCall";
import { removeFromArray } from "./utils/removeFromArray";
import { stepNoise } from "./utils/stepNoise";

window.PWGLExtensions = window.AGLExtensions = {
  version: "{{appVersion}}",

  controls: {
    PressState,
    Mouse,
    Keyboard,
    Gamepad,
  },

  audio: {
    AudioItem,
    AudioMixer,
    fadeAudioVolume,
    crossFadeAudioVolumes,
  },

  display: {
    AnimatedWater,
    SmoothLight,
  },

  utils: {
    FPSCounter,
    createStateMachine,
    areObjectsEqual,
    clamp,
    mix,
    collisionDetection: {
      distanceBetweenPointAndLine,
      areTwoLinesCollided,
      lineToLineIntersection,
      areTwoRectsCollided,
      rectToRectIntersection,
    },
    cross,
    dot,
    enterFrame,
    enumCheck,
    fract,
    getFPS,
    nthCall,
    generateDungeon,
    noop,
    noopReturnsWith,
    arraySet,
    removeFromArray,
    gridMapping: {
      coordToVector,
      vectorToCoord,
    },
    random: {
      getRandomFrom,
      hashNoise2D,
      stepNoise,
    },
  },
};

console.log(
  `%cPWGL Extensions v${AGLExtensions.version}\nhttps:\/\/github.com/asjs-dev/pwgl`,
  "background:#222;color:#0F0",
);
