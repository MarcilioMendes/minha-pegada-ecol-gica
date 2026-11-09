import { describe, it, expect } from "vitest";
import { computeEcological, aggregateClass, shareableClass, GHA_PER_T_CO2, BASE_GHA } from "./footprint";
import { CARBON_QUESTIONS, computeCarbon, topKey } from "./carbon";

// Exemplo resolvido da "Ana" (mesmo de carbon.test.ts).
const ana: Record<string, number> = {
  q0: 2, q1: 1, q2: 1, q3: 1, q4: 1, q5: 1, q6: 1, q7: 1, q7b: 1, q8: 1, q9: 0,
  q10: 1, q10b: 0, q11: 1, q12: 2, q13: 1, q14: 1, q15: 1, q16: 1, q17: 1, q18: 1,
};
const allC = (v: number) => Object.fromEntries(CARBON_QUESTIONS.map((q) => [q.id, v]));
const sum = (o: Record<string, number>) => Object.values(o).reduce((s, v) => s + v, 0);

describe("computeEcological", () => {
  it("1 t de CO₂ fóssil ≈ 0,339 gha (Eq. 14)", () => expect(GHA_PER_T_CO2).toBeCloseTo(0.339, 3));
  it("base compartilhada ≈ 0,77 gha", () => expect(BASE_GHA).toBe(0.77));
  it("Ana: ≈ 1,41 gha e ≈ 0,94 Terra", () => {
    const r = computeEcological(ana);
    expect(r.gha).toBeCloseTo(1.41, 2);
    expect(r.planets).toBeCloseTo(0.94, 2);
  });
  it("tudo A < tudo D", () => expect(computeEcological(allC(0)).gha).toBeLessThan(computeEcological(allC(3)).gha));
  it("soma por área = soma por etapa = gha", () => {
    const r = computeEcological(ana);
    expect(sum(r.byArea)).toBeCloseTo(r.gha, 1);
    expect(sum(r.byStage)).toBeCloseTo(r.gha, 1);
  });
  it("resíduos não mexem na área de carbono", () => {
    expect(computeEcological({ ...ana, q18: 3 }).byArea.carbono).toBe(computeEcological({ ...ana, q18: 0 }).byArea.carbono);
  });
  it("mais carne de boi aumenta a pastagem", () => {
    expect(computeEcological({ ...ana, q1: 3 }).byArea.pastagem).toBeGreaterThan(computeEcological(ana).byArea.pastagem);
  });
});

describe("aggregateClass", () => {
  const row = (a: Record<string, number>) => ({ ...computeCarbon(a), answers: a });
  it("turma vazia dá zeros", () => {
    const r = aggregateClass([]);
    expect([r.k, r.sum, r.avg, r.avgGha, r.avgPlanets, r.avgStages.alimentacao, r.avgAreas.carbono]).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });
  it("soma e tira a média de kg, etapas, gha, Terras e áreas", () => {
    const a = allC(0), d = allC(3);
    const r = aggregateClass([row(a), row(d)]);
    const [ea, ed] = [computeEcological(a), computeEcological(d)];
    expect(r.k).toBe(2);
    expect(r.sum).toBeCloseTo(computeCarbon(a).total + computeCarbon(d).total, 5);
    expect(r.avg).toBeCloseTo(r.sum / 2, 5);
    expect(r.avgStages.aviacao).toBeCloseTo((computeCarbon(a).breakdown.aviacao + computeCarbon(d).breakdown.aviacao) / 2, 5);
    expect(r.avgGha).toBeCloseTo((ea.gha + ed.gha) / 2, 5);
    expect(r.avgPlanets).toBeCloseTo((ea.planets + ed.planets) / 2, 5);
    expect(r.avgAreas.pastagem).toBeCloseTo((ea.byArea.pastagem + ed.byArea.pastagem) / 2, 5);
  });
});

describe("shareableClass", () => {
  const row = { ...computeCarbon(ana), answers: ana };
  it("esconde a turma com 1 ou 2 respostas", () => {
    expect(shareableClass(aggregateClass([row, row]))).toEqual(aggregateClass([]));
  });
  it("mostra a turma a partir de 3 respostas", () => {
    const c = aggregateClass([row, row, row]);
    expect(shareableClass(c)).toBe(c);
  });
});

describe("topKey", () => {
  it("devolve a chave de maior valor", () => expect(topKey({ a: 1, b: 3, c: 2 })).toBe("b"));
});
