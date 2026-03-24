import { describe, expect, it, vi } from "vitest";
import { createMockGl } from "../helpers/browserMocks";
import { loadSrcModuleWithBrowserMocks } from "../helpers/moduleLoaders";

const loadBufferModule = () => loadSrcModuleWithBrowserMocks("../../../src/core/Buffer.js");

describe("Buffer", () => {
  it("allocates typed arrays when a numeric length is provided", async () => {
    const { Buffer } = await loadBufferModule();
    const buffer = new Buffer("aA", 3, 2, 2);

    expect(buffer.data).toBeInstanceOf(Float32Array);
    expect(buffer.data).toHaveLength(12);
  });

  it("binds and uploads vertex attributes", async () => {
    const { Buffer } = await loadBufferModule();
    const buffer = new Buffer("aA", new Float32Array([1, 2, 3, 4]), 2, 1);
    const gl = createMockGl();

    gl.createBuffer = vi.fn(() => ({ id: "buffer" }));
    gl.bindBuffer = vi.fn();
    gl.enableVertexAttribArray = vi.fn();
    gl.vertexAttribPointer = vi.fn();
    gl.vertexAttribDivisor = vi.fn();
    gl.bufferData = vi.fn();

    buffer.create(gl, { aA: 3 });
    buffer.upload(gl);

    expect(gl.bindBuffer).toHaveBeenCalled();
    expect(gl.enableVertexAttribArray).toHaveBeenCalledTimes(2);
    expect(gl.vertexAttribPointer).toHaveBeenCalledTimes(2);
    expect(gl.vertexAttribDivisor).toHaveBeenCalledTimes(2);
    expect(gl.bufferData).toHaveBeenCalledWith(buffer._target, buffer.data, buffer._type);
  });

  it("drops references during destruct", async () => {
    const { Buffer } = await loadBufferModule();
    const buffer = new Buffer("aA", new Float32Array([1, 2]));
    const gl = createMockGl();

    gl.createBuffer = vi.fn(() => ({ id: "buffer" }));
    gl.bindBuffer = vi.fn();
    gl.deleteBuffer = vi.fn();

    buffer.create(gl, { aA: 1 });
    buffer.destruct(gl);

    expect(gl.deleteBuffer).toHaveBeenCalled();
    expect(buffer.data).toBe(null);
  });
});
