import { computeCarbon, FOOD_TABLES, STAGE_LABEL, type CarbonBreakdown, type Stage } from "./carbon";
// Cálculo determinístico da Pegada Ecológica (modelo didático simplificado).
export type Category = "alimentacao" | "transporte" | "energia" | "consumo";

export const CATEGORY_LABEL: Record<Category, string> = {
  alimentacao: "Alimentação",
  transporte: "Transporte",
  energia: "Energia/Água",
  consumo: "Consumo/Resíduos",
};

export type Question = {
  id: string;
  category: Category;
  emoji: string;
  text: string;
  options: { label: string; score: number }[]; // score 0 (baixo impacto) .. 3 (alto)
};

export const QUESTIONS: Question[] = [
  { id: "q1", category: "alimentacao", emoji: "🍗", text: "Com que frequência você come carne (bovina/frango) durante a semana?", options: [
    { label: "Quase nunca (0–1 dia)", score: 0 }, { label: "Alguns dias (2–3 dias)", score: 1 }, { label: "Na maioria dos dias (4–5)", score: 2 }, { label: "Todos os dias, em várias refeições", score: 3 } ] },
  { id: "q2", category: "alimentacao", emoji: "🍽️", text: "Como costuma ser o desperdício de comida no seu prato?", options: [
    { label: "Como tudo, quase nunca sobra", score: 0 }, { label: "Às vezes sobra um pouco", score: 1 }, { label: "Sobra com frequência", score: 2 }, { label: "Jogo bastante comida fora", score: 3 } ] },
  { id: "q3", category: "alimentacao", emoji: "🍟", text: "Quanto da sua alimentação vem de ultraprocessados (salgadinhos, refrigerantes, biscoitos)?", options: [
    { label: "Quase nada", score: 0 }, { label: "Um pouco", score: 1 }, { label: "Metade", score: 2 }, { label: "A maior parte", score: 3 } ] },
  { id: "q4", category: "transporte", emoji: "🚲", text: "Como você costuma ir para a escola ou passear no dia a dia?", options: [
    { label: "A pé ou de bicicleta", score: 0 }, { label: "Transporte público / van escolar", score: 1 }, { label: "Carona com outras pessoas", score: 2 }, { label: "Carro próprio da família", score: 3 } ] },
  { id: "q5", category: "energia", emoji: "🚿", text: "Quanto tempo dura o seu banho diário em média?", options: [
    { label: "Até 5 minutos", score: 0 }, { label: "5 a 10 minutos", score: 1 }, { label: "10 a 20 minutos", score: 2 }, { label: "Mais de 20 minutos", score: 3 } ] },
  { id: "q6", category: "energia", emoji: "💡", text: "Vocês costumam deixar luzes acesas ou aparelhos na tomada sem ninguém usando?", options: [
    { label: "Nunca", score: 0 }, { label: "Raramente", score: 1 }, { label: "Às vezes", score: 2 }, { label: "Sempre", score: 3 } ] },
  { id: "q7", category: "energia", emoji: "❄️", text: "Na sua casa usam ar-condicionado ou ventilador com frequência?", options: [
    { label: "Quase nunca", score: 0 }, { label: "Só ventilador, quando está quente", score: 1 }, { label: "Ar-condicionado às vezes", score: 2 }, { label: "Ar-condicionado todo dia", score: 3 } ] },
  { id: "q8", category: "consumo", emoji: "👟", text: "Com que frequência você compra ou ganha roupas/calçados novos sem necessidade urgente?", options: [
    { label: "Quase nunca", score: 0 }, { label: "Algumas vezes por ano", score: 1 }, { label: "Todo mês", score: 2 }, { label: "Várias vezes por mês", score: 3 } ] },
  { id: "q9", category: "consumo", emoji: "🔧", text: "O que acontece quando um aparelho eletrônico ou brinquedo estraga?", options: [
    { label: "Tentamos consertar sempre", score: 0 }, { label: "Às vezes consertamos", score: 1 }, { label: "Geralmente compramos outro", score: 2 }, { label: "Compramos outro novo na hora", score: 3 } ] },
  { id: "q10", category: "consumo", emoji: "♻️", text: "Na sua casa existe separação do lixo reciclável (papel, plástico, vidro)?", options: [
    { label: "Sim, sempre", score: 0 }, { label: "Às vezes", score: 1 }, { label: "Raramente", score: 2 }, { label: "Não separamos", score: 3 } ] },
];

export const PERCEPTION_QUESTIONS = [
  "Escreva alguma coisa que está acontecendo com o meio ambiente e que você acha importante ou preocupante.",
  "Explique, com suas palavras, o que acontece nessa situação.",
  "Na sua opinião, quem ou o que faz isso acontecer?",
  "O que faria isso diminuir?",
  "Tem alguma coisa no seu dia a dia que tem relação com isso? Se sim, o quê?",
];

// Pesos de cada categoria (em "Terras") quando o impacto é máximo.
// Base mínima de 0.6 Terra (infraestrutura compartilhada) + até 3.4 pelos hábitos.
const BASE = 0.6;
const CATEGORY_MAX: Record<Category, number> = { alimentacao: 1.1, transporte: 0.7, energia: 0.8, consumo: 0.8 };

export type Breakdown = Record<Category, number>;

export function computeFootprint(answers: Record<string, number>): { planets: number; breakdown: Breakdown } {
  const breakdown: Breakdown = { alimentacao: 0, transporte: 0, energia: 0, consumo: 0 };
  (Object.keys(CATEGORY_MAX) as Category[]).forEach((cat) => {
    const qs = QUESTIONS.filter((q) => q.category === cat);
    const sum = qs.reduce((s, q) => s + (answers[q.id] ?? 0), 0);
    const ratio = sum / (qs.length * 3);
    breakdown[cat] = Math.round((BASE / 4 + ratio * CATEGORY_MAX[cat]) * 100) / 100;
  });
  const planets = Math.round(Object.values(breakdown).reduce((a, b) => a + b, 0) * 10) / 10;
  return { planets, breakdown };
}

export function topCategory(b: Breakdown): Category {
  return (Object.keys(b) as Category[]).reduce((a, c) => (b[c] > b[a] ? c : a));
}

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

// Referências por pessoa (gha). ⚠️ Confirmar numa mesma edição do Ecological Footprint Explorer da GFN.
export const BIOCAP_MUNDIAL = 1.5;
export const PEGADA_BRASIL = 2.8;
export const PEGADA_MUNDIAL = 2.5;

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
