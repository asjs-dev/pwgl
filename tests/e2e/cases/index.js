import { bufferLifecycle } from "./bufferLifecycle";
import { filterPipeline } from "./filterPipeline";
import { gamePipeline } from "./gamePipeline";
import { rendererSwitch } from "./rendererSwitch";
import { stage2dBatch } from "./stage2dBatch";

export const cases = [bufferLifecycle, stage2dBatch, rendererSwitch, filterPipeline, gamePipeline];
