import { FPS } from "./utils/FPS";
import { getFPS } from "./utils/getFPS";
import { PressState } from "./controls/PressState";
import { Mouse } from "./controls/Mouse";
import { Keyboard } from "./controls/Keyboard";
import { Gamepad } from "./controls/Gamepad";
import { createDataObserver } from "./utils/dataObserver";
import { crossFadeAudioVolumes, fadeAudioVolume } from "./audio/utils";
import { AudioItem } from "./audio/AudioItem";
import { AudioMixer } from "./audio/AudioMixer";
import { SmoothLight } from "./display/SmoothLight";
import { AnimatedWater } from "./display/AnimatedWater";
import { areObjectsEqual } from "./utils/areObjectsEqual";
import { clamp } from "./utils/clamp";
import { clone } from "./utils/clone";
import {
  areTwoLinesCollided,
  areTwoRectsCollided,
  distanceBetweenPointAndLine,
  lineToLineIntersection,
  rectToRectIntersection,
} from "./utils/collisionDetection";
import { cross } from "./utils/cross";
import { dot } from "./utils/dot";
import { enterFrame } from "./utils/enterFrame";
import { enumCheck } from "./utils/enumCheck";
import { fract } from "./utils/fract";
import { nthCall } from "./utils/nthCall";
import { mix } from "./utils/mix";
import { generateDungeon } from "./utils/dungeon";
import { noop } from "./utils/noop";
import { noopReturnsWith } from "./utils/noopReturnsWith";
import { arraySet } from "./utils/arraySet";
import { removeFromArray } from "./utils/removeFromArray";
import { coordToVector, vectorToCoord } from "./utils/gridMapping";
import { getRandomFrom } from "./utils/getRandomFrom";
import { hashNoise2D } from "./utils/hashNoise2D";
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
    FPS,
    createDataObserver,
    areObjectsEqual,
    clamp,
    mix,
    clone,
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
