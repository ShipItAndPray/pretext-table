import { describe, it, expect } from "vitest";
import { sortData } from "../src/utils/sorter";

interface TestRow {
  id: number;
  name: string;
  score: number | null;
}

const data: TestRow[] = [
  { id: 3, name: "Charlie", score: 85 },
  { id: 1, name: "Alice", score: 92 },
  { id: 2, name: "Bob", score: null },
  { id: 4, name: "Diana", score: 78 },
];

describe("sortData", () => {
  it("sorts numbers ascending", () => {
    const sorted = sortData(data, "id", "asc");
    expect(sorted.map((r) => r.id)).toEqual([1, 2, 3, 4]);
  });

  it("sorts numbers descending", () => {
    const sorted = sortData(data, "id", "desc");
    expect(sorted.map((r) => r.id)).toEqual([4, 3, 2, 1]);
  });

  it("sorts strings ascending", () => {
    const sorted = sortData(data, "name", "asc");
    expect(sorted.map((r) => r.name)).toEqual(["Alice", "Bob", "Charlie", "Diana"]);
  });

  it("sorts strings descending", () => {
    const sorted = sortData(data, "name", "desc");
    expect(sorted.map((r) => r.name)).toEqual(["Diana", "Charlie", "Bob", "Alice"]);
  });

  it("pushes nulls to the end regardless of direction", () => {
    const asc = sortData(data, "score", "asc");
    expect(asc[asc.length - 1].score).toBeNull();

    const desc = sortData(data, "score", "desc");
    expect(desc[desc.length - 1].score).toBeNull();
  });

  it("does not mutate the original array", () => {
    const original = [...data];
    sortData(data, "id", "asc");
    expect(data).toEqual(original);
  });

  it("handles empty array", () => {
    const sorted = sortData([], "id", "asc");
    expect(sorted).toEqual([]);
  });
});
