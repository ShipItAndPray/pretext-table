import { useMemo } from "react";
import { calculateColumnWidths } from "../utils/columnSizer";
import type { Column } from "../types";

const DEFAULT_FONT = "14px Inter, sans-serif";
const DEFAULT_HEADER_FONT = "bold 14px Inter, sans-serif";

/**
 * React hook that computes optimal column widths using pretext measurement.
 * Recomputes only when data, columns, or container width changes.
 */
export function useColumnWidths<T>(
  data: T[],
  columns: Column<T>[],
  containerWidth: number,
  options?: {
    font?: string;
    headerFont?: string;
    sampleSize?: number;
  },
): number[] {
  const font = options?.font ?? DEFAULT_FONT;
  const headerFont = options?.headerFont ?? DEFAULT_HEADER_FONT;
  const sampleSize = options?.sampleSize ?? 100;

  return useMemo(
    () =>
      calculateColumnWidths(data, columns, font, headerFont, containerWidth, sampleSize),
    [data, columns, font, headerFont, containerWidth, sampleSize],
  );
}
