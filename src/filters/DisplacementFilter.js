import { BaseTextureFilter } from "./BaseTextureFilter";

const _GLSL = BaseTextureFilter.$createGLSL(
  "oCl=texture(uTex,vTUv+(Z.yz*(mskCl.rg-.5)*2.*vol));"
);
/**
 * Displacement filter
 * @extends {BaseTextureFilter}
 */
export class DisplacementFilter extends BaseTextureFilter {
  get GLSL() {
    return _GLSL;
  }
}
