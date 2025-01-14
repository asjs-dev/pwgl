import { mix } from "../utils/mix";

export const fadeAudioVolume = (audioItem, min, max, step) =>
  (audioItem.volume = mix(min, max, step));

export const crossFadeAudioVolumes = (
  audioItemA,
  audioItemB,
  min,
  max,
  step
) => {
  const mixValue = mix(min, max, step);
  audioItemA.volume = mixValue;
  audioItemB.volume = 1 - mixValue;
};
