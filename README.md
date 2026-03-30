# @shipitandpray/pretext-table

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://shipitandpray.github.io/pretext-table/) [![GitHub](https://img.shields.io/github/stars/ShipItAndPray/pretext-table?style=social)](https://github.com/ShipItAndPray/pretext-table)

> **[View Live Demo](https://shipitandpray.github.io/pretext-table/)**

Virtualized data table that auto-sizes columns and measures row heights using [@chenglou/pretext](https://github.com/chenglou/pretext) — no DOM measurement, no layout shift, handles 1M+ rows.

## The Problem

Every table library (AG Grid, TanStack Table) measures column widths by rendering text to the DOM, causing reflow. Pretext measures text dimensions with pure arithmetic. This table knows exact column widths and row heights **before rendering a single DOM node**.

## Install

```bash
npm install @shipitandpray/pretext-table
```

Peer dependencies:

```bash
npm install react @chenglou/pretext
```

## Usage

```tsx
import { PretextTable } from "@shipitandpray/pretext-table";
import type { Column } from "@shipitandpray/pretext-table";

interface Employee {
  id: number;
  name: string;
  department: string;
  salary: number;
}

const columns: Column<Employee>[] = [
  { key: "id", header: "ID", width: 70 },
  { key: "name", header: "Name", minWidth: 120 },
  { key: "department", header: "Department" },
  {
    key: "salary",
    header: "Salary",
    render: (val) => `$${val.toLocaleString()}`,
  },
];

function App() {
  return (
    <PretextTable
      data={employees}
      columns={columns}
      height={600}
      onSort={(key, dir) => console.log(`Sort: ${key} ${dir}`)}
      onRowClick={(row) => console.log("Clicked:", row)}
    />
  );
}
```

## Column Auto-Sizing Algorithm

1. Sample up to `sampleSize` rows (evenly distributed, not just first N)
2. For each column, measure header text and sampled cell values using `prepare()` + `layout()`
3. Column width = max(headerWidth, max(cellWidths)) + padding
4. If total > containerWidth, proportionally shrink (respecting `minWidth`)
5. If total < containerWidth, distribute remaining space to resizable columns

This runs **once** on mount/data change. ~0.09ms per measurement x 100 samples x 10 columns = ~90ms. Then **zero measurement during scroll**.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | required | Array of row objects |
| `columns` | `Column<T>[]` | required | Column definitions |
| `height` | `number` | required | Viewport height in pixels |
| `font` | `string` | `'14px Inter, sans-serif'` | Cell font for measurement |
| `headerFont` | `string` | `'bold 14px Inter, sans-serif'` | Header font for measurement |
| `lineHeight` | `number` | `20` | Line height in pixels |
| `rowPadding` | `number` | `12` | Vertical padding per row |
| `sampleSize` | `number` | `100` | Rows to sample for auto-width |
| `overscan` | `number` | `5` | Extra rows to render above/below viewport |
| `onSort` | `(key, dir) => void` | — | Sort callback |
| `onRowClick` | `(row, index) => void` | — | Row click callback |
| `className` | `string` | — | CSS class for container |

## Column Definition

```ts
interface Column<T> {
  key: keyof T & string;
  header: string;
  width?: number;      // fixed width (overrides auto-sizing)
  minWidth?: number;    // default: 50
  maxWidth?: number;    // default: 500
  resizable?: boolean;  // default: true
  sortable?: boolean;   // default: true
  render?: (value: any, row: T) => React.ReactNode;
}
```

## AG Grid Comparison

| Feature | AG Grid | Pretext Table |
|---------|---------|---------------|
| Column auto-size | DOM measurement (reflow) | Pretext arithmetic (no reflow) |
| Bundle size | ~300KB min | ~5KB + pretext peer |
| Layout shift | Visible on first render | Zero — widths known before render |
| 1M row virtualization | Yes (complex config) | Yes (built-in) |
| License | Enterprise $$ | MIT |
| Row height calculation | DOM measurement | Pretext `layout()` |
| Dependencies | Many | 2 peer deps (React + Pretext) |

## Performance Targets

| Metric | Target |
|--------|--------|
| Column auto-size (10 cols, 100 samples) | < 100ms |
| Scroll FPS (1M rows) | 120fps |
| Sort (100K rows) | < 500ms |
| Resize column | < 16ms re-render |

## Exported Utilities

The package also exports individual hooks and utilities for custom compositions:

```ts
import {
  useColumnWidths,
  useRowHeights,
  useVirtualRows,
  calculateColumnWidths,
  measureSingleLineWidth,
  sortData,
  buildOffsets,
} from "@shipitandpray/pretext-table";
```

## Demo

Open `index.html` in a browser to see a working demo with 10,000 rows, resizable columns, and sorting.

## License

MIT
