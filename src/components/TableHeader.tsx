import React, { useCallback, useRef } from "react";
import type { Column, SortState } from "../types";

interface TableHeaderProps<T> {
  columns: Column<T>[];
  columnWidths: number[];
  sort: SortState | null;
  onSort: (key: string) => void;
  onResize: (index: number, width: number) => void;
  headerHeight: number;
}

export function TableHeader<T>({
  columns,
  columnWidths,
  sort,
  onSort,
  onResize,
  headerHeight,
}: TableHeaderProps<T>) {
  return (
    <div
      role="row"
      className="pretext-table-header"
      style={{
        display: "flex",
        position: "sticky",
        top: 0,
        zIndex: 1,
        height: headerHeight,
        backgroundColor: "#f8f9fa",
        borderBottom: "2px solid #dee2e6",
        fontWeight: "bold",
        userSelect: "none",
      }}
    >
      {columns.map((col, i) => (
        <HeaderCell
          key={col.key}
          column={col}
          width={columnWidths[i]}
          index={i}
          sort={sort}
          onSort={onSort}
          onResize={onResize}
          height={headerHeight}
        />
      ))}
    </div>
  );
}

interface HeaderCellProps<T> {
  column: Column<T>;
  width: number;
  index: number;
  sort: SortState | null;
  onSort: (key: string) => void;
  onResize: (index: number, width: number) => void;
  height: number;
}

function HeaderCell<T>({
  column,
  width,
  index,
  sort,
  onSort,
  onResize,
  height,
}: HeaderCellProps<T>) {
  const resizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (column.resizable === false) return;
      e.preventDefault();
      e.stopPropagation();
      resizing.current = true;
      startX.current = e.clientX;
      startWidth.current = width;

      const handleMouseMove = (ev: MouseEvent) => {
        if (!resizing.current) return;
        const diff = ev.clientX - startX.current;
        const newWidth = Math.max(column.minWidth ?? 50, startWidth.current + diff);
        onResize(index, Math.min(column.maxWidth ?? 500, newWidth));
      };

      const handleMouseUp = () => {
        resizing.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [column, width, index, onResize],
  );

  const sortable = column.sortable !== false;
  const isSorted = sort?.key === column.key;
  const arrow = isSorted ? (sort.direction === "asc" ? " \u2191" : " \u2193") : "";

  return (
    <div
      role="columnheader"
      className="pretext-table-header-cell"
      style={{
        width,
        minWidth: width,
        maxWidth: width,
        height,
        padding: "0 16px",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        position: "relative",
        cursor: sortable ? "pointer" : "default",
        overflow: "hidden",
      }}
      onClick={() => sortable && onSort(column.key)}
    >
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {column.header}
        {arrow}
      </span>
      {column.resizable !== false && (
        <div
          className="pretext-table-resize-handle"
          onMouseDown={handleMouseDown}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 4,
            cursor: "col-resize",
            backgroundColor: "transparent",
          }}
        />
      )}
    </div>
  );
}
