import { describe, it, expect } from "vitest";
import { csvCell } from "./csv";

describe("csvCell", () => {
  it("coloca entre aspas e duplica aspas internas", () => expect(csvCell('diz "oi"')).toBe('"diz ""oi"""'));
  it("vazio para null e undefined", () => {
    expect(csvCell(null)).toBe('""');
    expect(csvCell(undefined)).toBe('""');
  });
  it.each(["=1+1", "+1", "-1", "@SUM(A1)", "\t=1"])("neutraliza fórmula: %j", (v) => expect(csvCell(v)).toBe(`"'${v}"`));
  it("mantém número com vírgula", () => expect(csvCell("2623,4")).toBe('"2623,4"'));
});
