import { describe, expect, it } from "vitest";
import { BaseAudio } from "../../../../extensions/audio/BaseAudio";
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
    expect(context._nodes.lowPassNode.connect).toHaveBeenCalledWith(context.destination);
  });

  it("uses a finite default gain before config is applied", () => {
    const audio = new BaseAudio();
    const context = createAudioContextMock();

    audio.$createNodes(context);

    expect(audio.$gainNode.gain.value).toBe(1);

    audio.volume = Number.NaN;

    expect(audio.$gainNode.gain.value).toBe(1);
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
      lowPassFilterFrequency: 1000,
      lowPassFilterQ: 4,
      highPassFilterFrequency: 200,
      highPassFilterQ: 2,
    });

    expect(audio.$gainNode.gain.value).toBe(0.5);
    expect(audio.$panNode.pan.value).toBe(-0.2);
    expect(audio.$delayNode.delayTime.value).toBe(0.4);
    expect(audio.$feedbackGainNode.gain.value).toBe(0.3);
    expect(audio.$lowPassNode.frequency.value).toBe(1000);
    expect(audio.$lowPassNode.Q.value).toBe(4);
    expect(audio.$highPassNode.frequency.value).toBe(200);
    expect(audio.$highPassNode.Q.value).toBe(2);
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
    expect(audio.$lowPassNode).toBe(null);
  });
});
