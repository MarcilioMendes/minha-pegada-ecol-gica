// Calculadora de pegada de carbono (kg CO2e/ano) — adaptação didática da ISO 14067,
// conforme o documento norteador da turma. Cada resposta é o índice da alternativa (0=A .. 3=D).
export type Stage = "alimentacao" | "transporte" | "aviacao" | "energia" | "consumo" | "residuos";
export const STAGE_LABEL: Record<Stage, string> = {
  alimentacao: "Alimentação", transporte: "Transporte", aviacao: "Aviação",
  energia: "Energia em casa", consumo: "Consumo", residuos: "Resíduos",
};
export type CarbonBreakdown = Record<Stage, number>;

export type CQuestion = { id: string; emoji: string; stage: Stage | "contexto"; text: string; options: string[]; note?: string };

export const CARBON_QUESTIONS: CQuestion[] = [
  { id: "q0", emoji: "🏠", stage: "contexto", text: "Quantas pessoas moram na sua casa, com você?", options: ["1 a 2", "3", "4", "5 ou mais"], note: "Os gastos da casa são divididos entre os moradores." },
  { id: "q1", emoji: "🥩", stage: "alimentacao", text: "Em quantos dias da semana você come carne de boi?", options: ["0 a 1 dia", "2 a 3 dias", "4 a 5 dias", "Todo dia, em várias refeições"] },
  { id: "q2", emoji: "🍗", stage: "alimentacao", text: "Em quantos dias você come frango, porco ou peixe?", options: ["0 a 1 dia", "2 a 3 dias", "4 a 5 dias", "Todo dia, em várias refeições"] },
  { id: "q3", emoji: "🥛", stage: "alimentacao", text: "Com que frequência você toma leite ou come queijo e iogurte?", options: ["Raramente", "Algumas vezes por semana", "1 vez por dia", "Várias vezes por dia"] },
  { id: "q4", emoji: "🍟", stage: "alimentacao", text: "Quanto da sua alimentação vem de ultraprocessados?", options: ["Quase nada", "Um pouco", "Metade", "A maior parte"] },
  { id: "q5", emoji: "🥦", stage: "contexto", text: "De onde vêm as frutas e verduras da sua casa?", options: ["Horta ou feira local", "Mercado, da época", "Mercado, sem reparar", "Quase não comemos"], note: "Esta pergunta é para debate: o transporte do alimento pesa menos de 5% da pegada da comida." },
  { id: "q6", emoji: "🍽️", stage: "alimentacao", text: "Quanta comida costuma sobrar no seu prato?", options: ["Quase nunca sobra", "Às vezes sobra", "Sobra com frequência", "Sobra bastante"] },
  { id: "q7", emoji: "🚌", stage: "transporte", text: "Como você vai para a escola?", options: ["A pé ou de bicicleta", "Ônibus ou van", "Carona dividida", "Carro só para você"] },
  { id: "q7b", emoji: "📏", stage: "transporte", text: "Qual a distância da sua casa até a escola?", options: ["Até 1 km", "1 a 3 km", "3 a 7 km", "Mais de 7 km"] },
  { id: "q8", emoji: "🚗", stage: "transporte", text: "Nos fins de semana e passeios, quanto a família anda de carro?", options: ["Quase nada", "Passeios na cidade", "Viagens a cidades vizinhas", "Viagens longas com frequência"] },
  { id: "q9", emoji: "✈️", stage: "aviacao", text: "Quantas viagens de avião você fez nos últimos 12 meses?", options: ["Nenhuma", "1 nacional", "2 a 3 nacionais", "Internacional ou 4 ou mais"] },
  { id: "q10", emoji: "🚿", stage: "energia", text: "Quanto tempo dura o seu banho?", options: ["Até 5 minutos", "5 a 10 minutos", "10 a 20 minutos", "Mais de 20 minutos"] },
  { id: "q10b", emoji: "🔥", stage: "energia", text: "Como a água do seu banho é aquecida?", options: ["Chuveiro elétrico", "Aquecedor a gás", "Aquecedor solar", "Tomo banho frio"] },
  { id: "q11", emoji: "❄️", stage: "energia", text: "Vocês usam ar-condicionado ou aquecedor elétrico?", options: ["Quase nunca", "Só ventilador", "Às vezes", "Todo dia"] },
  { id: "q12", emoji: "🍳", stage: "energia", text: "O que vocês usam para cozinhar?", options: ["Fogão ou forno elétrico", "Gás, pouco uso", "Gás, todo dia", "Lenha ou carvão com frequência"] },
  { id: "q13", emoji: "💡", stage: "energia", text: "Ficam luzes e aparelhos ligados sem ninguém usando?", options: ["Nunca", "Raramente", "Às vezes", "Sempre"] },
  { id: "q14", emoji: "📱", stage: "energia", text: "Quantas horas por dia você passa em telas?", options: ["Até 2 horas", "2 a 4 horas", "4 a 6 horas", "Mais de 6 horas"] },
  { id: "q15", emoji: "👕", stage: "consumo", text: "Com que frequência você ganha ou compra roupas e calçados novos sem necessidade?", options: ["Quase nunca", "Algumas vezes por ano", "Todo mês", "Várias vezes por mês"] },
  { id: "q16", emoji: "📲", stage: "consumo", text: "Há quanto tempo você tem o seu celular atual?", options: ["Não tenho / 3 anos ou mais", "2 a 3 anos", "1 a 2 anos", "Menos de 1 ano"] },
  { id: "q17", emoji: "🔧", stage: "consumo", text: "Quando algo estraga na sua casa...", options: ["Consertamos sempre", "Às vezes consertamos", "Geralmente compramos outro", "Compramos outro na hora"] },
  { id: "q18", emoji: "♻️", stage: "residuos", text: "Como é a separação do lixo na sua casa?", options: ["Recicláveis + compostagem", "Só recicláveis", "Raramente separamos", "Não separamos"] },
];

type V4 = [number, number, number, number];
const N: V4 = [1.5, 3, 4, 5.5];
const Q1: V4 = [259, 1294, 2328, 5433];
const Q2: V4 = [26, 130, 234, 546];
const Q3: V4 = [34, 135, 237, 592];
const Q4: V4 = [0, 60, 150, 250];
const M6: V4 = [1, 1.05, 1.15, 1.3];
const F7: V4 = [0, 0.06, 0.07, 0.2];
const D7B: V4 = [0.5, 2, 5, 10];
const Q8: V4 = [65, 260, 650, 1560];
const Q9: V4 = [0, 300, 750, 2400];
const T10: V4 = [5, 7.5, 15, 25];
const F10B: V4 = [1.29, 19.7, 0.37, 0];
const Q11: V4 = [3.9, 5.8, 34.6, 115.5];
const Q12: V4 = [38, 46, 232, 600];
const M13: V4 = [0.95, 1, 1.05, 1.1];
const Q14: V4 = [22, 44, 73, 102];
const N15: V4 = [1, 3, 12, 30];
const Q16: V4 = [15, 24, 40, 80];
const Q17: V4 = [0, 30, 80, 150];
const Q18: V4 = [90, 170, 220, 250];

/** Tabelas de alimentação (kg CO₂e/ano por alternativa), reaproveitadas pela pegada ecológica. */
export const FOOD_TABLES = { base: 400, q1: Q1, q2: Q2, q3: Q3, q4: Q4, q6: M6 } as const;

const r1 = (x: number) => Math.round(x * 10) / 10;

export function computeCarbon(a: Record<string, number>): { total: number; breakdown: CarbonBreakdown } {
  const g = (id: string, t: V4): number => t[a[id] ?? 0] ?? t[0];
  const n = g("q0", N);
  const alimentacao = (400 + g("q1", Q1) + g("q2", Q2) + g("q3", Q3) + g("q4", Q4)) * g("q6", M6);
  const transporte = 2 * g("q7b", D7B) * 200 * g("q7", F7) + g("q8", Q8) / n;
  const aviacao = g("q9", Q9);
  const energia = g("q10", T10) * g("q10b", F10B) + (g("q11", Q11) + g("q12", Q12) + 1800 * 0.0385 * g("q13", M13)) / n + g("q14", Q14);
  const consumo = 12 * g("q15", N15) + g("q16", Q16) + g("q17", Q17);
  const residuos = g("q18", Q18);
  const breakdown: CarbonBreakdown = {
    alimentacao: r1(alimentacao), transporte: r1(transporte), aviacao: r1(aviacao),
    energia: r1(energia), consumo: r1(consumo), residuos: r1(residuos),
  };
  return { total: r1(alimentacao + transporte + aviacao + energia + consumo + residuos), breakdown };
}

/** Chave de maior valor de um registro (ex.: a etapa ou a área de maior impacto). */
export function topKey<K extends string>(o: Record<K, number>): K {
  return (Object.keys(o) as K[]).reduce((a, k) => (o[k] > o[a] ? k : a));
}

export const formatKg = (kg: number) =>
  kg >= 1000 ? `${(kg / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} t` : `${Math.round(kg).toLocaleString("pt-BR")} kg`;

/** Converte "emissão da celebridade ÷ pegada anual" em texto de anos ou dias. */
export function timeEquivalent(celebKg: number, yearlyKg: number): string {
  if (yearlyKg <= 0) return "—";
  const years = celebKg / yearlyKg;
  if (years >= 1) return `${years.toLocaleString("pt-BR", { maximumFractionDigits: years < 10 ? 1 : 0 })} anos`;
  return `${(years * 365).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} dias`;
}

// SEEG 2025, por habitante (kg CO2e/ano).
export const BRASIL = { agro: 2935, usoTerra: 3816, energia: 2000, residuos: 449, industria: 442, bruto: 9642, remocoes: 3056 };
export const CLASS_SIZE = 30;
// SEEG 2025, totais em t CO2e. Os valores por habitante acima vêm destes, com a população abaixo.
export const SEEG = {
  pop: 213.4e6,
  setores: [
    { nome: "Mudança de uso da terra e floresta", t: 814_269_171 },
    { nome: "Agropecuária", t: 626_251_312 },
    { nome: "Energia", t: 426_807_805 },
    { nome: "Resíduos", t: 95_781_720 },
    { nome: "Processos industriais", t: 94_411_437 },
  ],
  brutas: 2_057_521_444,
  remocoes: -652_069_274,
  liquidas: 1_405_452_170,
};

// ---------- Comparação com celebridades (modelo "Pegada da Turma") ----------
export type CelebEvent = {
  id: string;
  rotulo?: string;   // nome curto do evento, quando a celebridade tem mais de um
  desc: string;
  E: number;         // kg CO₂ do registro
  dias?: number;     // duração do registro (permite média por dia)
  horas?: number;    // horas de voo do registro
  freq?: number;     // viagens por mês sugeridas (evento de uma viagem que se repete)
  unidade?: string;  // nome da viagem no plural ("trechos", "bate-voltas")
  unico?: boolean;   // viagem única: só dá para comparar a viagem inteira
  supoe?: string;    // suposição feita sobre o período
  fonte: string;
};
export type Celeb = { id: string; nome: string; eventos: CelebEvent[] };

export const CELEBS: Celeb[] = [
  { id: "neymar", nome: "Neymar", eventos: [
    { id: "heli", rotulo: "Helicóptero para o treino", desc: "1 trecho de helicóptero Mangaratiba → Santos", E: 620, horas: 1, freq: 4, unidade: "trechos", fonte: "UOL Ecoa, 6 fev. 2025 (estimativa de pesquisador). Tempo de voo aproximado." },
    { id: "b747", rotulo: "Boeing 747 sozinho", desc: "1 viagem sozinho num Boeing 747 até a Arábia Saudita", E: 230000, unico: true, fonte: "Reportagem de 2023, fonte original a confirmar. Tempo de voo não informado." },
  ] },
  { id: "virginia", nome: "Virginia Fonseca", eventos: [
    { id: "bv", rotulo: "Bate-volta para treinar", desc: "1 bate-volta de jatinho São Paulo → Goiás para treinar na academia", E: 6249.6, horas: 2.667, freq: 4, unidade: "bate-voltas", fonte: "Cessna Citation Sovereign: 930 L/h × 2,667 h = 2.480 L de querosene × 2,52 kg CO₂/L. O mesmo texto cita 6,7 t; usamos o valor com cálculo." },
  ] },
  { id: "trump", nome: "Donald Trump", eventos: [
    { id: "y", desc: "voos de jato particular registrados na lista", E: 35380000, dias: 365, supoe: "Período não informado: supomos que a lista cubra 1 ano.", fonte: "Lista de celebridades 2025–2026. Período e fonte original não informados." },
  ] },
  { id: "travis", nome: "Travis Scott", eventos: [
    { id: "y", desc: "137 voos de jatinho de janeiro a novembro de 2023", E: 6061300, dias: 334, fonte: "Ranking de jatos particulares, jan–nov 2023. Outra lista (2025–2026) cita 14.775 t." },
  ] },
  { id: "kim", nome: "Kim Kardashian", eventos: [
    { id: "y", desc: "165 voos de jatinho de janeiro a novembro de 2023", E: 5857600, dias: 334, fonte: "Ranking de jatos particulares, jan–nov 2023. Outra lista (2025–2026) cita 6.579 t." },
  ] },
  { id: "musk", nome: "Elon Musk", eventos: [
    { id: "y", desc: "150 voos de jatinho de janeiro a novembro de 2023", E: 4564700, dias: 334, fonte: "Ranking de jatos particulares, jan–nov 2023. Outra lista (2025–2026) cita 5.705 t, uma aeronave." },
  ] },
  { id: "alok", nome: "Alok", eventos: [
    { id: "y", desc: "36 voos em 2023", E: 29300, dias: 365, fonte: "Ranking de influenciadores 2023. O valor por km é baixo para jatinho; a metodologia precisa ser confirmada." },
  ] },
  { id: "taylor", nome: "Taylor Swift", eventos: [
    { id: "y", desc: "170 voos do jato dela entre 1º de janeiro e 19 de julho de 2022", E: 8293540, dias: 200, horas: 382.05, fonte: "Yard (2022), com dados do perfil @CelebJets. A equipe dela afirma que o jato era emprestado a outras pessoas." },
  ] },
];

/** Ritmo médio da celebridade em kg/dia, ou null quando não dá para calcular (viagem única ou 0 viagens). */
export function celebRate(ev: CelebEvent, freq?: number): number | null {
  if (ev.dias) return ev.E / ev.dias;
  if (ev.unico) return null;
  if (ev.freq != null) {
    const f = freq ?? ev.freq;
    return f > 0 ? (ev.E * f * 12) / 365 : null;
  }
  return null;
}

export const nf = (v: number, d = 0) => v.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });

/** Converte uma duração em dias para a unidade mais legível (segundos … anos). */
export function duration(days: number): { v: string; u: string } {
  const s = days * 86400;
  if (s < 1) return { v: "menos de 1", u: "segundo" };
  if (s < 60) return { v: s < 10 ? nf(s, 1) : nf(s, 0), u: s < 2 ? "segundo" : "segundos" };
  if (s < 3600) { const m = s / 60; return { v: m < 10 ? nf(m, 1) : nf(m, 0), u: m < 2 ? "minuto" : "minutos" }; }
  if (days < 1) { const h = s / 3600; return { v: h < 10 ? nf(h, 1) : nf(h, 0), u: h < 2 ? "hora" : "horas" }; }
  if (days < 365) return { v: days < 10 ? nf(days, 1) : nf(days, 0), u: days < 2 ? "dia" : "dias" };
  const y = days / 365;
  return { v: y < 10 ? nf(y, 1) : nf(y, 0), u: y < 2 ? "ano" : "anos" };
}
export const durationText = (days: number) => { const d = duration(days); return `${d.v} ${d.u}`; };

/** Equivalência com um carro (0,13 kg CO₂/km) e com voltas na Terra (40.075 km). */
export function carEquivalent(kg: number): { km: number; laps: number } {
  const km = kg / 0.13;
  return { km: Math.round(km / 100) * 100, laps: km / 40075 };
}

// ---------- Comparação "Eu × famosos" ----------
export type Perspective = "eu" | "como" | "turma";
export type CelebPeriod = "total" | 1 | 30.42 | 365;
export const PERIOD_LABEL: Record<Exclude<CelebPeriod, "total">, string> = { 1: "1 dia", 30.42: "1 mês", 365: "1 ano" };

export type Who = { perYear: number; aviacao: number; quem: string; quemObj: string; seu: string; calc: string };

/** Quem está sendo comparado: a pessoa, a turma imaginária ou a turma real (só totais). */
export function whoCompares(p: Perspective, total: number, aviacao: number, cls: { k: number; sum: number; aviacaoAvg: number }): Who {
  if (p === "eu") return { perYear: total, aviacao, quem: "Você", quemObj: "você", seu: "o seu dia", calc: `${nf(total, 0)} kg/ano ÷ 365` };
  if (p === "como") return { perYear: CLASS_SIZE * total, aviacao: CLASS_SIZE * aviacao, quem: `Uma turma de ${CLASS_SIZE} alunos iguais a você`, quemObj: "essa turma", seu: "um dia dessa turma", calc: `${CLASS_SIZE} × ${nf(total, 0)} kg/ano ÷ 365` };
  return { perYear: cls.sum, aviacao: cls.k * cls.aviacaoAvg, quem: `A turma real (${cls.k} ${cls.k === 1 ? "resposta" : "respostas"})`, quemObj: "a turma", seu: "um dia da turma", calc: `${nf(cls.sum, 0)} kg/ano ÷ 365` };
}

export type CelebCard = { q: string; a: string; calc: string };
export type CelebComparison =
  | { kind: "empty"; message: string; notes: string[] }
  | { kind: "ok"; before: string; highlight: string; after: string; cards: CelebCard[]; notes: string[] };

const days = (d: number) => nf(d, d % 1 ? 2 : 0);

/** Monta a frase de destaque e os cartões de tempo do painel "Eu × famosos". */
export function compareCeleb(nome: string, ev: CelebEvent, period: CelebPeriod, freq: number | undefined, who: Who, grupo: Perspective): CelebComparison {
  const per = ev.unico ? "total" : period;
  const rate = celebRate(ev, freq);
  const f = freq ?? ev.freq ?? 0;
  const notes: string[] = [];
  if (ev.unico) notes.push("Viagem única: só dá para comparar a viagem inteira.");
  if (ev.supoe) notes.push(ev.supoe);
  if (ev.dias && per !== "total") notes.push(`Média: ${nf(ev.E, 0)} kg ÷ ${ev.dias} dias = ${nf(ev.E / ev.dias, 0)} kg por dia, contando dias sem voo.`);
  if (ev.freq != null && per !== "total" && rate === null) notes.push("Com 0 viagens por mês não há emissão no período.");

  const perDay = who.perYear / 365;
  let emitted: number, perText: string, perCalc: string;
  if (per === "total") {
    emitted = ev.E;
    perText = ev.dias ? "em voos de jatinho no período registrado" : `em ${ev.desc.replace(/^1 /, "um ")}`;
    perCalc = `${nf(ev.E, 0)} kg registrados`;
  } else {
    emitted = rate ? rate * per : 0;
    perText = `em ${PERIOD_LABEL[per]}`;
    perCalc = ev.dias ? `${nf(rate ?? 0, 0)} kg/dia × ${days(per)} dias` : `${nf(ev.E, 1)} kg × ${nf(f, 0)} ${ev.unidade}/mês × 12 ÷ 365 × ${days(per)} dias`;
  }
  if (emitted <= 0) return { kind: "empty", message: `Com essa frequência, ${nome} não emite nada nesse período.`, notes };
  if (perDay <= 0) return { kind: "empty", message: "Ainda não há respostas para comparar.", notes };

  const time = emitted / perDay;
  const alvo = per === "total" ? (ev.dias ? `tudo o que ${nome} emitiu no período` : "essa viagem inteira") : `o que ${nome} emite em ${PERIOD_LABEL[per]}`;
  const cards: CelebCard[] = [{ q: `Quanto tempo ${who.quemObj} leva para emitir ${alvo}?`, a: durationText(time), calc: `${perCalc} ÷ (${who.calc})` }];
  if (per !== "total") {
    const mine = perDay * per;
    cards.push({ q: `Em ${PERIOD_LABEL[per]}, quanto ${who.quemObj} emite?`, a: formatKg(mine), calc: `${nf(perDay, 1)} kg/dia × ${days(per)} dias` });
    cards.push({ q: `Em ${PERIOD_LABEL[per]}, ${nome} emite quantas vezes mais?`, a: `${nf(emitted / mine, emitted / mine < 10 ? 1 : 0)} vezes`, calc: `${formatKg(emitted)} ÷ ${formatKg(mine)}` });
  }
  if (rate) cards.push({ q: `Em quanto tempo ${nome} emite ${who.seu}?`, a: durationText(perDay / rate), calc: `${nf(perDay, 1)} ÷ ${nf(rate, 0)} kg/dia${ev.dias ? "" : " (média com a frequência suposta)"}` });
  if (ev.horas) {
    const perHour = ev.E / ev.horas;
    cards.push({ q: `Quanto tempo ${who.quemObj} leva para emitir 1 hora de voo de ${nome}?`, a: durationText(perHour / perDay), calc: `${nf(perHour, 0)} kg por hora de voo ÷ ${nf(perDay, 1)} kg/dia` });
    cards.push({ q: `Em quanto tempo de voo ${nome} emite ${who.seu}?`, a: durationText(perDay / perHour / 24), calc: `${nf(perDay, 1)} kg ÷ ${nf(perHour, 0)} kg/h` });
  }
  if (who.aviacao > 0) cards.push({ q: `Só voos com voos: quantos anos de voos ${grupo === "eu" ? "seus" : "desse grupo"} cabem nisso?`, a: `${nf(emitted / who.aviacao, emitted / who.aviacao < 10 ? 1 : 0)} anos`, calc: `${formatKg(emitted)} ÷ ${nf(who.aviacao, 0)} kg/ano de aviação` });
  else cards.push({ q: "Só voos com voos", a: "0 kg de avião", calc: grupo === "eu" ? "Você não voou nos últimos 12 meses. Essa é a comparação de mesmo recorte (ISO 14067, Anexo B)." : "Ninguém voou nesse grupo." });

  return { kind: "ok", before: `${who.quem} levaria `, highlight: durationText(time), after: ` para emitir o que ${nome} emite ${perText}.`, cards, notes };
}

// ---------- "Mostrar as contas" ----------
/** kg (ou multiplicador) de cada alternativa, para as perguntas que têm um valor direto. */
export const ALTERNATIVES: Record<string, { values: readonly number[]; prefix?: string; suffix: string }> = {
  q1: { values: Q1, suffix: " kg/ano" }, q2: { values: Q2, suffix: " kg/ano" }, q3: { values: Q3, suffix: " kg/ano" }, q4: { values: Q4, suffix: " kg/ano" },
  q6: { values: M6, prefix: "× ", suffix: " na alimentação" },
  q8: { values: Q8, suffix: " kg/ano ÷ moradores" }, q9: { values: Q9, suffix: " kg/ano" },
  q11: { values: Q11, suffix: " kg/ano ÷ moradores" }, q12: { values: Q12, suffix: " kg/ano ÷ moradores" },
  q13: { values: M13.map((m) => 1800 * 0.0385 * m), suffix: " kg/ano ÷ moradores" },
  q14: { values: Q14, suffix: " kg/ano" }, q15: { values: N15.map((x) => 12 * x), suffix: " kg/ano" },
  q16: { values: Q16, suffix: " kg/ano" }, q17: { values: Q17, suffix: " kg/ano" }, q18: { values: Q18, suffix: " kg/ano" },
};

/** A conta de cada etapa, com os valores das respostas. */
export function explainCarbon(a: Record<string, number>): { stage: Stage; formula: string }[] {
  const g = (id: string, t: V4): number => t[a[id] ?? 0] ?? t[0];
  const n = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 4 });
  const { breakdown: b } = computeCarbon(a);
  const moradores = n(g("q0", N));
  return [
    { stage: "alimentacao", formula: `(400 + ${n(g("q1", Q1))} + ${n(g("q2", Q2))} + ${n(g("q3", Q3))} + ${n(g("q4", Q4))}) × ${n(g("q6", M6))} = ${nf(b.alimentacao, 1)} kg` },
    { stage: "transporte", formula: `2 × ${n(g("q7b", D7B))} km × 200 dias × ${n(g("q7", F7))} kg/km + ${n(g("q8", Q8))} ÷ ${moradores} moradores = ${nf(b.transporte, 1)} kg` },
    { stage: "aviacao", formula: `${n(g("q9", Q9))} kg` },
    { stage: "energia", formula: `${n(g("q10", T10))} × ${n(g("q10b", F10B))} (banho) + (${n(g("q11", Q11))} + ${n(g("q12", Q12))} + 1.800 × 0,0385 × ${n(g("q13", M13))}) ÷ ${moradores} moradores + ${n(g("q14", Q14))} (telas) = ${nf(b.energia, 1)} kg` },
    { stage: "consumo", formula: `12 × ${n(g("q15", N15))} + ${n(g("q16", Q16))} + ${n(g("q17", Q17))} = ${nf(b.consumo, 1)} kg` },
    { stage: "residuos", formula: `${n(g("q18", Q18))} kg` },
  ];
}
