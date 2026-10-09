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
     * Checks if the given id went down since the last update, even if it has been released since
     * @param {string|number} id - The identifier to check
     * @returns {boolean} True if it was pressed since the last update, false otherwise
     */
    isTapped(id: any): boolean;
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
     * Releases every held id, for example when the window loses focus
     */
    releaseAll(): void;
    /**
     * Updates the press state, clearing any completed states and taps
     */
    update(): void;
    $setDownState(id: any): void;
    $setUpState(id: any): void;
}

/**
 * @typedef {Object} KeyboardConfig
 * @property {boolean} [useCode=false] - Identify keys by `event.code` (the physical key, independent
 *                                        of the keyboard layout and modifiers) instead of `event.key`
 * @property {Array<string>} [preventDefault=[]] - Ids whose default browser action is prevented, such as page scrolling
 */
/**
 * Keyboard input handling. Every held key is released when the window loses focus.
 * @class Keyboard
 */
declare class Keyboard extends PressState {
    /**
     * @param {EventTarget} [target=window] - Target of the key events
     * @param {KeyboardConfig} [config={}]
     */
    constructor(target: any, config?: {});
    destruct(): void;
    _onKeyDown(event: any): void;
    _onKeyUp(event: any): void;
}

/**
 * @typedef {Object} MouseConfig
 * @property {boolean} [preventContextMenu=false] - Prevent the context menu on the target, so the
 *                                                  secondary button can be used in the game
 */
/**
 * Mouse and touch input handling. Buttons are identified by `Mouse.Button`; touches count as the
 * primary button. A button released outside the target, or while the window loses focus, is
 * released too.
 * @class Mouse
 */
declare class Mouse extends PressState {
    /**
     * @param {EventTarget} [target=window] - Target of the mouse and touch events
     * @param {MouseConfig} [config={}]
     */
    constructor(target: any, config?: {});
    destruct(): void;
    _onMouseDown(event: any): void;
    _onMouseUp(event: any): void;
    _onMouseMove(event: any): void;
    _onMouseLeave(): void;
    _onContextMenu(event: any): void;
    _getButton(event: any): any;
}

export { Gamepad, Keyboard, Mouse, PressState };
