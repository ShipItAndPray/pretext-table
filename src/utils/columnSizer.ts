import { prepare, layout } from "@chenglou/pretext";
import type { Column } from "../types";

const DEFAULT_CELL_PADDING = 16;

/**
 * Sample rows evenly distributed across the dataset.
 * Takes first, last, and evenly spaced rows in between.
 */
function sampleRows<T>(data: T[], sampleSize: number): T[] {
  if (data.length <= sampleSize) return data;
  const result: T[] = [];
  const step = (data.length - 1) / (sampleSize - 1);
  for (let i = 0; i < sampleSize; i++) {
    result.push(data[Math.round(i * step)]);
  }
  return result;
}

/**
 * Measure the pixel width of a single-line text string using pretext.
 */
function measureTextWidth(text: string, font: string): number {
  if (!text) return 0;
  const prepared = prepare(text, font);
  // Layout with very wide maxWidth to get single-line width
  const result = layout(prepared, 100000, 20);
  // For single-line text, the width is approximated by the height ratio
  // Actually, pretext layout returns lineCount and height, not width directly.
  // We need to use a different approach: measure by finding the minimum width
  // that still fits in one line. But that's expensive.
  // Instead, use prepareWithSegments to get exact width.
  return result.height > 0 ? measureSingleLineWidth(text, font) : 0;
}

/**
 * Binary search for the minimum width that keeps text on a single line.
 * This is fast because prepare() results are cached by pretext.
 */
function measureSingleLineWidth(text: string, font: string): number {
  if (!text) return 0;
  const prepared = prepare(text, font);

  // First check: at a very wide width, how many lines?
  const wide = layout(prepared, 100000, 20);
  if (wide.lineCount <= 1) {
    // Binary search for minimum single-line width
    let lo = 1;
    let hi = 100000;
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2);
      const r = layout(prepared, mid, 20);
      if (r.lineCount <= 1) {
        hi = mid;
      } else {
        lo = mid;
      }
    }
    return hi;
  }
  // Multi-line even at max width (shouldn't happen for table headers)
  return 100000;
}

/**
 * Calculate optimal column widths using pretext text measurement.
 *
 * Algorithm:
 * 1. Sample up to sampleSize rows (evenly distributed)
 * 2. For each column, measure header and sampled cell values
 * 3. Column width = max(headerWidth, max(cellWidths)) + padding
 * 4. If total > containerWidth, proportionally shrink (respecting minWidth)
 * 5. If total < containerWidth, distribute remaining space to resizable columns
 */
export function calculateColumnWidths<T>(
  data: T[],
  columns: Column<T>[],
  font: string,
  headerFont: string,
  containerWidth: number,
  sampleSize: number,
): number[] {
  const sampled = sampleRows(data, sampleSize);

  const widths = columns.map((col) => {
    const minW = col.minWidth ?? 50;
    const maxW = col.maxWidth ?? 500;

    // Fixed width overrides auto-sizing
    if (col.width != null) {
      return Math.max(minW, Math.min(maxW, col.width));
    }

    // Measure header
    const headerWidth = measureSingleLineWidth(col.header, headerFont) + DEFAULT_CELL_PADDING * 2;

    // Measure sampled cells
    let maxCellWidth = 0;
    for (const row of sampled) {
      const val = row[col.key];
      const text = val == null ? "" : String(val);
      if (text) {
        const w = measureSingleLineWidth(text, font) + DEFAULT_CELL_PADDING * 2;
        if (w > maxCellWidth) maxCellWidth = w;
      }
    }

    const natural = Math.max(headerWidth, maxCellWidth);
    return Math.max(minW, Math.min(maxW, natural));
  });

  const totalWidth = widths.reduce((sum, w) => sum + w, 0);

  if (containerWidth > 0 && totalWidth !== containerWidth) {
    if (totalWidth > containerWidth) {
      // Proportionally shrink, respecting minWidth. Skip fixed-width columns.
      const excess = totalWidth - containerWidth;
      const shrinkable = widths.reduce((sum, w, i) => {
        if (columns[i].width != null) return sum;
        const min = columns[i].minWidth ?? 50;
        return sum + Math.max(0, w - min);
      }, 0);

      if (shrinkable > 0) {
        const ratio = Math.min(1, excess / shrinkable);
        for (let i = 0; i < widths.length; i++) {
          if (columns[i].width != null) continue;
          const min = columns[i].minWidth ?? 50;
          const available = widths[i] - min;
          if (available > 0) {
            widths[i] -= Math.round(available * ratio);
          }
        }
      }
    } else {
      // Distribute remaining space to resizable columns (skip fixed-width)
      const remaining = containerWidth - totalWidth;
      const flexCols = columns.filter((c) => c.resizable !== false && c.width == null);
      if (flexCols.length > 0) {
        const extra = Math.floor(remaining / flexCols.length);
        for (let i = 0; i < columns.length; i++) {
          if (columns[i].width != null) continue;
          if (columns[i].resizable !== false) {
            const maxW = columns[i].maxWidth ?? 500;
            widths[i] = Math.min(maxW, widths[i] + extra);
          }
        }
      }
    }
  }

  return widths;
}

export { sampleRows, measureSingleLineWidth };
