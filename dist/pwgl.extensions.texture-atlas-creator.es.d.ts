type AtlasJsonRect = {
    x: number;
    y: number;
    width?: number;
    height?: number;
    w?: number;
    h?: number;
};
type AtlasJsonOffset = {
    x: number;
    y: number;
};
type AtlasJsonAsset = {
    exact?: AtlasJsonRect;
    e?: AtlasJsonRect;
    percent?: AtlasJsonRect;
    p?: AtlasJsonRect;
    offset?: AtlasJsonOffset;
    o?: AtlasJsonOffset;
    rotated?: 1;
    r?: 1;
};
type AtlasJson = {
    image?: Record<string, string | number>;
    i?: Record<string, string | number>;
    assets?: Record<string, AtlasJsonAsset>;
    a?: Record<string, AtlasJsonAsset>;
};

type AtlasSource = Blob & {
    name: string;
};
type AtlasOptions = {
    images: AtlasSource[];
    useExactValues?: boolean;
    usePercentValues?: boolean;
    trim?: boolean;
    addBase64?: boolean;
    addGaps?: boolean;
    extrude?: number;
    allowRotation?: boolean;
    powerOfTwo?: boolean;
    shortKeys?: boolean;
    maxTextureSize?: number;
};
type AtlasResult = {
    canvas: HTMLCanvasElement;
    json: AtlasJson;
    warnings: string[];
};
declare const create: ({ images, useExactValues: useExactValuesParam, usePercentValues: usePercentValuesParam, trim: trimParam, addBase64: addBase64Param, addGaps: addGapsParam, extrude: extrudeParam, allowRotation: allowRotationParam, powerOfTwo: powerOfTwoParam, shortKeys: shortKeysParam, maxTextureSize: maxTextureSizeParam, }: AtlasOptions) => Promise<AtlasResult>;

export { create };
export type { AtlasOptions, AtlasResult };
