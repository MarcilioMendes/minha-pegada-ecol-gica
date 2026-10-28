import { describe, it, expect } from "vitest";
import { computeFootprint, QUESTIONS } from "./footprint";

const all = (v: number) => Object.fromEntries(QUESTIONS.map((q) => [q.id, v]));

describe("computeFootprint", () => {
  it("hábitos de menor impacto resultam em 0.6 Terra", () => {
    expect(computeFootprint(all(0)).planets).toBe(0.6);
  });
  it("hábitos de maior impacto resultam em 4 Terras", () => {
    expect(computeFootprint(all(3)).planets).toBe(4);
  });
});
