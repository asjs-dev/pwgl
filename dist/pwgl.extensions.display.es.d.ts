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

export { AnimatedWater, SmoothLight };
