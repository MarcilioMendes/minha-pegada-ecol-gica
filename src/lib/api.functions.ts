import { createServerFn } from "@tanstack/react-start";
import { PERCEPTION_QUESTIONS, AREA_LABEL, computeEcological, formatTerras, aggregateClass, shareableClass, type EcoResult } from "./footprint";
import { computeCarbon, CARBON_QUESTIONS, STAGE_LABEL, topKey, type CarbonBreakdown } from "./carbon";

const db = async () => (await import("@/integrations/supabase/client.server")).supabaseAdmin;
const sess = () => import("./session.server");
const norm = (p: string) => p.trim().toUpperCase();

export const studentLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { pseudonym: string; pin: string }) => d)
  .handler(async ({ data }) => {
    const pseudonym = norm(data.pseudonym);
    if (!/^\d{4,6}$/.test(data.pin)) throw new Error("O PIN deve ter de 4 a 6 números.");
    const s = await sess();
    const sb = await db();
    const { data: st } = await sb.from("students").select("*").eq("pseudonym", pseudonym).maybeSingle();
    if (!st) throw new Error("Código não encontrado. Confira com o professor.");
    const h = await s.hashPin(pseudonym, data.pin);
    let firstAccess = false;
    if (!st.pin_hash) {
      await sb.from("students").update({ pin_hash: h }).eq("id", st.id);
      firstAccess = true;
    } else if (st.pin_hash !== h) throw new Error("PIN incorreto.");
    const token = await s.signToken({ role: "student", sid: st.id, p: pseudonym });
    return { token, pseudonym, firstAccess };
  });

// Só a reflexão sai para a tela: as colunas antigas (answers, planets, breakdown) não são mais lidas.
const perceptionOf = (r: { perception: unknown } | undefined) => (r ? { perception: r.perception as { items?: string[] } } : null);
const perceptionItems = (p: unknown) => (p as { items?: string[] } | null)?.items ?? [];
// Linha antiga: ainda guarda as 10 perguntas de hábitos, e o feedback foi gerado a partir delas.
const isLegacyRow = (r: { answers: unknown }) => Object.keys((r.answers ?? {}) as object).length > 0;
const currentFeedback = (r: { answers: unknown; ai_feedback: string | null } | undefined) => (r && !isLegacyRow(r) ? r.ai_feedback : null);

export const getMyData = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    const c = await (await sess()).requireStudent(data.token);
    const sb = await db();
    const { data: rows } = await sb.from("responses").select("*").eq("student_id", c.sid);
    const { data: st } = await sb.from("students").select("seed_perception").eq("id", c.sid).maybeSingle();
    const seed = (st?.seed_perception as { items?: string[] } | null)?.items ?? null;
    return {
      pseudonym: c.p,
      seedPerception: seed,
      pre: perceptionOf(rows?.find((r) => r.phase === "pre")),
      feedback: currentFeedback(rows?.find((r) => r.phase === "pre")),
      post: perceptionOf(rows?.find((r) => r.phase === "post")),
    };
  });

function extractText(res: unknown): string {
  const r = res as { output_text?: string; output?: { type: string; content?: { type: string; text?: string }[] }[] };
  if (typeof r.output_text === "string" && r.output_text) return r.output_text;
  return (r.output ?? [])
    .flatMap((o) => (o.type === "message" ? o.content ?? [] : []))
    .filter((c) => c.type === "output_text")
    .map((c) => c.text ?? "")
    .join("\n");
}

async function aiFeedback(perception: string[], answers: Record<string, number>, total: number, breakdown: CarbonBreakdown, eco: EcoResult) {
  const { generateResponse } = await import("@lovable.dev/ai-gateway");
  const habits = CARBON_QUESTIONS.map((q) => `- (${q.stage === "contexto" ? "Contexto" : STAGE_LABEL[q.stage]}) ${q.text} → ${q.options[answers[q.id] ?? -1] ?? "sem resposta"}`).join("\n");
  const refl = PERCEPTION_QUESTIONS.map((q, i) => `${i + 1}. ${q}\nResposta: ${perception[i] || "(em branco)"}`).join("\n");
  const instructions = `Você é um educador ambiental que conversa com alunos do 8º ano (13-14 anos) no Brasil. Tom: encorajador, empático, acolhedor e socrático (faça perguntas que estimulem o pensamento). Nunca julgue nem culpe o aluno ou a família; reconheça que muitos hábitos dependem dos adultos e do contexto. Linguagem simples, frases curtas, em português do Brasil. Não invente dados pessoais.
Estrutura obrigatória em Markdown:
## 🌱 O que eu percebi
(valorize a preocupação ambiental que o aluno trouxe)
## 🔗 Como tudo se conecta
(explique de forma sistêmica e simples a relação entre a preocupação do aluno e os hábitos da pegada, citando 1-2 hábitos concretos)
## 🤔 Para pensar
(1-2 perguntas socráticas)
## 🎯 Suas missões
(2 a 3 missões práticas, realistas e específicas para o cotidiano de um adolescente, em lista numerada)
Máximo de ~250 palavras.`;
  const input = `REFLEXÃO DO ALUNO:\n${refl}\n\nHÁBITOS:\n${habits}\n\nRESULTADO: ${total} kg CO₂e/ano. Pegada ecológica: ${formatTerras(eco.planets)} (${eco.gha} gha). Etapa de maior impacto: ${STAGE_LABEL[topKey(breakdown)]}. Área de maior impacto: ${AREA_LABEL[topKey(eco.byArea)]}.`;
  try {
    const res = await generateResponse({ model: "openai/gpt-6-astra", instructions, input });
    return extractText(res).trim() || null;
  } catch (e) {
    console.error("AI feedback error", e);
    return null;
  }
}

export const submitPhase = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; phase: "pre" | "post"; perception: string[] }) => d)
  .handler(async ({ data }) => {
    const c = await (await sess()).requireStudent(data.token);
    if (data.phase !== "pre" && data.phase !== "post") throw new Error("Fase inválida");
    const perception = PERCEPTION_QUESTIONS.map((_, i) => String(data.perception[i] ?? "").slice(0, 2000));
    const sb = await db();
    if (data.phase === "post") {
      const { data: pre } = await sb.from("responses").select("id").eq("student_id", c.sid).eq("phase", "pre").maybeSingle();
      if (!pre) throw new Error("Faça primeiro a etapa 1, Minha reflexão.");
    }
    const { data: cur } = await sb.from("responses").select("perception,answers,ai_feedback").eq("student_id", c.sid).eq("phase", data.phase).maybeSingle();
    const unchanged = !!cur && JSON.stringify(perceptionItems(cur.perception)) === JSON.stringify(perception);
    // Se a reflexão mudou, o feedback fica desatualizado. Os hábitos antigos deixam de valer de qualquer forma.
    const row = {
      student_id: c.sid, phase: data.phase, perception: { items: perception }, answers: {},
      planets: 0, breakdown: {}, ai_feedback: unchanged ? currentFeedback(cur) : null, updated_at: new Date().toISOString(),
    };
    const { error } = await sb.from("responses").upsert(row, { onConflict: "student_id,phase" });
    if (error) throw new Error("Não foi possível salvar. Tente de novo.");
    return { ok: true };
  });

export const regenerateFeedback = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    const c = await (await sess()).requireStudent(data.token);
    const sb = await db();
    const { data: pre } = await sb.from("responses").select("id,perception").eq("student_id", c.sid).eq("phase", "pre").maybeSingle();
    const { data: carbon } = await sb.from("carbon_responses").select("answers,total_kg,breakdown").eq("student_id", c.sid).maybeSingle();
    if (!pre || !carbon) throw new Error("Resposta não encontrada");
    const answers = carbon.answers as Record<string, number>;
    const fb = await aiFeedback(perceptionItems(pre.perception), answers, Number(carbon.total_kg), carbon.breakdown as CarbonBreakdown, computeEcological(answers));
    if (!fb) throw new Error("A IA não respondeu agora. Tente em instantes.");
    const { error } = await sb.from("responses").update({ ai_feedback: fb, answers: {} }).eq("id", pre.id);
    if (error) throw new Error("Não foi possível salvar o feedback. Tente de novo.");
    return { ai_feedback: fb };
  });

// ---------- Professor ----------
export const teacherLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    const pw = process.env["TEACHER_PASSWORD"];
    if (!pw) throw new Error("Senha do professor ainda não configurada.");
    const s = await sess();
    if ((await s.sha256(data.password)) !== (await s.sha256(pw))) throw new Error("Senha incorreta.");
    return { token: await s.signToken({ role: "teacher" }, 8) };
  });

export const teacherOverview = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    await (await sess()).requireTeacher(data.token);
    const sb = await db();
    const { data: students } = await sb.from("students").select("id,pseudonym,class_name,pin_hash,seed_perception").order("pseudonym");
    const { data: responses } = await sb.from("responses").select("*");
    return {
      students: (students ?? []).map((s) => ({ id: s.id, pseudonym: s.pseudonym, class_name: s.class_name, hasPin: !!s.pin_hash, seedPerception: (s.seed_perception as { items?: string[] } | null)?.items ?? null })),
      responses: (responses ?? []).map((r) => ({ id: r.id, student_id: r.student_id, phase: r.phase, perception: r.perception as { items?: string[] }, feedback: currentFeedback(r) })),
    };
  });

export const teacherAddStudents = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; pseudonyms: string[]; className: string }) => d)
  .handler(async ({ data }) => {
    await (await sess()).requireTeacher(data.token);
    const rows = [...new Set(data.pseudonyms.map(norm).filter((p) => /^[A-Z0-9_-]{2,12}$/.test(p)))].map((pseudonym) => ({ pseudonym, class_name: data.className || "81" }));
    if (!rows.length) throw new Error("Nenhum pseudônimo válido.");
    const { error } = await (await db()).from("students").upsert(rows, { onConflict: "pseudonym", ignoreDuplicates: true });
    if (error) throw new Error(error.message);
    return { added: rows.length };
  });

export const teacherResetPin = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; studentId: string }) => d)
  .handler(async ({ data }) => {
    await (await sess()).requireTeacher(data.token);
    await (await db()).from("students").update({ pin_hash: null }).eq("id", data.studentId);
    return { ok: true };
  });

// ---------- Calculadora de carbono (3º questionário) ----------
async function classCarbon(sb: Awaited<ReturnType<typeof db>>) {
  const { data } = await sb.from("carbon_responses").select("total_kg,breakdown,answers");
  return aggregateClass((data ?? []).map((r) => ({ total: Number(r.total_kg), breakdown: r.breakdown as CarbonBreakdown, answers: r.answers as Record<string, number> })));
}

export const getMyCarbon = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    const c = await (await sess()).requireStudent(data.token);
    const sb = await db();
    const { data: mine } = await sb.from("carbon_responses").select("*").eq("student_id", c.sid).maybeSingle();
    const cls = await classCarbon(sb);
    return {
      mine: mine ? { answers: mine.answers as Record<string, number>, total: Number(mine.total_kg), breakdown: mine.breakdown as CarbonBreakdown, eco: computeEcological(mine.answers as Record<string, number>) } : null,
      cls: shareableClass(cls),
    };
  });

export const submitCarbon = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; answers: Record<string, number> }) => d)
  .handler(async ({ data }) => {
    const c = await (await sess()).requireStudent(data.token);
    for (const q of CARBON_QUESTIONS) {
      const v = data.answers[q.id];
      if (typeof v !== "number" || v < 0 || v > 3) throw new Error("Responda todas as perguntas.");
    }
    const answers: Record<string, number> = Object.fromEntries(CARBON_QUESTIONS.map((q) => [q.id, data.answers[q.id] ?? 0]));
    const { total, breakdown } = computeCarbon(answers);
    const sb = await db();
    const { data: pre } = await sb.from("responses").select("id,perception").eq("student_id", c.sid).eq("phase", "pre").maybeSingle();
    if (!pre) throw new Error("Faça primeiro a etapa 1, Minha reflexão.");
    const { error } = await sb.from("carbon_responses").upsert(
      { student_id: c.sid, answers, total_kg: total, breakdown, updated_at: new Date().toISOString() }, { onConflict: "student_id" });
    if (error) throw new Error("Não foi possível salvar. Tente de novo.");
    // As respostas mudaram: limpa o feedback antes da IA, para ele não sobrar se a chamada falhar ou for interrompida.
    const { error: clearError } = await sb.from("responses").update({ ai_feedback: null, answers: {} }).eq("id", pre.id);
    if (clearError) throw new Error("Não foi possível salvar. Tente de novo.");
    const eco = computeEcological(answers);
    const ai_feedback = await aiFeedback(perceptionItems(pre.perception), answers, total, breakdown, eco);
    if (ai_feedback) {
      const { error: saveError } = await sb.from("responses").update({ ai_feedback }).eq("id", pre.id);
      if (saveError) console.error("AI feedback save error", saveError);
    }
    return { total, breakdown, eco, ai_feedback };
  });

export const teacherCarbon = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    await (await sess()).requireTeacher(data.token);
    const { data: rows } = await (await db()).from("carbon_responses").select("student_id,total_kg,breakdown,answers");
    return (rows ?? []).map((r) => ({ student_id: r.student_id, total: Number(r.total_kg), breakdown: r.breakdown as CarbonBreakdown, answers: r.answers as Record<string, number>, eco: computeEcological(r.answers as Record<string, number>) }));
  });
