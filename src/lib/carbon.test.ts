import { describe, it, expect } from "vitest";
import { computeCarbon, timeEquivalent } from "./carbon";

// Exemplo resolvido da "Ana" no documento norteador.
const ana: Record<string, number> = {
  q0: 2, q1: 1, q2: 1, q3: 1, q4: 1, q5: 1, q6: 1, q7: 1, q7b: 1, q8: 1, q9: 0,
  q10: 1, q10b: 0, q11: 1, q12: 2, q13: 1, q14: 1, q15: 1, q16: 1, q17: 1, q18: 1,
};

describe("computeCarbon", () => {
  it("Ana: alimentação 2.120 kg", () => expect(computeCarbon(ana).breakdown.alimentacao).toBe(2120));
  it("Ana: transporte 113 kg", () => expect(computeCarbon(ana).breakdown.transporte).toBe(113));
  it("Ana: energia ≈130,4 kg", () => expect(computeCarbon(ana).breakdown.energia).toBeCloseTo(130.4, 0));
  it("Ana: total ≈2.623 kg", () => expect(computeCarbon(ana).total).toBeCloseTo(2623.4, 0));
  it("Ana × Taylor Swift ≈3.161 anos", () => expect(timeEquivalent(8_293_540, 2623.4)).toBe("3.161 anos"));
  it("menos de 1 ano vira dias", () => expect(timeEquivalent(620, 2623.4)).toBe("86,3 dias"));
});
