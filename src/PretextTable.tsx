import React, { useCallback, useRef, useState, useMemo } from "react";
import { TableHeader } from "./components/TableHeader";
import { TableBody } from "./components/TableBody";
import { TableFooter } from "./components/TableFooter";
import { useColumnWidths } from "./hooks/useColumnWidths";
import { useRowHeights } from "./hooks/useRowHeights";
import { useVirtualRows } from "./hooks/useVirtualRows";
import { sortData } from "./utils/sorter";
import type { PretextTableProps, SortState, Column } from "./types";

const DEFAULT_HEADER_HEIGHT = 44;

export function PretextTable<T>({
  data,
  columns,
  height,
  font = "14px Inter, sans-serif",
  headerFont = "bold 14px Inter, sans-serif",
  lineHeight = 20,
  rowPadding = 12,
  sampleSize = 100,
  overscan = 5,
  onSort,
  onRowClick,
  className,
}: PretextTableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [sort, setSort] = useState<SortState | null>(null);
  const [colWidthOverrides, setColWidthOverrides] = useState<Map<number, number>>(new Map());

  // Observe container width
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const setContainerRef = useCallback((el: HTMLDivElement | null) => {
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }
    if (el) {
      setContainerWidth(el.clientWidth);
      resizeObserverRef.current = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          setContainerWidth(entry.contentRect.width);
        }
      });
      resizeObserverRef.current.observe(el);
    }
    (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
  }, []);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sort) return data;
    return sortData(data, sort.key as keyof T & string, sort.direction);
  }, [data, sort]);

  // Calculate column widths
  const autoWidths = useColumnWidths(sortedData, columns, containerWidth, {
    font,
    headerFont,
    sampleSize,
  });

  // Apply manual resize overrides
  const columnWidths = useMemo(() => {
    return autoWidths.map((w, i) => colWidthOverrides.get(i) ?? w);
  }, [autoWidths, colWidthOverrides]);

  // Calculate row heights
  const rowHeights = useRowHeights(sortedData, columns, columnWidths, {
    font,
    lineHeight,
    rowPadding,
  });

  // Virtualize
  const bodyHeight = height - DEFAULT_HEADER_HEIGHT;
  const { totalHeight, range, onScroll } = useVirtualRows(
    rowHeights,
    bodyHeight,
    overscan,
  );

  const handleSort = useCallback(
    (key: string) => {
      setSort((prev) => {
        const direction =
          prev?.key === key && prev.direction === "asc" ? "desc" : "asc";
        onSort?.(key, direction);
        return { key, direction };
      });
    },
    [onSort],
  );

  const handleResize = useCallback((index: number, width: number) => {
    setColWidthOverrides((prev) => {
      const next = new Map(prev);
      next.set(index, width);
      return next;
    });
  }, []);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      onScroll(e.currentTarget.scrollTop);
    },
    [onScroll],
  );

  return (
    <div
      ref={setContainerRef}
      className={`pretext-table${className ? ` ${className}` : ""}`}
      style={{
        height,
        width: "100%",
        overflow: "hidden",
        border: "1px solid #dee2e6",
        borderRadius: 4,
        fontFamily: "Inter, sans-serif",
        fontSize: 14,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TableHeader
        columns={columns}
        columnWidths={columnWidths}
        sort={sort}
        onSort={handleSort}
        onResize={handleResize}
        headerHeight={DEFAULT_HEADER_HEIGHT}
      />
      <div
        style={{
          flex: 1,
          overflow: "auto",
        }}
        onScroll={handleScroll}
      >
        <TableBody
          data={sortedData}
          columns={columns}
          columnWidths={columnWidths}
          rowHeights={rowHeights}
          range={range}
          totalHeight={totalHeight}
          onRowClick={onRowClick}
        />
      </div>
      <TableFooter
        totalRows={sortedData.length}
        visibleStart={range.startIndex}
        visibleEnd={range.endIndex}
      />
    </div>
  );
}
