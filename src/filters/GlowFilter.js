import { BaseSamplingFilter } from "./BaseSamplingFilter";

/**
 * Blur filter
 * @extends {BaseSamplingFilter}
 */
export class GlowFilter extends BaseSamplingFilter {
  constructor(
    intensityX,
    intensityY,
    isRadial = false,
    centerX = 0.5,
    centerY = 0.5,
    size = 1
  ) {
    super(2, intensityX, intensityY, isRadial, centerX, centerY, size);
  }
}
