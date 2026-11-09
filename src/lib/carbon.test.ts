import { describe, it, expect } from "vitest";
import { computeCarbon, timeEquivalent, BRASIL, SEEG, CELEBS, celebRate, duration, durationText, carEquivalent, whoCompares, compareCeleb, explainCarbon } from "./carbon";

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

describe("SEEG", () => {
  it("os valores por habitante vêm dos totais", () => {
    const pc = (t: number) => Math.round((t / SEEG.pop) * 1000);
    expect(pc(SEEG.brutas)).toBe(BRASIL.bruto);
    expect(pc(-SEEG.remocoes)).toBe(BRASIL.remocoes);
    expect(SEEG.setores.map((s) => pc(s.t))).toEqual([BRASIL.usoTerra, BRASIL.agro, BRASIL.energia, BRASIL.residuos, BRASIL.industria]);
  });
});

describe("carEquivalent", () => {
  it("Ana ≈ 20.200 km de carro", () => expect(carEquivalent(2623.4).km).toBe(20200));
});

describe("compareCeleb", () => {
  const cls = { k: 2, sum: 5000, aviacaoAvg: 150 };
  const eu = whoCompares("eu", 2623.4, 0, cls);
  it("Virginia, bate-volta, Eu, registrado: mesmo tempo do modelo", () => {
    const r = compareCeleb("Virginia Fonseca", ev("virginia", "bv"), "total", undefined, eu, "eu");
    expect(r.kind).toBe("ok");
    if (r.kind === "ok") {
      expect(r.highlight).toBe("2,4 anos");
      expect(r.before).toBe("Você levaria ");
      expect(r.after).toContain("em um bate-volta de jatinho");
    }
  });
  it("Taylor Swift em 1 dia: 16 anos", () => {
    const r = compareCeleb("Taylor Swift", ev("taylor", "y"), 1, undefined, eu, "eu");
    expect(r.kind === "ok" && r.highlight).toBe("16 anos");
    expect(r.notes.join(" ")).toContain("41.468 kg por dia");
  });
  it("viagem única ignora o período escolhido", () => {
    const r = compareCeleb("Neymar", ev("neymar", "b747"), 365, undefined, eu, "eu");
    expect(r.kind === "ok" && r.after).toContain("Boeing 747");
    expect(r.notes[0]).toContain("Viagem única");
  });
  it("frequência 0 num período não tem emissão", () => {
    const r = compareCeleb("Neymar", ev("neymar", "heli"), 30.42, 0, eu, "eu");
    expect(r.kind).toBe("empty");
  });
  it("quem não voou recebe o cartão de 0 kg de avião", () => {
    const r = compareCeleb("Taylor Swift", ev("taylor", "y"), "total", undefined, eu, "eu");
    expect(r.kind === "ok" && r.cards.at(-1)!.a).toBe("0 kg de avião");
  });
  it("turma real usa a soma e a aviação total", () => {
    const t = whoCompares("turma", 2623.4, 0, cls);
    expect(t.perYear).toBe(5000);
    expect(t.aviacao).toBe(300);
  });
  it("turma imaginária multiplica por 30", () => {
    expect(whoCompares("como", 1000, 10, cls).perYear).toBe(30000);
  });
});

describe("explainCarbon", () => {
  it("mostra a conta da alimentação da Ana", () => {
    expect(explainCarbon(ana)[0]).toEqual({ stage: "alimentacao", formula: "(400 + 1.294 + 130 + 135 + 60) × 1,05 = 2.120,0 kg" });
  });
});
