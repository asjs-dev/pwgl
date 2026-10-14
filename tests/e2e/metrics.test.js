import { describe, expect, it } from "vitest";
import { benchmarkRenders, createBaseline, formatScoreReport, parseBaseline, quantile, scoreBenchmark } from "./metrics.js";

const result = (id, times, extra = {}) => {
  const sorted = [...times].sort((a, b) => a - b);
  return { id, frames: 100, runs: times.length, medianMs: sorted[sorted.length >> 1], times, hash: `hash-${id}`, ...extra };
};

const scale = (results, factor) =>
  results.map((item) => ({ ...item, medianMs: item.medianMs * factor, times: item.times.map((time) => time * factor) }));

const results = [result("a", [1, 1.1, 0.9, 1.05, 0.95]), result("b", [4, 4.4, 3.6, 4.2, 3.8])];
const baseline = createBaseline(results, { adapter: "GPU", userAgent: "UA", savedAt: "2026-01-01T00:00:00.000Z" });

describe("benchmarkRenders", () => {
  it("returns the per-run times next to the median", () => {
    const context = { gl: { finish() {} } };
    const measured = benchmarkRenders(context, () => {}, { frames: 4, runs: 3, warmup: 1 });
    expect(measured.times).toHaveLength(3);
    expect(measured.medianMs).toBe([...measured.times].sort((a, b) => a - b)[1]);
    expect(measured).toMatchObject({ frames: 4, runs: 3, drawCalls: 0, bufferSubDataBytes: 0 });
  });
});

describe("benchmark score", () => {
  it("quantile interpolates linearly and collapses to the value for one run", () => {
    expect(quantile([1, 2, 3, 4], 0.25)).toBeCloseTo(1.75);
    expect(quantile([1, 2, 3, 4], 0.75)).toBeCloseTo(3.25);
    expect(quantile([2], 0.25)).toBe(2);
    expect(quantile([2], 0.75)).toBe(2);
  });

  it("scores identical results 1000 within noise", () => {
    const scored = scoreBenchmark(results, baseline);
    expect(scored.score).toBeCloseTo(1000);
    expect(scored.verdict).toBe("within noise");
    expect(scored.compared).toBe(2);
    expect(scored.total).toBe(2);
    expect(scored.partial).toBe(false);
  });

  it("scores halved medians 2000 and better", () => {
    const scored = scoreBenchmark(scale(results, 0.5), baseline);
    expect(scored.score).toBeCloseTo(2000);
    expect(scored.verdict).toBe("better");
  });

  it("scores doubled medians 500 and worse", () => {
    const scored = scoreBenchmark(scale(results, 2), baseline);
    expect(scored.score).toBeCloseTo(500);
    expect(scored.verdict).toBe("worse");
  });

  it("uses the geometric mean of the ratios", () => {
    // Ratios 4 and 1: geomean 2, arithmetic mean 2.5.
    const current = [scale([results[0]], 0.25)[0], results[1]];
    expect(scoreBenchmark(current, baseline).score).toBeCloseTo(2000);
  });

  it("brackets the score with the quartile band", () => {
    const current = [result("a", [0.8, 1.3, 0.9, 1.0, 1.2]), result("b", [3.9, 4.1, 5, 3.5, 4])];
    const scored = scoreBenchmark(current, baseline);
    expect(scored.low).toBeLessThan(scored.score);
    expect(scored.high).toBeGreaterThan(scored.score);
    expect(scored.baselineLow).toBeLessThan(1000);
    expect(scored.baselineHigh).toBeGreaterThan(1000);
  });

  it("is within noise when the bands overlap but the score moved", () => {
    const scored = scoreBenchmark(scale(results, 0.97), baseline);
    expect(scored.score).toBeGreaterThan(1000);
    expect(scored.verdict).toBe("within noise");
  });

  it("excludes and lists missing, new, errored and reconfigured cases", () => {
    const wide = createBaseline(
      [...results, result("c", [1, 1, 1]), result("d", [2, 2, 2]), result("e", [3, 3, 3])],
      { adapter: "GPU" },
    );
    const current = [
      results[0],
      { id: "c", error: "ready timed out" },
      result("d", [2, 2, 2], { frames: 50 }),
      result("e", [3, 3, 3, 3]),
      result("f", [1, 1, 1]),
    ];
    const scored = scoreBenchmark(current, wide);
    expect(scored.missing).toEqual(["b"]);
    expect(scored.added).toEqual(["f"]);
    expect(scored.errored).toEqual(["c"]);
    expect(scored.reconfigured).toEqual(["d", "e"]);
    expect(scored.compared).toBe(1);
    expect(scored.total).toBe(6);
    expect(scored.partial).toBe(true);
    expect(scored.score).toBeCloseTo(1000);

    const report = formatScoreReport(scored).join("\n");
    expect(report).toContain("partial (1/6 cases)");
    expect(report).toContain("Missing (in baseline, not run now): b");
    expect(report).toContain("New (not in baseline): f");
    expect(report).toContain("Errored: c");
    expect(report).toContain("Reconfigured (frames or runs differ): d, e");
  });

  it("reports score, band, verdict and count for a full comparison", () => {
    const report = formatScoreReport(scoreBenchmark(results, baseline));
    expect(report).toContainEqual(expect.stringMatching(/^Score: 1000 \[\d+–\d+\]$/));
    expect(report).toContainEqual(expect.stringMatching(/^Verdict: within noise \(baseline band \[\d+–\d+\]\)$/));
    expect(report).toContain("Compared: 2/2 cases");
    expect(report.join("\n")).not.toMatch(/partial|Missing|New|Errored|Reconfigured|Hash changed/);
  });

  it("warns about a changed hash but keeps the case in the score", () => {
    const scored = scoreBenchmark([{ ...results[0], hash: "other" }, results[1]], baseline);
    expect(scored.hashChanged).toEqual(["a"]);
    expect(scored.compared).toBe(2);
    expect(scored.partial).toBe(false);
    expect(formatScoreReport(scored).join("\n")).toContain("Hash changed (rendered output differs; scored): a");
  });

  it("gives no score without comparable cases or without a baseline", () => {
    const empty = scoreBenchmark([{ id: "a", error: "boom" }, result("x", [1])], baseline);
    expect(empty.score).toBeNull();
    expect(empty.reason).toBe("no case is comparable with the baseline");
    expect(formatScoreReport(empty).join("\n")).toContain("Score: n/a — no case is comparable with the baseline");

    const none = scoreBenchmark(results, null);
    expect(none.score).toBeNull();
    expect(formatScoreReport(none).join("\n")).toContain("Score: n/a — no baseline saved for this adapter");
  });
});

describe("benchmark baseline", () => {
  it("saves only error-free cases", () => {
    const saved = createBaseline([...results, { id: "c", error: "boom" }]);
    expect(Object.keys(saved.cases)).toEqual(["a", "b"]);
    expect(saved.version).toBe(1);
  });

  it("accepts a serialized baseline", () => {
    expect(parseBaseline(JSON.stringify(baseline))).toEqual(baseline);
    expect(parseBaseline(baseline)).toEqual(baseline);
  });

  it("rejects a wrong version or malformed cases", () => {
    const broken = (patch) => JSON.stringify({ ...baseline, ...patch });
    const brokenCase = (patch) => broken({ cases: { a: { ...baseline.cases.a, ...patch } } });
    expect(() => parseBaseline(broken({ version: 2 }))).toThrow(/version/);
    expect(() => parseBaseline(broken({ cases: [] }))).toThrow(/cases/);
    expect(() => parseBaseline(brokenCase({ medianMs: "1" }))).toThrow(/"a"/);
    expect(() => parseBaseline(brokenCase({ times: [1, 2] }))).toThrow(/"a"/);
    expect(() => parseBaseline(brokenCase({ runs: 0 }))).toThrow(/"a"/);
    expect(() => parseBaseline(brokenCase({ hash: undefined }))).toThrow(/"a"/);
    expect(() => parseBaseline("[]")).toThrow(/object/);
    expect(() => parseBaseline("{")).toThrow();
  });
});
