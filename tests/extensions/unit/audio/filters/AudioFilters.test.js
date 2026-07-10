import { describe, expect, it } from "vitest";
import {
  BandPassAudioFilter,
  BaseAudioFilter,
  BiquadAudioFilter,
  HighShelfAudioFilter,
  HighPassAudioFilter,
  LowShelfAudioFilter,
  LowPassAudioFilter,
  NotchAudioFilter,
  PeakingAudioFilter,
} from "../../../../../extensions/src/audio/filters";
import { createAudioContextMock } from "../../helpers/browserAudioMocks";

describe("audio filters", () => {
  it("creates a base pass-through node", () => {
    const context = createAudioContextMock();
    const filter = new BaseAudioFilter();

    filter.createNodes(context);

    expect(filter.input).toBe(filter.output);
    expect(filter.input).toBeDefined();
  });

  it("applies biquad filter parameters to its node", () => {
    const context = createAudioContextMock();
    const filter = new BiquadAudioFilter({
      type: "peaking",
      frequency: 880,
      Q: 3,
      gain: 0.5,
    });

    filter.createNodes(context);

    expect(filter.input.type).toBe("peaking");
    expect(filter.input.frequency.value).toBe(880);
    expect(filter.input.Q.value).toBe(3);
    expect(filter.input.gain.value).toBe(0.5);

    filter.frequency = 440;
    filter.Q = 2;
    filter.gain = 0.25;

    expect(filter.input.frequency.value).toBe(440);
    expect(filter.input.Q.value).toBe(2);
    expect(filter.input.gain.value).toBe(0.25);
  });

  it("normalizes invalid biquad parameter values", () => {
    const context = createAudioContextMock();
    const filter = new BiquadAudioFilter({
      frequency: Number.NaN,
      Q: Number.NEGATIVE_INFINITY,
      gain: Number.POSITIVE_INFINITY,
    });

    filter.createNodes(context);

    expect(filter.input.frequency.value).toBe(350);
    expect(filter.input.Q.value).toBe(1);
    expect(filter.input.gain.value).toBe(0);

    filter.frequency = -1;
    filter.Q = -2;
    filter.gain = Number.NaN;

    expect(filter.input.frequency.value).toBe(0);
    expect(filter.input.Q.value).toBe(0);
    expect(filter.input.gain.value).toBe(0);
  });

  it("calls on-change callbacks when toggled", () => {
    let callbackFilter = null;
    const filter = new BaseAudioFilter();

    filter.$setOnChange((changedFilter) => {
      callbackFilter = changedFilter;
    });
    filter.on = false;

    expect(callbackFilter).toBe(filter);
  });

  it("sets built-in biquad filter types", () => {
    const context = createAudioContextMock();
    const filters = [
      new LowPassAudioFilter(),
      new HighPassAudioFilter(),
      new BandPassAudioFilter(),
      new NotchAudioFilter(),
      new PeakingAudioFilter(),
      new LowShelfAudioFilter(),
      new HighShelfAudioFilter(),
    ];

    filters.forEach((filter) => filter.createNodes(context));

    expect(filters.map((filter) => filter.input.type)).toEqual([
      "lowpass",
      "highpass",
      "bandpass",
      "notch",
      "peaking",
      "lowshelf",
      "highshelf",
    ]);
  });

  it("disconnects and destructs created nodes", () => {
    const context = createAudioContextMock();
    const filter = new LowPassAudioFilter();

    filter.createNodes(context);
    filter.disconnect();

    expect(filter.output.disconnect).toHaveBeenCalled();

    filter.destruct();

    expect(filter.input).toBe(null);
    expect(filter.output).toBe(null);
  });
});
