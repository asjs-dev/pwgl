type Vector2 = {
    x: number;
    y: number;
};
type Rect = Vector2 & {
    width: number;
    height: number;
};

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
type AtlasJsonImage = {
    width: number;
    height: number;
    base64?: string;
};
type ParsedAtlasAsset = {
    name: string;
    exact: Rect | null;
    percent: Rect | null;
    offset: AtlasJsonOffset | null;
    rotated: boolean;
    image: AtlasJsonImage;
    source: AtlasJsonAsset;
};
declare const parse: (atlasJson: AtlasJson, name: string) => ParsedAtlasAsset | null;
declare const getImage: (atlasJson: AtlasJson) => Promise<HTMLImageElement | null>;

export { getImage, parse };
export type { AtlasJson, AtlasJsonAsset, AtlasJsonImage, AtlasJsonOffset, AtlasJsonRect, ParsedAtlasAsset };
