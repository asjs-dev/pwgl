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

export { AudioItem, AudioMixer, BandPassAudioFilter, BaseAudioFilter, BiquadAudioFilter, HighPassAudioFilter, HighShelfAudioFilter, LowPassAudioFilter, LowShelfAudioFilter, NotchAudioFilter, PeakingAudioFilter, crossFadeAudioVolumes, fadeAudioVolume };
