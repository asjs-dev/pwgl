import { BaseSamplingFilter } from "./BaseSamplingFilter";

/**
 * Blur filter
 * @extends {BaseSamplingFilter}
 */
export class BlurFilter extends BaseSamplingFilter {
  constructor(
    intensityX,
    intensityY,
    isRadial = false,
    centerX = 0.5,
    centerY = 0.5,
    size = 1
  ) {
    super(
      1,
      intensityX,
      intensityY,
      isRadial = false,
      centerX = 0.5,
      centerY = 0.5,
      size = 1
    );
  }
}
