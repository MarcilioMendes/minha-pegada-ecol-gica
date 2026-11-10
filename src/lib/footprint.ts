import { computeCarbon, FOOD_TABLES, STAGE_LABEL, type CarbonBreakdown, type Stage } from "./carbon";
// Pontuação determinística da Pegada Ecológica (a pegada de carbono fica em carbon.ts).

export const PERCEPTION_QUESTIONS = [
  "Escreva alguma coisa que está acontecendo com o meio ambiente e que você acha importante ou preocupante.",
  "Explique, com suas palavras, o que acontece nessa situação.",
  "Na sua opinião, quem ou o que faz isso acontecer?",
  "O que faria isso diminuir?",
  "Tem alguma coisa no seu dia a dia que tem relação com isso? Se sim, o quê?",
];

// ---------------------------------------------------------------------------
// Pegada ecológica a partir das respostas da calculadora de carbono.
// Método híbrido da Global Footprint Network ("Methodology for Calculating the
// Ecological Footprint of California", 2013, Apêndice B):
//  - carbono (Eq. 14): só CO₂ fóssil vira área de floresta para absorvê-lo;
//  - cultivo/pastagem (Eq. 1, produtividade média mundial ⇒ YF = 1): área × EQF;
//  - base compartilhada (§2.1.2.7): governo + formação de capital, igual para todos.
// ---------------------------------------------------------------------------

export type Area = "cultivo" | "pastagem" | "pesca" | "floresta" | "construida" | "carbono";
export const AREA_LABEL: Record<Area, string> = {
  cultivo: "Área de cultivo", pastagem: "Pastagem", pesca: "Pesca",
  floresta: "Produtos florestais", construida: "Área construída", carbono: "Absorção de carbono",
};

// Fatores de equivalência (gha/ha), Tabela B do PDF (dados de 2008).
const EQF = { cultivo: 2.51, pastagem: 0.46, floresta: 1.26 } as const;

// Carbono → gha (Eq. 14). S_ocean e Y_C das edições recentes da GFN; o EQF acima é de 2008
// (misturar as edições dá um erro de ~2%, aceitável para uso didático).
const S_OCEAN = 0.28;               // fração do CO₂ absorvida pelos oceanos
const Y_C = 0.73 * (44 / 12);       // 0,73 t C/ha/ano = 2,68 t CO₂/ha/ano absorvidos por floresta média
export const GHA_PER_T_CO2 = ((1 - S_OCEAN) / Y_C) * EQF.floresta; // ≈ 0,339 gha por t CO₂

// Alimentação — Poore & Nemecek (2018), m²·ano por kg (via Our World in Data).
// As tabelas de carne (q1, q2) do documento norteador são: dias/semana × 100 g × 52 semanas × fator.
const MEAT_KG: [number, number, number, number] = [0.5, 2.5, 4.5, 10.5].map((d) => d * 0.1 * 52) as [number, number, number, number];
const BEEF_M2 = { cultivo: 16.3, pastagem: 309.9 };   // rebanho de corte
const POULTRY_M2 = { cultivo: 12.1, pastagem: 0.1 };  // q2 usa fator ≈ 10 kg CO₂e/kg, o de frango
// Laticínios: leite e queijo têm área por kg CO₂e parecida; usamos a do leite (8,9 m²/kg ÷ 3,15 kg CO₂e/kg).
const DAIRY_M2_PER_KG_CO2E = { cultivo: 4.2 / 3.15, pastagem: 4.7 / 3.15 };
// Base de 400 kg CO₂e (arroz, feijão, vegetais): estimativa entre trigo (≈1,7) e arroz (≈0,6).
const BASE_DIET_M2_PER_KG_CO2E = 1.5;

// Referências por pessoa. Relatório Anual WWF-Brasil 2024 (p. 60–61): o Dia da Sobrecarga da Terra
// caiu em 1º de agosto no mundo (dia 214 de 366) e em 4 de agosto no Brasil (dia 217).
// Terras = dias do ano ÷ dia da sobrecarga (estimativa nossa; o relatório não traz gha).
export const TERRAS_BRASIL = 366 / 217; // ≈ 1,69
export const TERRAS_MUNDO = 366 / 214;  // ≈ 1,71
// Pegada média do Brasil em gha: GFN, dados de 2017 ("Ecobytes: Beef and Brazil's declining biocapacity", 2021).
export const PEGADA_BRASIL = 2.8;
// Biocapacidade tirada da razão de 2024, para que a média do Brasil dê TERRAS_BRASIL: ≈ 1,66 gha.
export const BIOCAP_MUNDIAL = PEGADA_BRASIL / TERRAS_BRASIL;
export const PEGADA_MUNDIAL = TERRAS_MUNDO * BIOCAP_MUNDIAL; // ≈ 2,84 gha

// Base compartilhada: governo (0,47) + formação de capital (1,23) = 1,70 de 6,18 gha (27,5%)
// no CLUM da Califórnia (Tabela 1), aplicado à pegada média do Brasil.
export const BASE_SHARE = 1.7 / 6.18;
export const BASE_GHA = Math.round(BASE_SHARE * PEGADA_BRASIL * 100) / 100; // ≈ 0,77
// Divisão da base entre as áreas, na proporção de governo + capital do mesmo CLUM.
const BASE_SPLIT: Record<Area, number> = { cultivo: 0.13, pastagem: 0.02, pesca: 0, floresta: 0.41, construida: 0.03, carbono: 1.12 };

export type EcoResult = {
  gha: number;
  planets: number;
  byArea: Record<Area, number>;
  byStage: Record<Stage | "base", number>;
};

const r2 = (x: number) => Math.round(x * 100) / 100;

export function computeEcological(a: Record<string, number>): EcoResult {
  const pick = <T,>(id: string, t: readonly T[]): T => t[a[id] ?? 0] ?? t[0]!;
  const waste = pick("q6", FOOD_TABLES.q6);
  const { breakdown } = computeCarbon(a);

  // Alimentação: área (m²) de cultivo e pastagem, × desperdício.
  const beef = pick("q1", MEAT_KG), poultry = pick("q2", MEAT_KG), dairy = pick("q3", FOOD_TABLES.q3);
  const cropM2 = (beef * BEEF_M2.cultivo + poultry * POULTRY_M2.cultivo + dairy * DAIRY_M2_PER_KG_CO2E.cultivo
    + FOOD_TABLES.base * BASE_DIET_M2_PER_KG_CO2E) * waste;
  const pastM2 = (beef * BEEF_M2.pastagem + poultry * POULTRY_M2.pastagem + dairy * DAIRY_M2_PER_KG_CO2E.pastagem) * waste;
  const foodCrop = (cropM2 / 10_000) * EQF.cultivo;
  const foodPast = (pastM2 / 10_000) * EQF.pastagem;

  // Carbono fóssil (kg CO₂e → gha). Ultraprocessados contam como carbono (fábrica e embalagem).
  // Resíduos (metano) e o metano/N₂O da comida ficam fora: a GFN só contabiliza CO₂.
  const c = (kg: number) => (kg / 1000) * GHA_PER_T_CO2;
  const ultra = c(pick("q4", FOOD_TABLES.q4) * waste);
  const stagesC = { transporte: c(breakdown.transporte), aviacao: c(breakdown.aviacao), energia: c(breakdown.energia), consumo: c(breakdown.consumo) };
  const fossil = ultra + stagesC.transporte + stagesC.aviacao + stagesC.energia + stagesC.consumo;

  const splitSum = Object.values(BASE_SPLIT).reduce((s, v) => s + v, 0);
  const base = (k: Area) => (BASE_SPLIT[k] / splitSum) * BASE_GHA;
  const byAreaRaw: Record<Area, number> = {
    cultivo: foodCrop + base("cultivo"), pastagem: foodPast + base("pastagem"), pesca: base("pesca"),
    floresta: base("floresta"), construida: base("construida"), carbono: fossil + base("carbono"),
  };
  const byStageRaw: Record<Stage | "base", number> = {
    alimentacao: foodCrop + foodPast + ultra, transporte: stagesC.transporte, aviacao: stagesC.aviacao,
    energia: stagesC.energia, consumo: stagesC.consumo, residuos: 0, base: BASE_GHA,
  };
  const gha = Object.values(byAreaRaw).reduce((s, v) => s + v, 0);
  const round = <K extends string>(o: Record<K, number>) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, r2(v as number)])) as Record<K, number>;
  return { gha: r2(gha), planets: r2(gha / BIOCAP_MUNDIAL), byArea: round(byAreaRaw), byStage: round(byStageRaw) };
}

export type ClassRow = { total: number; breakdown: CarbonBreakdown; answers: Record<string, number> };
export type ClassAggregate = {
  k: number;
  sum: number;
  avg: number;
  avgStages: CarbonBreakdown;
  avgGha: number;
  avgPlanets: number;
  avgAreas: Record<Area, number>;
};

// Com 1 ou 2 respostas, as médias revelariam o resultado de um colega (2 × média − o próprio).
export const MIN_CLASS_K = 3;
/** O que o aluno pode ver da turma: abaixo do mínimo de respostas, volta o agregado vazio. */
export const shareableClass = (c: ClassAggregate): ClassAggregate => (c.k >= MIN_CLASS_K ? c : aggregateClass([]));

/** Agregado da turma: só somas e médias, nunca o resultado individual de um colega. */
export function aggregateClass(rows: ClassRow[]): ClassAggregate {
  const k = rows.length;
  const ecos = rows.map((r) => computeEcological(r.answers));
  const mean = (v: number[]) => (k ? v.reduce((s, x) => s + x, 0) / k : 0);
  const sum = rows.reduce((s, r) => s + r.total, 0);
  const avgStages = Object.fromEntries((Object.keys(STAGE_LABEL) as Stage[]).map((s) => [s, mean(rows.map((r) => r.breakdown[s]))])) as CarbonBreakdown;
  const avgAreas = Object.fromEntries((Object.keys(AREA_LABEL) as Area[]).map((a) => [a, mean(ecos.map((e) => e.byArea[a]))])) as Record<Area, number>;
  return { k, sum, avg: mean(rows.map((r) => r.total)), avgStages, avgGha: mean(ecos.map((e) => e.gha)), avgPlanets: mean(ecos.map((e) => e.planets)), avgAreas };
}
