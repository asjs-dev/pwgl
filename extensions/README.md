# PWGL Extensions

A comprehensive utility package extending the capabilities of **PWGL** (Programmable WebGL) with advanced controls, audio processing, rendering enhancements, and utility functions for game development and interactive graphics applications.

## Overview

The PWGL Extensions library provides a collection of modules designed to streamline common development patterns, from input handling and audio management to collision detection and mathematical utilities. All functionality is exposed through the global `PWGLExtensions` (alias `AGLExtensions`) namespace.

## Modules

### Controls

Comprehensive input handling for keyboard, mouse, and gamepad devices.

#### **PressState** (`controls/PressState.js`)
Base class for tracking pressed and released states of input devices.
- Tracks down/up/pressed state and press duration for input events
- Provides `isDown()`, `isUp()`, `isPressed()`, `isLongPressed()`, and `getDuration()`
- Ignores repeated down events while a key/button is already held
- Foundation for all input handler implementations

#### **Keyboard** (`controls/Keyboard.js`)
Handles keyboard input events and key state tracking.
- Extends `PressState` for consistent state management
- Tracks pressed keys in real-time
- Optional target element for scoped event handling
- Methods:
  - `destruct()` - Clean up event listeners

#### **Mouse** (`controls/Mouse.js`)
Tracks primary mouse/touch position and press state.
- Position tracking (`x`, `y` coordinates)
- Primary pointer state management through `PressState`
- Supports mouse and touch events
- Supports both document and element-scoped tracking

#### **Gamepad** (`controls/Gamepad.js`)
Full gamepad/controller input support using the Gamepad API.
- Normalized button and axis snapshots
- Multi-gamepad support
- `get(id)` returns a normalized gamepad or `null`
- `any` returns the first connected normalized gamepad or `null`
- `isAnyConnected()` checks if at least one gamepad is available

### Audio

Professional audio manipulation and mixing utilities powered by the Web Audio API.

#### **BaseAudio** (`audio/BaseAudio.js`)
Abstract base class for audio node management and control.
- **Properties:**
  - `volume` - Audio gain control (0-1 range)
  - `muted` - Mutes output without changing the stored volume
  - `pan` - Stereo panning (-1 to 1)
  - `reverb` - Reverb effect parameter
  - `filters` - Ordered audio filter list
- **Features:** Manages Web Audio API node connections, audio routing, and effect chains

#### **Audio Filters** (`audio/filters/`)
Ordered Web Audio filter classes that can be attached to `AudioItem` or `AudioMixer` instances.
- `BaseAudioFilter` - Base input/output interface for custom audio filters
- `BiquadAudioFilter` - Base class for `BiquadFilterNode` filters
- `LowPassAudioFilter` - Low-pass filter
- `HighPassAudioFilter` - High-pass filter
- `BandPassAudioFilter` - Band-pass filter
- `NotchAudioFilter` - Notch filter
- `PeakingAudioFilter` - Boosts or cuts a focused frequency band
- `LowShelfAudioFilter` - Boosts or cuts frequencies below a cutoff
- `HighShelfAudioFilter` - Boosts or cuts frequencies above a cutoff
- Filters run in array order and can be bypassed with `filter.on = false`
- Built-in numeric parameters are normalized before they are written to Web Audio params

#### **AudioItem** (`audio/AudioItem.js`)
Single audio playback with full playback control.
- Play, pause, and stop controls
- Looping support
- Seek, duration, and current time tracking
- Volume and panning envelope automation

#### **AudioMixer** (`audio/AudioMixer.js`)
Multi-channel audio mixer for complex audio management.
- Mix multiple audio tracks simultaneously
- Per-track volume and pan control
- Master volume control
- Effect chain management

#### **Audio Utilities** (`audio/utils/`)
Helper functions for audio manipulation.
- `fadeAudioVolume(audioItem, min, max, step)` - Set a mixed volume value
- `crossFadeAudioVolumes(audioItemA, audioItemB, min, max, step)` - Crossfade between two items

#### **Migration: Audio Filters**
The fixed low-pass and high-pass `BaseAudio` properties were removed in the major filter API update.

Replace old direct filter properties:

```javascript
audio.lowPassFilterFrequency = 6000;
audio.lowPassFilterQ = 1;
audio.highPassFilterFrequency = 120;
audio.highPassFilterQ = 0.7;
```

with explicit filter instances:

```javascript
audio.filters = [
  new PWGLExtensions.audio.HighPassAudioFilter({ frequency: 120, Q: 0.7 }),
  new PWGLExtensions.audio.LowPassAudioFilter({ frequency: 6000, Q: 1 }),
];
```

Use the same `filters` array on `AudioMixer` for master output filtering.

### Display

Specialized rendering components for visual effects.

#### **AnimatedWater** (`display/AnimatedWater.js`)
Realistic animated water surface effect using displacement mapping.
- Layered water displacement simulation
- Configurable animation speed and distortion level
- Scale and offset control
- Uses noise textures for natural water behavior
- Optimized for real-time rendering

#### **SmoothLight** (`display/SmoothLight.js`)
Smooth lighting and shadow calculations for dynamic scenes.
- Soft shadow rendering
- Light falloff and attenuation
- Optimized lighting calculations
- Suitable for deferred and forward rendering

## Utilities

A comprehensive collection of mathematical, collision detection, and utility functions.

### Mathematical Utilities

- **`clamp(min, max, value)`** - Constrain value within range
- **`mix(a, b, t)`** - Linear interpolation between values
- **`fract(value)`** - Fractional part of a number (same as `fract()` in GLSL)
- **`dot(a, b)`** - Dot product of two vectors
- **`cross(a, b)`** - Cross product of two vectors
- **`enumCheck(value, enumObj)`** - Validate enum values

### Collision Detection (`collisionDetection`)

Advanced spatial collision algorithms for game development:
- **`areTwoRectsCollided(rect1, rect2)`** - AABB rectangle collision
- **`areTwoLinesCollided(line1, line2)`** - Line segment intersection
- **`rectToRectIntersection(rect1, rect2)`** - Get intersection rectangle
- **`lineToLineIntersection(line1, line2)`** - Find intersection point
- **`distanceBetweenPointAndLine(point, line)`** - Point-to-line distance calculation

Rectangles use `{ x, y, width, height }`, where `width` and `height` are sizes.

### Array and Object Utilities

- **`areObjectsEqual(obj1, obj2)`** - Deep equality comparison
- **`arraySet(target, source, offset)`** - Copy source values into a target array from an optional offset
- **`deepFreeze(value)`** - Recursively freeze a plain object or array
- **`removeFromArray(array, item)`** - Remove first occurrence from array

### Procedural Generation

- **`generateDungeon(iterations, sampleRooms)`** - Procedural dungeon layout generation
- **`hashNoise2D(x, y)`** - 2D hash noise function for terrain generation
- **`stepNoise(value, steps)`** - Quantized noise for stylized effects
- **`getRandomFrom(array)`** - Get random element from array

### Animation and Timing

- **`nthCall(fn, n)`** - Execute function every nth call
- **`enterFrame(callback, fps)`** - Frame-based animation loop
- **`FPSCounter` class / `getFPS()`** - Frame rate monitoring and statistics

### Grid and Spatial Mapping

- **`coordToVector(x, y, width)`** - Convert 2D grid coordinates to linear index
- **`vectorToCoord(index, width)`** - Convert linear index to 2D coordinates

### State Management

- **`createStateMachine(config)`** - Small observable state container
  - Accepts `initialState` and action functions on the same config object
  - Batches subscriber notifications into the next microtask after actions run
  - Skips notification when an action explicitly returns `false`
  - Deeply freezes subscriber snapshots by default
  - Supports `strict: false` to skip freezing in performance-critical code
  - Passes the previous snapshot as the second subscriber argument; it is `undefined` only during the initial subscription

With `strict: false`, snapshots are still cloned but are mutable. Subscribers must not modify them: all listeners in the same notification receive the same snapshot, and that object becomes the next `previousState`.

### Utility Functions

- **`noop()`** - No-operation function (often used as default callback)
- **`noopReturnsWith(value)`** - Returns a function that returns the specified value

## Usage

All extensions are accessed through the global namespace:

```javascript
// Input handling
const keyboard = new PWGLExtensions.controls.Keyboard();
const mouse = new PWGLExtensions.controls.Mouse();
const gamepad = new PWGLExtensions.controls.Gamepad();
const firstPad = gamepad.any;

// Audio
const audio = new PWGLExtensions.audio.AudioItem(audioUrl);
const mixer = new PWGLExtensions.audio.AudioMixer();
audio.filters = [
  new PWGLExtensions.audio.HighPassAudioFilter({ frequency: 120 }),
  new PWGLExtensions.audio.NotchAudioFilter({ frequency: 440, Q: 8 }),
  new PWGLExtensions.audio.LowPassAudioFilter({ frequency: 6000 }),
];

class TelephoneAudioFilter extends PWGLExtensions.audio.BaseAudioFilter {
  createNodes(context) {
    this.input = this.output = context.createBiquadFilter();
    this.input.type = "bandpass";
    this.input.frequency.value = 1400;
    this.input.Q.value = 0.8;
  }
}

audio.filters.push(new TelephoneAudioFilter());
audio.filters[0].on = false;

// Visual effects
const water = new PWGLExtensions.display.AnimatedWater(noiseTexture, speed);

// Utilities
const distance = PWGLExtensions.utils.clamp(0, 100, value);
const collides = PWGLExtensions.utils.collisionDetection.areTwoRectsCollided(rect1, rect2);

const counter = PWGLExtensions.utils.createStateMachine({
  initialState: { count: 0 },
  strict: true,
  increment(state) {
    state.count += 1;
  },
  setCount(state, count) {
    if (state.count === count) return false;

    state.count = count;
  },
});
counter.subscribe((state, prevState) => {
  console.log(state.count, prevState?.count);
});
counter.increment();
```

## Installation

The extensions package is included with PWGL. Import from your project:

```javascript
import * as PWGLExt from 'pwgl.extensions.es.min';
// or
import { Keyboard, Mouse, AudioItem, LowPassAudioFilter } from 'pwgl.extensions.es.min';
```

## Browser Compatibility

- Requires **ECMAScript 2015 (ES6)** or later
- Some utilities use **`structuredClone`** for deep copies
- Audio features require **Web Audio API** support
- Gamepad support requires the **Gamepad API**
- Graphics features require **WebGL** context

## Performance Considerations

- Use `areObjectsEqual()` and `createStateMachine()` judiciously for large datasets
- Collision detection functions are optimized for AABB and simple geometry
- Audio processing is GPU-accelerated through Web Audio API
- Frame-rate independent timing recommended for animation loops

## License

See LICENSE file in the repository root for licensing information.
