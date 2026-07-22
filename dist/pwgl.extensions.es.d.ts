/**
 * The BaseAudio class provides methods and properties to control audio playback,
 * including volume, panning, reverb, and filtering effects. It manages the creation,
 * connection, and disconnection of audio nodes in a Web Audio API context.
 */
declare class BaseAudio {
    constructor();
    /**
     * Gets the volume.
     * @returns {number} The current volume.
     */
    get volume(): any;
    set volume(volume: any);
    /**
     * Gets muted state.
     * @returns {boolean} Whether the audio output is muted.
     */
    get muted(): any;
    set muted(muted: any);
    /**
     * Gets the ordered audio filter list.
     * @returns {Array<Object>} The current filter list.
     */
    get filters(): any;
    set filters(filters: any);
    /**
     * Gets the value of the pan property.
     * @returns {number} The current value of the pan.
     */
    get pan(): any;
    set pan(pan: any);
    /**
     * Gets the reverb delay time.
     * @returns {number} The current reverb delay time.
     */
    get reverbDelayTime(): any;
    set reverbDelayTime(delayTime: any);
    /**
     * Gets the reverb feedback gain value.
     * @returns {number} The current reverb feedback gain.
     */
    get reverbFeedbackGain(): any;
    set reverbFeedbackGain(feedbackGain: any);
    /**
     * @ignore
     */
    $createNodes(context: any): void;
    /**
     * @ignore
     */
    $connectNodes(destination: any): void;
    /**
     * @ignore
     */
    $connectFilterChain(inputNode: any, destination: any): void;
    /**
     * @ignore
     */
    $disconnectFilterChain(): void;
    /**
     * @ignore
     */
    $reconnectFilterChain(): void;
    /**
     * @ignore
     */
    $disconnectNodes(): void;
    /**
     * @ignore
     */
    $setConfig(config: any): void;
    /**
     * @ignore
     */
    $updateGain(): void;
}

/**
 * Represents an audio item that can be loaded, played, and manipulated.
 * Extends the BaseAudio class to provide additional functionality for handling audio data.
 */
declare class AudioItem extends BaseAudio {
    /**
     * Creates an instance of AudioItem.
     *
     * @param {string|null} [url=null] - The URL of the audio file to load.
     * @param {Object} [config={}] - Configuration for the audio item.
     */
    constructor(url?: null, config?: {});
    /**
     * Gets the audio duration in seconds.
     * @returns {number} The decoded audio duration.
     */
    get duration(): any;
    /**
     * Gets the current playback position in seconds.
     * @returns {number} The current playback position.
     */
    get currentTime(): any;
    /**
     * Gets the seek position in seconds.
     * @returns {number} The seek position.
     */
    get seek(): any;
    set seek(seek: any);
    /**
     * Gets the loop property.
     * @returns {boolean} The current value of the loop property.
     */
    get loop(): any;
    set loop(loop: any);
    /**
     * Gets the pitch value.
     * @returns {number} The current pitch value.
     */
    get pitch(): any;
    set pitch(pitch: any);
    /**
     * Asynchronously loads audio data from the provided URL.
     *
     * @param {string} url - The URL of the audio resource to load.
     * @returns {Promise<void>} A promise that resolves when the audio data is loaded.
     */
    load(url: any): Promise<void>;
    /**
     * Unloads the current instance by disconnecting and clearing the buffer.
     */
    unload(): void;
    /**
     * Connects the current instance to the provided audio mixer.
     * If already connected to a different audio mixer, it will first disconnect from the current one.
     *
     * @param {Object} audioMixer - The audio mixer to connect to.
     */
    connect(audioMixer: any): void;
    /**
     * Disconnects the current instance from the audio mixer.
     * If an audio mixer is connected, it stops the audio and disconnects the instance from the mixer.
     */
    disconnect(): void;
    /**
     * Starts playing the audio from the current seek position or a specified time.
     *
     * @param {number} [from=this.seek] - The time in seconds from which to start playing the audio.
     */
    play(from?: any): void;
    /**
     * Pauses the audio playback and stores the current seek position.
     */
    pause(): void;
    /**
     * Stops the audio playback and resets the seek position.
     */
    stop(): void;
    /**
     * @ignore
     */
    _getCurrentSeek(): any;
    /**
     * @ignore
     */
    _normalizeSeek(seek: any): number;
    /**
     * @ignore
     */
    $createNodes(context: any): void;
    /**
     * @ignore
     */
    $connectNodes(destination: any): void;
    /**
     * @ignore
     */
    $disconnectNodes(): void;
    /**
     * @ignore
     */
    $setConfig(config?: {}): void;
    /**
     * @ignore
     */
    _update(): Promise<void>;
}

/**
 * AudioMixer class that extends BaseAudio to manage and control multiple audio items.
 * It initializes an audio context, creates and connects audio nodes, and provides methods
 * to play, pause, stop, connect, and disconnect audio items.
 */
declare class AudioMixer extends BaseAudio {
    /**
     * Creates an instance of AudioMixer.
     * Initializes the audio context, creates and connects audio nodes, and sets config.
     *
     * @param {Object} [config={}] - Configuration for the audio mixer.
     */
    constructor(config?: {});
    /**
     * Gets the context.
     * @returns {Object} The current context.
     */
    get context(): any;
    /**
     * Gets the main node.
     * @returns {AudioNode} The main node associated with this instance.
     */
    get node(): any;
    /**
     * Plays all items in the collection.
     */
    play(): void;
    /**
     * Pauses all playing items in the collection.
     */
    pause(): void;
    /**
     * Stops all items in the collection and then calls the parent class's stop method.
     */
    stop(): void;
    /**
     * Cleans up the AudioMixer instance by stopping any ongoing processes
     * and disconnecting audio nodes.
     */
    destruct(): void;
    /**
     * Connects an audio item to the current instance if it is not already connected.
     * If the audio item is not in the list of items, it adds the audio item to the list
     * and calls the connect method on the audio item, passing the current instance.
     *
     * @param {Object} audioItem - The audio item to be connected.
     */
    connect(audioItem: any): void;
    /**
     * Disconnects the specified audio item from the list of items and calls its disconnect method.
     *
     * @param {Object} audioItem - The audio item to be disconnected.
     */
    disconnect(audioItem: any): void;
}

/**
 * Base class for audio filters that can be chained by BaseAudio.
 */
declare class BaseAudioFilter {
    /**
     * @param {Object} [config={}] - Filter configuration.
     * @param {boolean} [config.on=true] - Whether the filter is active in the chain.
     */
    constructor(config?: {});
    get on(): any;
    set on(on: any);
    /**
     * @ignore
     */
    $setOnChange(onChange: any): void;
    /**
     * Creates the filter nodes for the provided audio context.
     *
     * @param {BaseAudioContext} context - The Web Audio context.
     */
    createNodes(context: any): void;
    /**
     * Applies the current filter settings to created nodes.
     */
    updateNodes(): void;
    /**
     * Disconnects the filter output from the current graph without clearing settings.
     */
    disconnect(): void;
    /**
     * Disconnects and clears created nodes.
     */
    destruct(): void;
}

/**
 * Base class for BiquadFilterNode based audio filters.
 * @extends {BaseAudioFilter}
 */
declare class BiquadAudioFilter extends BaseAudioFilter {
    /**
     * @param {Object} [config={}] - Filter configuration.
     * @param {string} [config.type="lowpass"] - Biquad filter type.
     * @param {number} [config.frequency=350] - Filter frequency.
     * @param {number} [config.Q=1] - Filter Q value.
     * @param {number} [config.gain=0] - Filter gain value.
     */
    constructor(config?: {});
    get type(): any;
    set type(type: any);
    get frequency(): any;
    set frequency(frequency: any);
    get Q(): any;
    set Q(q: any);
    get gain(): any;
    set gain(gain: any);
    /**
     * @inheritdoc
     */
    createNodes(context: any): void;
    /**
     * @inheritdoc
     */
    updateNodes(): void;
}

/**
 * Band-pass audio filter.
 * @extends {BiquadAudioFilter}
 */
declare class BandPassAudioFilter extends BiquadAudioFilter {
    constructor(config?: {});
}

/**
 * High-shelf audio filter.
 * @extends {BiquadAudioFilter}
 */
declare class HighShelfAudioFilter extends BiquadAudioFilter {
    constructor(config?: {});
}

/**
 * High-pass audio filter.
 * @extends {BiquadAudioFilter}
 */
declare class HighPassAudioFilter extends BiquadAudioFilter {
    constructor(config?: {});
}

/**
 * Low-shelf audio filter.
 * @extends {BiquadAudioFilter}
 */
declare class LowShelfAudioFilter extends BiquadAudioFilter {
    constructor(config?: {});
}

/**
 * Low-pass audio filter.
 * @extends {BiquadAudioFilter}
 */
declare class LowPassAudioFilter extends BiquadAudioFilter {
    constructor(config?: {});
}

/**
 * Notch audio filter.
 * @extends {BiquadAudioFilter}
 */
declare class NotchAudioFilter extends BiquadAudioFilter {
    constructor(config?: {});
}

/**
 * Peaking audio filter.
 * @extends {BiquadAudioFilter}
 */
declare class PeakingAudioFilter extends BiquadAudioFilter {
    constructor(config?: {});
}

/**
 * Crossfades the volume between two audio items based on step
 * @param {AudioItem} audioItemA - The first audio item
 * @param {AudioItem} audioItemB - The second audio item
 * @param {number} min - The minimum volume for the first audio item
 * @param {number} max - The maximum volume for the first audio item
 * @param {number} step - The step value (0 to 1)
 */
declare const crossFadeAudioVolumes: (audioItemA: any, audioItemB: any, min: any, max: any, step: any) => void;

/**
 * Fades the volume of an audio item between min and max based on step
 * @param {AudioItem} audioItem - The audio item to fade
 * @param {number} min - The minimum volume
 * @param {number} max - The maximum volume
 * @param {number} step - The step value (0 to 1)
 */
declare const fadeAudioVolume: (audioItem: any, min: any, max: any, step: any) => number;

type index_d$4_AudioItem = AudioItem;
declare const index_d$4_AudioItem: typeof AudioItem;
type index_d$4_AudioMixer = AudioMixer;
declare const index_d$4_AudioMixer: typeof AudioMixer;
type index_d$4_BandPassAudioFilter = BandPassAudioFilter;
declare const index_d$4_BandPassAudioFilter: typeof BandPassAudioFilter;
type index_d$4_BaseAudioFilter = BaseAudioFilter;
declare const index_d$4_BaseAudioFilter: typeof BaseAudioFilter;
type index_d$4_BiquadAudioFilter = BiquadAudioFilter;
declare const index_d$4_BiquadAudioFilter: typeof BiquadAudioFilter;
type index_d$4_HighPassAudioFilter = HighPassAudioFilter;
declare const index_d$4_HighPassAudioFilter: typeof HighPassAudioFilter;
type index_d$4_HighShelfAudioFilter = HighShelfAudioFilter;
declare const index_d$4_HighShelfAudioFilter: typeof HighShelfAudioFilter;
type index_d$4_LowPassAudioFilter = LowPassAudioFilter;
declare const index_d$4_LowPassAudioFilter: typeof LowPassAudioFilter;
type index_d$4_LowShelfAudioFilter = LowShelfAudioFilter;
declare const index_d$4_LowShelfAudioFilter: typeof LowShelfAudioFilter;
type index_d$4_NotchAudioFilter = NotchAudioFilter;
declare const index_d$4_NotchAudioFilter: typeof NotchAudioFilter;
type index_d$4_PeakingAudioFilter = PeakingAudioFilter;
declare const index_d$4_PeakingAudioFilter: typeof PeakingAudioFilter;
declare const index_d$4_crossFadeAudioVolumes: typeof crossFadeAudioVolumes;
declare const index_d$4_fadeAudioVolume: typeof fadeAudioVolume;
declare namespace index_d$4 {
  export {
    index_d$4_AudioItem as AudioItem,
    index_d$4_AudioMixer as AudioMixer,
    index_d$4_BandPassAudioFilter as BandPassAudioFilter,
    index_d$4_BaseAudioFilter as BaseAudioFilter,
    index_d$4_BiquadAudioFilter as BiquadAudioFilter,
    index_d$4_HighPassAudioFilter as HighPassAudioFilter,
    index_d$4_HighShelfAudioFilter as HighShelfAudioFilter,
    index_d$4_LowPassAudioFilter as LowPassAudioFilter,
    index_d$4_LowShelfAudioFilter as LowShelfAudioFilter,
    index_d$4_NotchAudioFilter as NotchAudioFilter,
    index_d$4_PeakingAudioFilter as PeakingAudioFilter,
    index_d$4_crossFadeAudioVolumes as crossFadeAudioVolumes,
    index_d$4_fadeAudioVolume as fadeAudioVolume,
  };
}

/**
 * Gamepad input handling
 * @class Gamepad
 */
declare class Gamepad {
    constructor();
    isAnyConnected(): any;
    get(id: any): {
        axes: any;
        buttons: any;
        timestamp: any;
    } | null;
    get gamepads(): any;
    get any(): {
        axes: any;
        buttons: any;
        timestamp: any;
    } | null;
}

/**
 * Press state tracking for input controls
 * @class PressState
 */
declare class PressState {
    constructor();
    /**
     * Checks if the given id is currently down
     * @param {string|number} id - The identifier to check
     * @returns {boolean} True if down, false otherwise
     */
    isDown(id: any): boolean;
    /**
     * Checks if the given id is currently up
     * @param {string|number} id - The identifier to check
     * @returns {boolean} True if up, false otherwise
     */
    isUp(id: any): boolean;
    /**
     * Checks if the given id was a short press
     * @param {string|number} id - The identifier to check
     * @returns {boolean} True if it was a short press, false otherwise
     */
    isPressed(id: any): boolean;
    /**
     * Checks if the given id was a long press
     * @param {string|number} id - The identifier to check
     * @returns {boolean} True if it was a long press, false otherwise
     */
    isLongPressed(id: any): boolean;
    /**
     * Gets the duration the given id was held down
     * @param {string|number} id - The identifier to check
     * @returns {number} The duration in milliseconds
     */
    getDuration(id: any): number;
    /**
     * Updates the press state, clearing any completed states
     */
    update(): void;
    $setDownState(id: any): void;
    $setUpState(id: any): void;
}

/**
 * Keyboard input handling
 * @class Keyboard
 */
declare class Keyboard extends PressState {
    constructor(target: any);
    destruct(): void;
    _onKeyDown(event: any): void;
    _onKeyUp(event: any): void;
}

/**
 * Mouse input handling
 * @class Mouse
 */
declare class Mouse extends PressState {
    constructor(target: any);
    destruct(): void;
    _onMouseDown(event: any): void;
    _onMouseUp(event: any): void;
    _onMouseMove(event: any): void;
    _isPrimaryPointerEvent(event: any): any;
}

type index_d$3_Gamepad = Gamepad;
declare const index_d$3_Gamepad: typeof Gamepad;
type index_d$3_Keyboard = Keyboard;
declare const index_d$3_Keyboard: typeof Keyboard;
type index_d$3_Mouse = Mouse;
declare const index_d$3_Mouse: typeof Mouse;
type index_d$3_PressState = PressState;
declare const index_d$3_PressState: typeof PressState;
declare namespace index_d$3 {
  export {
    index_d$3_Gamepad as Gamepad,
    index_d$3_Keyboard as Keyboard,
    index_d$3_Mouse as Mouse,
    index_d$3_PressState as PressState,
  };
}

declare const AnimatedWater: {
    new (noiseTexture: any, speed?: number, level?: number, scale?: number): {
        /**
         * Gets or sets the speed of the water animation
         * @type {number}
         */
        speed: any;
        /**
         * Gets or sets the scale of the water displacement
         * @type {number}
         */
        scale: any;
        /**
         * Gets or sets the water level (green channel of the backdrop)
         * @type {number}
         */
        level: any;
        /**
         * Sets the size of the animated water effect
         * @param {number} w - Width
         * @param {number} h - Height
         */
        setSize(w: any, h: any): void;
        /**
         * Renders the animated water effect
         * @param {number} delay - The time delay since the last render
         */
        render(delay: any): void;
        move(x: any, y: any): void;
    };
} | null;

/**
 * @typedef {Object} SmoothLightRendererConfig
 * @extends {LightRendererConfig}
 * @property {number} blur
 */
/**
 * Renders smooth light effects using PWGL.LightRenderer and PWGL.BlurFilter
 * @class SmoothLight
 * @extends {PWGL.Image}
 */
declare const SmoothLight: {
    new (config?: {}): {
        /**
         * Set/Get blur value
         * @type {number}
         */
        blur: any;
        /**
         * Render
         */
        render(): void;
        /**
         * Set Renderer Size
         * @param {number} w - Width
         * @param {number} h - Height
         */
        setSize(w: any, h: any): void;
        /**
         * @ignore
         */
        _resize(): void;
    };
} | null;

declare const index_d$2_AnimatedWater: typeof AnimatedWater;
declare const index_d$2_SmoothLight: typeof SmoothLight;
declare namespace index_d$2 {
  export {
    index_d$2_AnimatedWater as AnimatedWater,
    index_d$2_SmoothLight as SmoothLight,
  };
}

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

type index_d$1_AtlasJson = AtlasJson;
type index_d$1_AtlasJsonAsset = AtlasJsonAsset;
type index_d$1_AtlasJsonImage = AtlasJsonImage;
type index_d$1_AtlasJsonOffset = AtlasJsonOffset;
type index_d$1_AtlasJsonRect = AtlasJsonRect;
type index_d$1_AtlasOptions = AtlasOptions;
type index_d$1_AtlasResult = AtlasResult;
type index_d$1_ParsedAtlasAsset = ParsedAtlasAsset;
declare const index_d$1_create: typeof create;
declare const index_d$1_getImage: typeof getImage;
declare const index_d$1_parse: typeof parse;
declare namespace index_d$1 {
  export { index_d$1_create as create, index_d$1_getImage as getImage, index_d$1_parse as parse };
  export type { index_d$1_AtlasJson as AtlasJson, index_d$1_AtlasJsonAsset as AtlasJsonAsset, index_d$1_AtlasJsonImage as AtlasJsonImage, index_d$1_AtlasJsonOffset as AtlasJsonOffset, index_d$1_AtlasJsonRect as AtlasJsonRect, index_d$1_AtlasOptions as AtlasOptions, index_d$1_AtlasResult as AtlasResult, index_d$1_ParsedAtlasAsset as ParsedAtlasAsset };
}

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

declare const index_d_FPSCounter: typeof FPSCounter;
type index_d_IsoCoordinates = IsoCoordinates;
type index_d_IsoItem = IsoItem;
type index_d_IsoUtils = IsoUtils;
type index_d_LineSegment = LineSegment;
type index_d_Rect = Rect;
type index_d_Vector2 = Vector2;
declare const index_d_areObjectsEqual: typeof areObjectsEqual;
declare const index_d_arraySet: typeof arraySet;
declare const index_d_clamp: typeof clamp;
declare const index_d_collisionDetection: typeof collisionDetection;
declare const index_d_createIsoUtils: typeof createIsoUtils;
declare const index_d_createStateMachine: typeof createStateMachine;
declare const index_d_cross: typeof cross;
declare const index_d_deepFreeze: typeof deepFreeze;
declare const index_d_dot: typeof dot;
declare const index_d_enterFrame: typeof enterFrame;
declare const index_d_enumCheck: typeof enumCheck;
declare const index_d_fract: typeof fract;
declare const index_d_generateDungeon: typeof generateDungeon;
declare const index_d_getFPS: typeof getFPS;
declare const index_d_getUniqueId: typeof getUniqueId;
declare const index_d_gridMapping: typeof gridMapping;
declare const index_d_mix: typeof mix;
declare const index_d_noop: typeof noop;
declare const index_d_noopReturnsWith: typeof noopReturnsWith;
declare const index_d_nthCall: typeof nthCall;
declare const index_d_random: typeof random;
declare const index_d_removeFromArray: typeof removeFromArray;
declare const index_d_startup: typeof startup;
declare namespace index_d {
  export { index_d_FPSCounter as FPSCounter, index_d_areObjectsEqual as areObjectsEqual, index_d_arraySet as arraySet, index_d_clamp as clamp, index_d_collisionDetection as collisionDetection, index_d_createIsoUtils as createIsoUtils, index_d_createStateMachine as createStateMachine, index_d_cross as cross, index_d_deepFreeze as deepFreeze, index_d_dot as dot, index_d_enterFrame as enterFrame, index_d_enumCheck as enumCheck, index_d_fract as fract, index_d_generateDungeon as generateDungeon, index_d_getFPS as getFPS, index_d_getUniqueId as getUniqueId, index_d_gridMapping as gridMapping, index_d_mix as mix, index_d_noop as noop, index_d_noopReturnsWith as noopReturnsWith, index_d_nthCall as nthCall, index_d_random as random, index_d_removeFromArray as removeFromArray, index_d_startup as startup };
  export type { index_d_IsoCoordinates as IsoCoordinates, index_d_IsoItem as IsoItem, index_d_IsoUtils as IsoUtils, index_d_LineSegment as LineSegment, index_d_Rect as Rect, index_d_Vector2 as Vector2 };
}

declare const version = "{{appVersion}}";

export { index_d$4 as audio, index_d$3 as controls, index_d$2 as display, index_d$1 as textureAtlas, index_d as utils, version };
