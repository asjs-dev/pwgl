import { describe, expect, it } from "vitest";
import { crossFadeAudioVolumes, fadeAudioVolume } from "../../../../extensions/src/audio/utils";

describe("audio utils", () => {
  it("fades a single audio item volume", () => {
    const item = { volume: 0 };

    fadeAudioVolume(item, 0.2, 0.8, 0.25);

    expect(item.volume).toBeCloseTo(0.65);
  });

  it("crossfades two audio item volumes", () => {
    const a = { volume: 0 };
    const b = { volume: 0 };

    crossFadeAudioVolumes(a, b, 0.2, 0.8, 0.25);

    expect(a.volume).toBeCloseTo(0.65);
    expect(b.volume).toBeCloseTo(0.35);
  });
});
