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
