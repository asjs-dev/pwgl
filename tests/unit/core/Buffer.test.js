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
    gl.bufferSubData = vi.fn();

    buffer.create(gl, { aA: 3 });

    expect(gl.enableVertexAttribArray).toHaveBeenCalledTimes(2);
    expect(gl.vertexAttribPointer).toHaveBeenCalledTimes(2);
    expect(gl.vertexAttribDivisor).toHaveBeenCalledTimes(2);

    gl.enableVertexAttribArray.mockClear();
    gl.vertexAttribPointer.mockClear();
    gl.vertexAttribDivisor.mockClear();
    buffer.upload(gl);

    expect(gl.bindBuffer).toHaveBeenCalled();
    expect(gl.enableVertexAttribArray).not.toHaveBeenCalled();
    expect(gl.vertexAttribPointer).not.toHaveBeenCalled();
    expect(gl.vertexAttribDivisor).not.toHaveBeenCalled();
    expect(gl.bufferData).toHaveBeenCalledWith(
      buffer._target,
      buffer.data.byteLength + buffer._stride,
      buffer._type,
    );
    expect(gl.bufferSubData).toHaveBeenCalledWith(buffer._target, 0, buffer.data, 0, buffer.data.length);
  });

  it("uploads only the requested number of structured elements", async () => {
    const { Buffer } = await loadBufferModule();
    const buffer = new Buffer("aA", new Float32Array(32), 4, 2);
    const gl = createMockGl();

    gl.createBuffer = vi.fn(() => ({ id: "buffer" }));
    gl.bindBuffer = vi.fn();
    gl.enableVertexAttribArray = vi.fn();
    gl.vertexAttribPointer = vi.fn();
    gl.vertexAttribDivisor = vi.fn();
    gl.bufferData = vi.fn();
    gl.bufferSubData = vi.fn();

    buffer.create(gl, { aA: 3 });
    buffer.uploadElements(gl, 3);

    expect(gl.bufferData).toHaveBeenCalledWith(
      buffer._target,
      buffer.data.byteLength + buffer._stride,
      buffer._type,
    );
    expect(gl.bufferSubData).toHaveBeenCalledWith(buffer._target, 0, buffer.data, 0, 24);
  });

  it("retains GPU capacity when the logical data size decreases", async () => {
    const { Buffer } = await loadBufferModule();
    const buffer = new Buffer("aA", new Float32Array(8));
    const gl = createMockGl();

    gl.createBuffer = vi.fn(() => ({ id: "buffer" }));
    gl.bindBuffer = vi.fn();
    gl.enableVertexAttribArray = vi.fn();
    gl.vertexAttribPointer = vi.fn();
    gl.vertexAttribDivisor = vi.fn();
    gl.bufferData = vi.fn();
    gl.bufferSubData = vi.fn();

    buffer.create(gl, { aA: 1 });
    buffer.data = new Float32Array(4);
    buffer.upload(gl);

    expect(gl.bufferData).toHaveBeenCalledTimes(1);
    expect(gl.bufferSubData).toHaveBeenCalledWith(buffer._target, 0, buffer.data, 0, 4);
  });

  it("grows GPU capacity before uploading larger replacement data", async () => {
    const { Buffer } = await loadBufferModule();
    const buffer = new Buffer("aA", new Float32Array(2));
    const gl = createMockGl();

    gl.createBuffer = vi.fn(() => ({ id: "buffer" }));
    gl.bindBuffer = vi.fn();
    gl.enableVertexAttribArray = vi.fn();
    gl.vertexAttribPointer = vi.fn();
    gl.vertexAttribDivisor = vi.fn();
    gl.bufferData = vi.fn();
    gl.bufferSubData = vi.fn();

    buffer.create(gl, { aA: 1 });
    buffer.data = new Float32Array(6);
    buffer.upload(gl);

    expect(gl.bufferData).toHaveBeenNthCalledWith(1, buffer._target, 12, buffer._type);
    expect(gl.bufferData).toHaveBeenNthCalledWith(2, buffer._target, 28, buffer._type);
    expect(gl.bufferSubData).toHaveBeenCalledWith(buffer._target, 0, buffer.data, 0, 6);
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
