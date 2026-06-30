import { describe, expect, it } from "vitest";
import { BaseAudio } from "../../../../extensions/audio/BaseAudio";
import { HighPassAudioFilter, LowPassAudioFilter, NotchAudioFilter } from "../../../../extensions/audio/filters";
import { createAudioContextMock } from "../helpers/browserAudioMocks";

describe("BaseAudio", () => {
  it("creates and connects audio nodes", () => {
    const audio = new BaseAudio();
    const context = createAudioContextMock();

    audio.$createNodes(context);
    audio.$connectNodes(context.destination);

    expect(audio.$nodesCreated).toBe(true);
    expect(audio.$nodesConnected).toBe(true);
    expect(context._nodes.gainNode.connect).toHaveBeenCalled();
    expect(context._nodes.delayNode.connect).toHaveBeenCalledWith(context.destination);
  });

  it("connects active filters in order", () => {
    const context = createAudioContextMock();
    const firstFilter = new LowPassAudioFilter({ frequency: 1200 });
    const disabledFilter = new HighPassAudioFilter({ on: false, frequency: 80 });
    const secondFilter = new NotchAudioFilter({ frequency: 440, Q: 8 });
    const audio = new BaseAudio();

    audio.filters = [firstFilter, disabledFilter, secondFilter];
    audio.$createNodes(context);
    audio.$connectNodes(context.destination);

    expect(audio.$filterInputNode.connect).toHaveBeenCalledWith(firstFilter.input);
    expect(firstFilter.output.connect).toHaveBeenCalledWith(secondFilter.input);
    expect(secondFilter.output.connect).toHaveBeenCalledWith(context.destination);
    expect(disabledFilter.input).toBe(null);
  });

  it("reconnects the filter chain when the filters list changes", () => {
    const context = createAudioContextMock();
    const firstFilter = new LowPassAudioFilter({ frequency: 1200 });
    const secondFilter = new NotchAudioFilter({ frequency: 440, Q: 8 });
    const audio = new BaseAudio();

    audio.filters = [firstFilter];
    audio.$createNodes(context);
    audio.$connectNodes(context.destination);
    audio.filters.push(secondFilter);

    expect(audio.$filterInputNode.disconnect).toHaveBeenCalled();
    expect(firstFilter.output.disconnect).toHaveBeenCalled();
    expect(firstFilter.output.connect).toHaveBeenCalledWith(secondFilter.input);
    expect(secondFilter.output.connect).toHaveBeenCalledWith(context.destination);
  });

  it("disconnects previous filters when the filters list is replaced", () => {
    const context = createAudioContextMock();
    const firstFilter = new LowPassAudioFilter({ frequency: 1200 });
    const secondFilter = new NotchAudioFilter({ frequency: 440, Q: 8 });
    const audio = new BaseAudio();

    audio.filters = [firstFilter];
    audio.$createNodes(context);
    audio.$connectNodes(context.destination);
    audio.filters = [secondFilter];

    expect(audio.$filterInputNode.disconnect).toHaveBeenCalled();
    expect(firstFilter.output.disconnect).toHaveBeenCalled();
    expect(audio.$filterInputNode.connect).toHaveBeenCalledWith(secondFilter.input);
    expect(secondFilter.output.connect).toHaveBeenCalledWith(context.destination);
  });

  it("reconnects when a filter on state changes", () => {
    const context = createAudioContextMock();
    const filter = new LowPassAudioFilter({ frequency: 1200 });
    const audio = new BaseAudio();

    audio.filters = [filter];
    audio.$createNodes(context);
    audio.$connectNodes(context.destination);
    filter.on = false;

    expect(audio.$filterInputNode.disconnect).toHaveBeenCalled();
    expect(filter.output.disconnect).toHaveBeenCalled();
    expect(audio.$filterInputNode.connect).toHaveBeenLastCalledWith(context.destination);

    filter.on = true;

    expect(audio.$filterInputNode.connect).toHaveBeenLastCalledWith(filter.input);
    expect(filter.output.connect).toHaveBeenLastCalledWith(context.destination);
  });

  it("uses a finite default gain before config is applied", () => {
    const audio = new BaseAudio();
    const context = createAudioContextMock();

    audio.$createNodes(context);

    expect(audio.$gainNode.gain.value).toBe(1);

    audio.volume = Number.NaN;

    expect(audio.$gainNode.gain.value).toBe(1);
  });

  it("normalizes invalid node parameter values", () => {
    const audio = new BaseAudio();
    const context = createAudioContextMock();

    audio.$createNodes(context);
    audio.$connectNodes(context.destination);
    audio.$setConfig({
      volume: Number.NaN,
      pan: 4,
      reverbDelayTime: -1,
      reverbFeedbackGain: Number.POSITIVE_INFINITY,
    });

    expect(audio.$gainNode.gain.value).toBe(1);
    expect(audio.$panNode.pan.value).toBe(1);
    expect(audio.$delayNode.delayTime.value).toBe(0);
    expect(audio.$feedbackGainNode.gain.value).toBe(0);
  });

  it("updates connected node parameters through config setters", () => {
    const audio = new BaseAudio();
    const context = createAudioContextMock();

    audio.$createNodes(context);
    audio.$connectNodes(context.destination);
    audio.$setConfig({
      volume: 0.5,
      pan: -0.2,
      reverbDelayTime: 0.4,
      reverbFeedbackGain: 0.3,
    });

    expect(audio.$gainNode.gain.value).toBe(0.5);
    expect(audio.$panNode.pan.value).toBe(-0.2);
    expect(audio.$delayNode.delayTime.value).toBe(0.4);
    expect(audio.$feedbackGainNode.gain.value).toBe(0.3);
  });

  it("mutes output without overwriting volume", () => {
    const audio = new BaseAudio();
    const context = createAudioContextMock();

    audio.$setConfig({ volume: 0.5 });
    audio.$createNodes(context);
    audio.$connectNodes(context.destination);

    expect(audio.volume).toBe(0.5);
    expect(audio.$gainNode.gain.value).toBe(0.5);

    audio.muted = true;
    expect(audio.volume).toBe(0.5);
    expect(audio.$gainNode.gain.value).toBe(0);

    audio.volume = 0.25;
    expect(audio.$gainNode.gain.value).toBe(0);

    audio.muted = false;
    expect(audio.$gainNode.gain.value).toBe(0.25);
  });

  it("disconnects nodes and clears references", () => {
    const audio = new BaseAudio();
    const context = createAudioContextMock();

    audio.$createNodes(context);
    audio.$connectNodes(context.destination);
    audio.$disconnectNodes();

    expect(audio.$nodesConnected).toBe(false);
    expect(audio.$gainNode).toBe(null);
    expect(audio.$filterInputNode).toBe(null);
  });
});
