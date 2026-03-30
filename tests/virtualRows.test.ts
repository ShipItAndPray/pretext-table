import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVirtualRows } from "../src/hooks/useVirtualRows";

describe("useVirtualRows", () => {
  const uniformHeights = Array.from({ length: 10000 }, () => 44);
  const viewportHeight = 500;

  it("returns correct initial range at scrollTop 0", () => {
    const { result } = renderHook(() =>
      useVirtualRows(uniformHeights, viewportHeight, 5),
    );

    expect(result.current.range.startIndex).toBe(0);
    // ~500/44 = ~12 rows visible + 5 overscan
    expect(result.current.range.endIndex).toBeGreaterThanOrEqual(12);
    expect(result.current.range.endIndex).toBeLessThanOrEqual(20);
    expect(result.current.range.offsetY).toBe(0);
  });

  it("computes correct total height", () => {
    const { result } = renderHook(() =>
      useVirtualRows(uniformHeights, viewportHeight, 5),
    );

    expect(result.current.totalHeight).toBe(10000 * 44);
  });

  it("updates range on scroll", () => {
    const { result } = renderHook(() =>
      useVirtualRows(uniformHeights, viewportHeight, 5),
    );

    act(() => {
      result.current.onScroll(4400); // scroll to row ~100
    });

    expect(result.current.range.startIndex).toBeGreaterThanOrEqual(95);
    expect(result.current.range.startIndex).toBeLessThanOrEqual(100);
    expect(result.current.range.endIndex).toBeGreaterThanOrEqual(112);
  });

  it("handles empty data", () => {
    const { result } = renderHook(() =>
      useVirtualRows([], viewportHeight, 5),
    );

    expect(result.current.totalHeight).toBe(0);
    expect(result.current.range.startIndex).toBe(0);
    expect(result.current.range.endIndex).toBe(0);
  });

  it("handles variable row heights", () => {
    const mixed = [20, 60, 30, 100, 44, 44, 44, 80, 44, 44];
    const { result } = renderHook(() =>
      useVirtualRows(mixed, 100, 1),
    );

    const total = mixed.reduce((s, h) => s + h, 0);
    expect(result.current.totalHeight).toBe(total);
    expect(result.current.range.startIndex).toBe(0);
  });
});
