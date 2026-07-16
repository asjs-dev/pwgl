import type { Rect } from "../utils/types";

export type AtlasJsonRect = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  w?: number;
  h?: number;
};

export type AtlasJsonOffset = {
  x: number;
  y: number;
};

export type AtlasJsonAsset = {
  exact?: AtlasJsonRect;
  e?: AtlasJsonRect;
  percent?: AtlasJsonRect;
  p?: AtlasJsonRect;
  offset?: AtlasJsonOffset;
  o?: AtlasJsonOffset;
  rotated?: 1;
  r?: 1;
};

export type AtlasJson = {
  image?: Record<string, string | number>;
  i?: Record<string, string | number>;
  assets?: Record<string, AtlasJsonAsset>;
  a?: Record<string, AtlasJsonAsset>;
};

export type AtlasJsonImage = {
  width: number;
  height: number;
  base64?: string;
};

export type ParsedAtlasAsset = {
  name: string;
  exact: Rect | null;
  percent: Rect | null;
  offset: AtlasJsonOffset | null;
  rotated: boolean;
  image: AtlasJsonImage;
  source: AtlasJsonAsset;
};

const getAtlasJsonImage = (atlasJson: AtlasJson): Record<string, string | number> => atlasJson.image ?? atlasJson.i ?? {};
const getAtlasJsonAssets = (atlasJson: AtlasJson): Record<string, AtlasJsonAsset> =>
  atlasJson.assets ?? atlasJson.a ?? {};

const getAssetRect = (asset: AtlasJsonAsset, longKey: "exact" | "percent", shortKey: "e" | "p"): Rect | null => {
  const rect = asset[longKey] ?? asset[shortKey];

  return rect
    ? {
        x: rect.x,
        y: rect.y,
        width: rect.width ?? rect.w ?? 0,
        height: rect.height ?? rect.h ?? 0,
      }
    : null;
};

const getAtlasJsonImageData = (atlasJson: AtlasJson): AtlasJsonImage => {
  const image = getAtlasJsonImage(atlasJson);
  const base64 = image.base64 ?? image.b;

  return {
    width: Number(image.width ?? image.w ?? 0),
    height: Number(image.height ?? image.h ?? 0),
    base64: typeof base64 === "string" ? base64 : undefined,
  };
};

export const parse = (atlasJson: AtlasJson, name: string): ParsedAtlasAsset | null => {
  const asset = getAtlasJsonAssets(atlasJson)[name];

  return asset
    ? {
        name,
        exact: getAssetRect(asset, "exact", "e"),
        percent: getAssetRect(asset, "percent", "p"),
        offset: asset.offset ?? asset.o ?? null,
        rotated: Boolean(asset.rotated ?? asset.r),
        image: getAtlasJsonImageData(atlasJson),
        source: asset,
      }
    : null;
};

export const getImage = (atlasJson: AtlasJson): Promise<HTMLImageElement | null> => {
  const { base64 } = getAtlasJsonImageData(atlasJson);

  if (!base64) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const image = new Image();

    image.addEventListener("load", () => resolve(image), { once: true });
    image.addEventListener("error", reject, { once: true });
    image.src = base64;
  });
};
