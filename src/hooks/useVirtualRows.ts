import { useMemo, useState, useCallback } from "react";
import { buildOffsets } from "./useRowHeights";
import type { VirtualRange } from "../types";

const DEFAULT_OVERSCAN = 5;

/**
 * Binary search for the first row whose bottom edge is >= scrollTop.
 */
function findStartIndex(offsets: number[], scrollTop: number): number {
  let lo = 0;
  let hi = offsets.length - 2; // last valid row index
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (offsets[mid + 1] <= scrollTop) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}

/**
 * React hook for row virtualization using pre-computed row heights.
 *
 * Uses binary search over a prefix-sum offset array to find visible rows.
 * Returns the visible range and a scroll handler to attach to the container.
 */
export function useVirtualRows(
  rowHeights: number[],
  viewportHeight: number,
  overscan?: number,
): {
  totalHeight: number;
  range: VirtualRange;
  onScroll: (scrollTop: number) => void;
} {
  const os = overscan ?? DEFAULT_OVERSCAN;
  const [scrollTop, setScrollTop] = useState(0);

  const offsets = useMemo(() => buildOffsets(rowHeights), [rowHeights]);
  const totalHeight = offsets[offsets.length - 1] ?? 0;

  const range = useMemo((): VirtualRange => {
    if (rowHeights.length === 0) {
      return { startIndex: 0, endIndex: 0, offsetY: 0 };
    }

    const rawStart = findStartIndex(offsets, scrollTop);
    const startIndex = Math.max(0, rawStart - os);

    // Find end index: first row whose top is past scrollTop + viewportHeight
    let endIndex = rawStart;
    while (endIndex < rowHeights.length && offsets[endIndex] < scrollTop + viewportHeight) {
      endIndex++;
    }
    endIndex = Math.min(rowHeights.length, endIndex + os);

    return {
      startIndex,
      endIndex,
      offsetY: offsets[startIndex],
    };
  }, [rowHeights, offsets, scrollTop, viewportHeight, os]);

  const onScroll = useCallback((top: number) => {
    setScrollTop(top);
  }, []);

  return { totalHeight, range, onScroll };
}
