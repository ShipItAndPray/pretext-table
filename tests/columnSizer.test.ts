import { describe, it, expect, vi } from "vitest";
import { calculateColumnWidths, sampleRows, measureSingleLineWidth } from "../src/utils/columnSizer";
import type { Column } from "../src/types";

// Mock @chenglou/pretext since jsdom lacks canvas
vi.mock("@chenglou/pretext", () => ({
  prepare: (text: string, _font: string) => ({ _text: text }),
  layout: (prepared: { _text: string }, maxWidth: number, _lineHeight: number) => {
    // Simulate: ~7px per character (monospace-ish)
    const textWidth = prepared._text.length * 7;
    const lineCount = Math.max(1, Math.ceil(textWidth / maxWidth));
    return {
      lineCount,
      height: lineCount * 20,
    };
  },
}));

interface TestRow {
  id: number;
  name: string;
  email: string;
}

const columns: Column<TestRow>[] = [
  { key: "id", header: "ID" },
  { key: "name", header: "Name" },
  { key: "email", header: "Email Address" },
];

const data: TestRow[] = Array.from({ length: 200 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
}));

describe("sampleRows", () => {
  it("returns all rows when data <= sampleSize", () => {
    const small = data.slice(0, 5);
    const result = sampleRows(small, 100);
    expect(result).toHaveLength(5);
  });

  it("returns exactly sampleSize rows for large data", () => {
    const result = sampleRows(data, 50);
    expect(result).toHaveLength(50);
  });

  it("includes first and last row", () => {
    const result = sampleRows(data, 10);
    expect(result[0]).toBe(data[0]);
    expect(result[result.length - 1]).toBe(data[data.length - 1]);
  });
});

describe("calculateColumnWidths", () => {
  it("produces an array with one width per column", () => {
    const widths = calculateColumnWidths(data, columns, "14px Inter", "bold 14px Inter", 800, 100);
    expect(widths).toHaveLength(3);
    widths.forEach((w) => expect(w).toBeGreaterThan(0));
  });

  it("respects fixed width", () => {
    const fixedCols: Column<TestRow>[] = [
      { key: "id", header: "ID", width: 80 },
      { key: "name", header: "Name" },
      { key: "email", header: "Email Address" },
    ];
    const widths = calculateColumnWidths(data, fixedCols, "14px Inter", "bold 14px Inter", 800, 100);
    expect(widths[0]).toBe(80);
  });

  it("respects minWidth", () => {
    const minCols: Column<TestRow>[] = [
      { key: "id", header: "ID", minWidth: 120 },
      { key: "name", header: "Name" },
      { key: "email", header: "Email Address" },
    ];
    const widths = calculateColumnWidths(data, minCols, "14px Inter", "bold 14px Inter", 800, 100);
    expect(widths[0]).toBeGreaterThanOrEqual(120);
  });

  it("respects maxWidth", () => {
    const maxCols: Column<TestRow>[] = [
      { key: "id", header: "ID" },
      { key: "name", header: "Name" },
      { key: "email", header: "Email Address", maxWidth: 100 },
    ];
    const widths = calculateColumnWidths(data, maxCols, "14px Inter", "bold 14px Inter", 800, 100);
    expect(widths[2]).toBeLessThanOrEqual(100);
  });

  it("handles empty data", () => {
    const widths = calculateColumnWidths([], columns, "14px Inter", "bold 14px Inter", 800, 100);
    expect(widths).toHaveLength(3);
    // Should still have header-based widths
    widths.forEach((w) => expect(w).toBeGreaterThan(0));
  });
});

describe("measureSingleLineWidth", () => {
  it("returns positive width for non-empty text", () => {
    const w = measureSingleLineWidth("Hello World", "14px Inter");
    expect(w).toBeGreaterThan(0);
  });

  it("returns 0 for empty text", () => {
    const w = measureSingleLineWidth("", "14px Inter");
    expect(w).toBe(0);
  });

  it("wider text produces wider measurement", () => {
    const short = measureSingleLineWidth("Hi", "14px Inter");
    const long = measureSingleLineWidth("Hello World this is long", "14px Inter");
    expect(long).toBeGreaterThan(short);
  });
});
