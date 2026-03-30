import type { SortDirection } from "../types";

/**
 * Sort data array by a given key and direction.
 * Returns a new sorted array (does not mutate the original).
 *
 * Handles: strings (locale-aware), numbers, dates, nulls (sorted last).
 */
export function sortData<T>(
  data: T[],
  key: keyof T & string,
  direction: SortDirection,
): T[] {
  const sorted = [...data];
  const dir = direction === "asc" ? 1 : -1;

  sorted.sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    // Nulls always last
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    if (typeof aVal === "number" && typeof bVal === "number") {
      return (aVal - bVal) * dir;
    }

    if (aVal instanceof Date && bVal instanceof Date) {
      return (aVal.getTime() - bVal.getTime()) * dir;
    }

    const aStr = String(aVal);
    const bStr = String(bVal);
    return aStr.localeCompare(bStr) * dir;
  });

  return sorted;
}
