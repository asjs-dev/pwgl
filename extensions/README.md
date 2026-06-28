# PWGL Extensions

A comprehensive utility package extending the capabilities of **PWGL** (Programmable WebGL) with advanced controls, audio processing, rendering enhancements, and utility functions for game development and interactive graphics applications.

## Overview

The PWGL Extensions library provides a collection of modules designed to streamline common development patterns, from input handling and audio management to collision detection and mathematical utilities. All functionality is exposed through the global `PWGLExtensions` (alias `AGLExtensions`) namespace.

## Modules

### Controls

Comprehensive input handling for keyboard, mouse, and gamepad devices.

#### **PressState** (`controls/PressState.js`)
Base class for tracking pressed and released states of input devices.
- Manages boolean state tracking for input events
- Provides methods for setting down/up states
- Foundation for all input handler implementations

#### **Keyboard** (`controls/Keyboard.js`)
Handles keyboard input events and key state tracking.
- Extends `PressState` for consistent state management
- Tracks pressed keys in real-time
- Optional target element for scoped event handling
- Methods:
  - `destruct()` - Clean up event listeners

#### **Mouse** (`controls/Mouse.js`)
Tracks mouse position, buttons, and wheel events.
- Position tracking (`x`, `y` coordinates)
- Button state management (left, right, middle)
- Wheel event detection and delta tracking
- Supports both document and element-scoped tracking

#### **Gamepad** (`controls/Gamepad.js`)
Full gamepad/controller input support using the Gamepad API.
- Button and axis tracking
- Multi-gamepad support
- Rumble/vibration feedback capabilities
- Analog stick and trigger detection

### Audio

Professional audio manipulation and mixing utilities powered by the Web Audio API.

#### **BaseAudio** (`audio/BaseAudio.js`)
Abstract base class for audio node management and control.
- **Properties:**
  - `volume` - Audio gain control (0-1 range)
  - `pan` - Stereo panning (-1 to 1)
  - `reverb` - Reverb effect parameter
  - `filter` - Audio filter configuration
- **Features:** Manages Web Audio API node connections, audio routing, and effect chains

#### **AudioItem** (`audio/AudioItem.js`)
Single audio playback with full playback control.
- Play, pause, resume, and stop controls
- Looping support
- Duration and current time tracking
- Volume and panning envelope automation

#### **AudioMixer** (`audio/AudioMixer.js`)
Multi-channel audio mixer for complex audio management.
- Mix multiple audio tracks simultaneously
- Per-track volume and pan control
- Master volume control
- Effect chain management

#### **Audio Utilities** (`audio/utils.js`)
Helper functions for audio manipulation.
- `fadeAudioVolume(duration)` - Smooth volume transitions
- `crossFadeAudioVolumes(duration)` - Fade between tracks

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

- **`clamp(value, min, max)`** - Constrain value within range
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

### Array and Object Utilities

- **`areObjectsEqual(obj1, obj2)`** - Deep equality comparison
- **`arraySet(target, source, offset)`** - Copy source values into a target array from an optional offset
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
  - Exposes readonly state snapshots to subscribers

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

// Audio
const audio = new PWGLExtensions.audio.AudioItem(audioBuffer);
const mixer = new PWGLExtensions.audio.AudioMixer();

// Visual effects
const water = new PWGLExtensions.display.AnimatedWater(noiseTexture, speed);

// Utilities
const distance = PWGLExtensions.utils.clamp(value, 0, 100);
const collides = PWGLExtensions.utils.collisionDetection.areTwoRectsCollided(rect1, rect2);

const counter = PWGLExtensions.utils.createStateMachine({
  initialState: { count: 0 },
  increment(state) {
    state.count += 1;
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
import { Keyboard, Mouse, AudioItem } from 'pwgl.extensions.es.min';
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
