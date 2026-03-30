import type { ReactNode } from "react";

export interface Column<T> {
  key: keyof T & string;
  header: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  sortable?: boolean;
  render?: (value: any, row: T) => ReactNode;
}

export type SortDirection = "asc" | "desc";

export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface PretextTableProps<T> {
  data: T[];
  columns: Column<T>[];
  height: number;
  font?: string;
  headerFont?: string;
  lineHeight?: number;
  rowPadding?: number;
  sampleSize?: number;
  overscan?: number;
  onSort?: (key: string, direction: SortDirection) => void;
  onRowClick?: (row: T, index: number) => void;
  className?: string;
}

export interface VirtualRange {
  startIndex: number;
  endIndex: number;
  offsetY: number;
}
