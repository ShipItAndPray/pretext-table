import { useMemo } from "react";
import { prepare, layout } from "@chenglou/pretext";
import type { Column } from "../types";

const DEFAULT_FONT = "14px Inter, sans-serif";
const DEFAULT_LINE_HEIGHT = 20;
const DEFAULT_ROW_PADDING = 12;
const CELL_HORIZONTAL_PADDING = 16;

/**
 * React hook that calculates all row heights using pretext text measurement.
 *
 * For each row, measures how tall each cell text would be at the given column
 * width, and uses the maximum as the row height. This enables variable-height
 * rows without any DOM measurement.
 */
export function useRowHeights<T>(
  data: T[],
  columns: Column<T>[],
  columnWidths: number[],
  options?: {
    font?: string;
    lineHeight?: number;
    rowPadding?: number;
  },
): number[] {
  const font = options?.font ?? DEFAULT_FONT;
  const lineHeight = options?.lineHeight ?? DEFAULT_LINE_HEIGHT;
  const rowPadding = options?.rowPadding ?? DEFAULT_ROW_PADDING;

  return useMemo(() => {
    return data.map((row) => {
      let maxCellHeight = lineHeight; // minimum 1 line
      columns.forEach((col, i) => {
        const val = row[col.key];
        const text = val == null ? "" : String(val);
        if (!text) return;
        const available = (columnWidths[i] ?? 100) - CELL_HORIZONTAL_PADDING * 2;
        if (available <= 0) return;
        try {
          const prepared = prepare(text, font);
          const result = layout(prepared, available, lineHeight);
          if (result.height > maxCellHeight) {
            maxCellHeight = result.height;
          }
        } catch {
          // Fallback: assume single line
        }
      });
      return maxCellHeight + rowPadding * 2;
    });
  }, [data, columns, columnWidths, font, lineHeight, rowPadding]);
}

/**
 * Build a prefix-sum array from row heights for O(1) offset lookups.
 */
export function buildOffsets(heights: number[]): number[] {
  const offsets = new Array(heights.length + 1);
  offsets[0] = 0;
  for (let i = 0; i < heights.length; i++) {
    offsets[i + 1] = offsets[i] + heights[i];
  }
  return offsets;
}
