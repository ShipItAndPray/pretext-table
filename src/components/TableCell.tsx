import React from "react";

interface TableCellProps {
  width: number;
  height: number;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const TableCell: React.FC<TableCellProps> = ({
  width,
  height,
  children,
  className,
  onClick,
}) => {
  return (
    <div
      role="cell"
      className={`pretext-table-cell${className ? ` ${className}` : ""}`}
      onClick={onClick}
      style={{
        width,
        minWidth: width,
        maxWidth: width,
        height,
        padding: "0 16px",
        boxSizing: "border-box",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "flex",
        alignItems: "center",
      }}
    >
      {children}
    </div>
  );
};
