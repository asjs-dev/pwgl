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

export { Gamepad, Keyboard, Mouse, PressState };
