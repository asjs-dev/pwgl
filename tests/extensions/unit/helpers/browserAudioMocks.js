import { vi } from "vitest";

const createConnectableNode = () => ({
  connect: vi.fn(),
  disconnect: vi.fn(),
});

export const createAudioContextMock = () => {
  const destination = { id: "destination" };
  const gainNode = { ...createConnectableNode(), gain: { value: 0 } };
  const panNode = { ...createConnectableNode(), pan: { value: 0 } };
  const delayNode = { ...createConnectableNode(), delayTime: { value: 0 } };
  const feedbackGainNode = { ...createConnectableNode(), gain: { value: 0 } };
  const lowPassNode = { ...createConnectableNode(), frequency: { value: 0 }, Q: { value: 0 }, type: "" };
  const highPassNode = { ...createConnectableNode(), frequency: { value: 0 }, Q: { value: 0 }, type: "" };
  let gainCount = 0;

  const context = {
    currentTime: 12,
    destination,
    createGain: vi.fn(() => (gainCount++ === 0 ? gainNode : feedbackGainNode)),
    createStereoPanner: vi.fn(() => panNode),
    createDelay: vi.fn(() => delayNode),
    createBiquadFilter: vi.fn(() => {
      const node = context._biquadCount++ === 0 ? lowPassNode : highPassNode;
      return node;
    }),
    createBufferSource: vi.fn(() => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      playbackRate: { value: 1 },
      buffer: null,
      loop: false,
    })),
    decodeAudioData: vi.fn(async () => ({ duration: 8 })),
    _biquadCount: 0,
    _nodes: {
      gainNode,
      panNode,
      delayNode,
      feedbackGainNode,
      lowPassNode,
      highPassNode,
      destination,
    },
  };

  return context;
};

export const createEventTargetMock = () => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
});

export const installBasicWindowMocks = () => {
  globalThis.window = globalThis.window ?? {};
  if (!Object.getOwnPropertyDescriptor(globalThis, "navigator")?.configurable) {
    return;
  }

  Object.defineProperty(globalThis, "navigator", {
    value: globalThis.navigator ?? {},
    configurable: true,
    writable: true,
  });
};
