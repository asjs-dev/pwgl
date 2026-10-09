import { bufferLifecycle } from "./bufferLifecycle";
import { displayCases } from "./display";
import { filterCases } from "./filters";
import { filterPipeline } from "./filterPipeline";
import { gamePipeline } from "./gamePipeline";
import { contextRestore } from "./lifecycle";
import { lightingCases } from "./lighting";
import { rendererSwitch } from "./rendererSwitch";
import { stage2dCases } from "./stage2d";
import { stage2dBatch } from "./stage2dBatch";

export const cases = [
  stage2dBatch,
  ...stage2dCases,
  ...displayCases,
  filterPipeline,
  ...filterCases,
  ...lightingCases,
  rendererSwitch,
  gamePipeline,
  bufferLifecycle,
  contextRestore,
];
