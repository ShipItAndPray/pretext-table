import { describe, it, expect, vi } from "vitest";
import { buildOffsets } from "../src/hooks/useRowHeights";

// Mock pretext
vi.mock("@chenglou/pretext", () => ({
  prepare: (text: string, _font: string) => ({ _text: text }),
  layout: (prepared: { _text: string }, maxWidth: number, lineHeight: number) => {
    const textWidth = prepared._text.length * 7;
    const lineCount = Math.max(1, Math.ceil(textWidth / maxWidth));
    return {
      lineCount,
      height: lineCount * lineHeight,
    };
  },
}));

describe("buildOffsets", () => {
  it("returns [0] for empty heights", () => {
    const offsets = buildOffsets([]);
    expect(offsets).toEqual([0]);
  });

  it("builds correct prefix sums", () => {
    const offsets = buildOffsets([44, 44, 60, 44]);
    expect(offsets).toEqual([0, 44, 88, 148, 192]);
  });

  it("last offset equals total height", () => {
    const heights = [30, 40, 50];
    const offsets = buildOffsets(heights);
    expect(offsets[offsets.length - 1]).toBe(120);
  });

  it("handles uniform heights", () => {
    const heights = Array(100).fill(44);
    const offsets = buildOffsets(heights);
    expect(offsets[50]).toBe(50 * 44);
    expect(offsets[100]).toBe(100 * 44);
  });
});
