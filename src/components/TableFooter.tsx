import React from "react";

interface TableFooterProps {
  totalRows: number;
  visibleStart: number;
  visibleEnd: number;
}

export const TableFooter: React.FC<TableFooterProps> = ({
  totalRows,
  visibleStart,
  visibleEnd,
}) => {
  return (
    <div
      className="pretext-table-footer"
      style={{
        padding: "8px 16px",
        borderTop: "1px solid #dee2e6",
        backgroundColor: "#f8f9fa",
        fontSize: "12px",
        color: "#6c757d",
      }}
    >
      Showing {visibleStart + 1}–{Math.min(visibleEnd, totalRows)} of {totalRows.toLocaleString()} rows
    </div>
  );
};
