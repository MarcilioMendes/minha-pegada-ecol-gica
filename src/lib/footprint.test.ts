import { describe, it, expect } from "vitest";
import { computeEcological, ecologicalGha, formatTerras, aggregateClass, shareableClass, GHA_PER_T_CO2, BASE_GHA, BIOCAP_MUNDIAL, PEGADA_BRASIL, TERRAS_BRASIL, TERRAS_MUNDO } from "./footprint";
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
  it("Ana: ≈ 1,41 gha e ≈ 0,85 Terra", () => {
    const r = computeEcological(ana);
    expect(r.gha).toBeCloseTo(1.41, 2);
    expect(r.planets).toBeCloseTo(0.85, 2);
  });
  it("Dia da Sobrecarga 2024: Brasil ≈ 1,69 Terra, mundo ≈ 1,71, biocapacidade ≈ 1,66 gha", () => {
    expect(TERRAS_BRASIL).toBeCloseTo(1.69, 2);
    expect(TERRAS_MUNDO).toBeCloseTo(1.71, 2);
    expect(BIOCAP_MUNDIAL).toBeCloseTo(1.66, 2);
    expect(PEGADA_BRASIL / BIOCAP_MUNDIAL).toBeCloseTo(TERRAS_BRASIL, 10);
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

describe("maior, menor e média possíveis (todas as 4^21 combinações)", () => {
  // Dentro de cada grupo as respostas se multiplicam (moradores dividem os gastos da casa, o
  // desperdício multiplica a comida, distância × meio de transporte, tempo × aquecimento do banho);
  // entre grupos a pegada só soma. Assim o máximo, o mínimo e a média saem exatos, grupo a grupo.
  const GROUPS = [["q0", "q8", "q11", "q12", "q13"], ["q1", "q2", "q3", "q4", "q6"], ["q7", "q7b"], ["q10", "q10b"], ["q9"], ["q14"], ["q15"], ["q16"], ["q17"]];
  const FORA = ["q5", "q18"]; // debate e resíduos: não entram na pegada ecológica
  const zero = allC(0);
  const combos = (ids: string[]) => ids.reduce<Record<string, number>[]>((acc, id) => acc.flatMap((c) => [0, 1, 2, 3].map((o) => ({ ...c, [id]: o }))), [{}]);
  const f0 = ecologicalGha(zero);
  const parts = GROUPS.map((g) => combos(g).map((c) => ({ c, d: ecologicalGha({ ...zero, ...c }) - f0 })));
  const best = (better: (x: number, y: number) => boolean) => Object.assign({}, zero, ...parts.map((p) => p.reduce((b, x) => (better(x.d, b.d) ? x : b)).c));
  const max = best((x, y) => x > y), min = best((x, y) => x < y);
  const mean = f0 + parts.reduce((s, p) => s + p.reduce((t, x) => t + x.d, 0) / p.length, 0);

  it("os grupos cobrem todas as perguntas, e as de fora não mexem na pegada", () => {
    expect([...GROUPS.flat(), ...FORA].sort()).toEqual(CARBON_QUESTIONS.map((q) => q.id).sort());
    for (const id of FORA) for (const o of [1, 2, 3]) expect(ecologicalGha({ ...ana, [id]: o })).toBe(ecologicalGha(ana));
  });
  it("a pegada é a soma das partes de cada grupo", () => {
    const bySum = (a: Record<string, number>) => f0 + GROUPS.reduce((s, g) => s + ecologicalGha({ ...zero, ...Object.fromEntries(g.map((id) => [id, a[id]!])) }) - f0, 0);
    for (const a of [ana, allC(1), allC(2), allC(3), max, min]) expect(ecologicalGha(a)).toBeCloseTo(bySum(a), 3);
  });
  it("maior: 4,92 gha e 2,96 Terras (tudo D, mas 1 a 2 moradores e banho a gás)", () => {
    expect(max).toMatchObject({ ...allC(3), q0: 0, q10b: 1, q5: expect.any(Number), q18: expect.any(Number) });
    expect(computeEcological(max)).toMatchObject({ gha: 4.92, planets: 2.96 });
    expect(computeEcological(allC(3)).gha).toBeLessThan(computeEcological(max).gha);
  });
  it("menor: 1,02 gha e 0,61 Terra (tudo A, mas 5 ou mais moradores e banho frio)", () => {
    expect(computeEcological(min)).toMatchObject({ gha: 1.02, planets: 0.61 });
    expect(computeEcological({ ...zero, q0: 3, q10b: 3 }).gha).toBe(1.02);
    expect(computeEcological(zero).gha).toBeGreaterThan(computeEcological(min).gha);
  });
  it("média de todas as combinações: 2,25 gha e 1,35 Terra", () => {
    expect(mean).toBeCloseTo(2.25, 2);
    expect(mean / BIOCAP_MUNDIAL).toBeCloseTo(1.35, 2);
  });
  it("Ana e a média do Brasil ficam entre o menor e o maior", () => {
    for (const g of [ecologicalGha(ana), PEGADA_BRASIL]) {
      expect(g).toBeGreaterThan(ecologicalGha(min));
      expect(g).toBeLessThan(ecologicalGha(max));
    }
  });
});

describe("formatTerras", () => {
  it("usa vírgula e singular abaixo de 2", () => expect(formatTerras(0.85)).toBe("0,9 Terra"));
  it("usa plural a partir de 2", () => expect(formatTerras(2.63)).toBe("2,6 Terras"));
  it("o plural segue o número arredondado da tela", () => expect(formatTerras(1.97)).toBe("2,0 Terras"));
  it("aceita mais casas", () => expect(formatTerras(1.6871, 2)).toBe("1,69 Terra"));
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
