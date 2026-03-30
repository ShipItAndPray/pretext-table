import React from "react";
import { TableCell } from "./TableCell";
import type { Column, VirtualRange } from "../types";

interface TableBodyProps<T> {
  data: T[];
  columns: Column<T>[];
  columnWidths: number[];
  rowHeights: number[];
  range: VirtualRange;
  totalHeight: number;
  onRowClick?: (row: T, index: number) => void;
}

export function TableBody<T>({
  data,
  columns,
  columnWidths,
  rowHeights,
  range,
  totalHeight,
  onRowClick,
}: TableBodyProps<T>) {
  const { startIndex, endIndex, offsetY } = range;
  const visibleRows = data.slice(startIndex, endIndex);

  return (
    <div
      role="rowgroup"
      className="pretext-table-body"
      style={{
        height: totalHeight,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: offsetY,
          left: 0,
          right: 0,
        }}
      >
        {visibleRows.map((row, i) => {
          const actualIndex = startIndex + i;
          const rowHeight = rowHeights[actualIndex];
          return (
            <div
              key={actualIndex}
              role="row"
              className="pretext-table-row"
              onClick={onRowClick ? () => onRowClick(row, actualIndex) : undefined}
              style={{
                display: "flex",
                height: rowHeight,
                borderBottom: "1px solid #e9ecef",
                cursor: onRowClick ? "pointer" : "default",
              }}
            >
              {columns.map((col, ci) => (
                <TableCell
                  key={col.key}
                  width={columnWidths[ci]}
                  height={rowHeight}
                >
                  {col.render
                    ? col.render(row[col.key], row)
                    : row[col.key] == null
                      ? ""
                      : String(row[col.key])}
                </TableCell>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
