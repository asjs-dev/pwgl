// @ts-nocheck
export const normalizeAudioValue = (value, fallback = 0, min = -Infinity, max = Infinity) => {
  const normalizedFallback = Number.isFinite(fallback) ? fallback : 0;
  const number = Number(value);
  const finiteValue = Number.isFinite(number) ? number : normalizedFallback;
  return Math.max(min, Math.min(max, finiteValue));
};
