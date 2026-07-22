type Vector2 = {
    x: number;
    y: number;
};
type Rect = Vector2 & {
    width: number;
    height: number;
};
type LineSegment = {
    a: Vector2;
    b: Vector2;
};

type LineCollision = {
    lambda: number;
    gamma: number;
};

/** Deeply compares two values for equality. */
declare const areObjectsEqual: (a: unknown, b: unknown) => boolean;

/** Sets values from a source array into a target array starting from a specified index. */
declare const arraySet: <T, U extends T>(target: T[], source: U[], from?: number) => T[];

/** Clamps a value between a minimum and maximum. */
declare const clamp: (min: number, max: number, value: number) => number;

/** Calculates the cross product of two 2D vectors. */
declare const cross: (a: Vector2, b: Vector2) => number;

type StateMachineSubscriber<State> = (state: State, previousState: State | undefined) => void;
type StateMachineActions<Actions> = {
    [Key in keyof Actions]: Actions[Key] extends (state: any, ...args: infer Args) => unknown ? (...args: Args) => void : never;
};
type StateMachine<State, Actions> = StateMachineActions<Actions> & {
    subscribe: (callback: StateMachineSubscriber<State>) => () => void;
};
type StateMachineConfigActions<Config> = Omit<Config, "initialState" | "strict">;
/** Creates a small observable state container. */
declare const createStateMachine: <Config extends {
    initialState: unknown;
    strict?: boolean;
}>(config: Config) => StateMachine<Config["initialState"], StateMachineConfigActions<Config>>;

/** Recursively freezes a plain object or array. */
declare const deepFreeze: <T>(value: T) => Readonly<T>;

/** Calculates the dot product of two 2D vectors. */
declare const dot: (a: Vector2, b: Vector2) => number;

type DungeonRoom = Rect & {
    data: number[];
};
type DungeonLayout = {
    width: number;
    height: number;
    data: number[];
};
/** Generates a dungeon layout by randomly placing rooms and resolving collisions. */
declare const generateDungeon: (iterations: number, sampleRooms: DungeonRoom[]) => DungeonLayout;

type EnterFrameCallback = (fps: number, delay: number) => void;
type EnterFrameLoop = {
    isPlaying: () => boolean;
    clearMaxFPS: () => EnterFrameLoop;
    getMaxFPS: () => number;
    setMaxFPS: (fpsLimit: number) => EnterFrameLoop;
    start: () => EnterFrameLoop;
    stop: () => EnterFrameLoop;
};
/** Creates an enter frame loop that calls a callback function at a specified FPS limit. */
declare const enterFrame: (callback: EnterFrameCallback, fpsLimit?: number) => EnterFrameLoop;

/** Checks if a specific bit is set in an enum value. */
declare const enumCheck: (value: number, num: number) => boolean;

type FPSCounterState = {
    update: () => void;
    fps: number;
    delay: number;
};
/** FPS counter utility. */
declare const FPSCounter: () => FPSCounterState;

/** Returns the fractional part of a number. */
declare const fract: (f: number) => number;

/** Returns the current frames per second. */
declare const getFPS: () => Promise<number>;

/**
 * Returns an incrementing identifier for the current runtime.
 * The first call returns `0`. After reaching JavaScript's largest safe integer,
 * `9_007_199_254_740_991`, the counter wraps back to `0`.
 */
declare const getUniqueId: () => number;

/** Mixes two values based on a third value. */
declare const mix: (a: number, b: number, c: number) => number;

/** A no-operation function */
declare const noop: () => void;

/** Returns a function that always returns the given value. */
declare const noopReturnsWith: <T>(value: T) => (() => T);

/** Call a function every nth call. */
declare const nthCall: <Args extends unknown[], Result>(callback: (...args: Args) => Result, nth: number, delay?: number) => ((...args: Args) => Result | false);

/** Remove an item from an array. */
declare const removeFromArray: <T>(array: T[], item: T) => void;

type IsoCoordinates = Vector2 & {
    z?: number;
};
type IsoItem = Vector2 & {
    z: number;
    gridX: number;
    gridY: number;
};
type IsoUtils = {
    toIsoCoordinates: (coords?: IsoCoordinates) => Vector2;
    getIsoItemByCoordinates: (isoItems: IsoItem[], coords?: Vector2) => IsoItem | undefined;
};
declare const createIsoUtils: (size: number) => IsoUtils;

/** This function ensures that the provided callback is executed when the document is ready */
declare const startup: (func: () => void) => void;

declare const collisionDetection: {
    distanceBetweenPointAndLine: (p: Vector2, l: LineSegment) => number;
    areTwoLinesCollided: (lineA: LineSegment, lineB: LineSegment) => LineCollision | undefined;
    lineToLineIntersection: (lineA: LineSegment, lineB: LineSegment) => Vector2 | null;
    areTwoRectsCollided: (rectA: Rect, rectB: Rect) => boolean;
    rectToRectIntersection: (rectA: Rect, rectB: Rect) => Rect | null;
};
declare const gridMapping: {
    coordToVector: (x: number, y: number, w: number) => number;
    vectorToCoord: (i: number, w: number) => Vector2;
};
declare const random: {
    getRandomFrom: <T>(items: T[]) => T;
    hashNoise2D: (x: number, y: number, seed?: number) => number;
    stepNoise: (x: number, y: number, seed?: number) => number;
};

export { FPSCounter, areObjectsEqual, arraySet, clamp, collisionDetection, createIsoUtils, createStateMachine, cross, deepFreeze, dot, enterFrame, enumCheck, fract, generateDungeon, getFPS, getUniqueId, gridMapping, mix, noop, noopReturnsWith, nthCall, random, removeFromArray, startup };
export type { IsoCoordinates, IsoItem, IsoUtils, LineSegment, Rect, Vector2 };
