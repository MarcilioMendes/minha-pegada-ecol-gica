import { describe, it, expect } from "vitest";
import { computeCarbon, timeEquivalent, CELEBS, celebRate, duration, durationText, carEquivalent } from "./carbon";

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

const ev = (c: string, e: string) => CELEBS.find((x) => x.id === c)!.eventos.find((x) => x.id === e)!;

describe("celebridades", () => {
  it("Taylor Swift: 8.293.540 kg ÷ 200 dias", () => expect(celebRate(ev("taylor", "y"))).toBeCloseTo(41467.7, 1));
  it("Virginia com 4 bate-voltas por mês", () => expect(celebRate(ev("virginia", "bv"))).toBeCloseTo((6249.6 * 4 * 12) / 365, 5));
  it("frequência informada substitui a sugerida", () => expect(celebRate(ev("virginia", "bv"), 1)).toBeCloseTo((6249.6 * 12) / 365, 5));
  it("0 viagens por mês → sem ritmo", () => expect(celebRate(ev("neymar", "heli"), 0)).toBeNull());
  it("Neymar no Boeing 747 (viagem única) → sem ritmo", () => expect(celebRate(ev("neymar", "b747"))).toBeNull());
  it("Ana leva ≈ 2,4 anos para emitir o bate-volta da Virginia", () => expect(durationText(6249.6 / (2623.4 / 365))).toBe("2,4 anos"));
  it("Ana: 1 dia da Taylor Swift ≈ 16 anos (≥ 10 sem decimal)", () => expect(durationText(41467.7 / (2623.4 / 365))).toBe("16 anos"));
});

describe("duration", () => {
  it("menos de 1 segundo", () => expect(duration(0.5 / 86400)).toEqual({ v: "menos de 1", u: "segundo" }));
  it("segundos", () => expect(durationText(30 / 86400)).toBe("30 segundos"));
  it("minutos", () => expect(durationText(5 / 1440)).toBe("5,0 minutos"));
  it("horas", () => expect(durationText(3 / 24)).toBe("3,0 horas"));
  it("dias", () => expect(durationText(45)).toBe("45 dias"));
  it("anos", () => expect(durationText(365 * 12)).toBe("12 anos"));
});

describe("carEquivalent", () => {
  it("Ana ≈ 20.200 km de carro", () => expect(carEquivalent(2623.4).km).toBe(20200));
});
