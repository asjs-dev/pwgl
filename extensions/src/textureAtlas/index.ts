import { create } from "./creator";
import { getImage, parse } from "./parser";

export { create } from "./creator";
export type { AtlasOptions, AtlasResult } from "./creator";
export { getImage, parse } from "./parser";
export type {
  AtlasJson,
  AtlasJsonAsset,
  AtlasJsonImage,
  AtlasJsonOffset,
  AtlasJsonRect,
  ParsedAtlasAsset,
} from "./parser";

export const Atlas = {
  create,
  getImage,
  parse,
};
