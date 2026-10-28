import { createServerFn } from "@tanstack/react-start";
import { computeFootprint, QUESTIONS, PERCEPTION_QUESTIONS, CATEGORY_LABEL, type Breakdown } from "./footprint";

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
    if (!st) throw new Error("Pseudônimo não encontrado. Confira com seu professor.");
    const h = await s.hashPin(pseudonym, data.pin);
    let firstAccess = false;
    if (!st.pin_hash) {
      await sb.from("students").update({ pin_hash: h }).eq("id", st.id);
      firstAccess = true;
    } else if (st.pin_hash !== h) throw new Error("PIN incorreto.");
    const token = await s.signToken({ role: "student", sid: st.id, p: pseudonym });
    return { token, pseudonym, firstAccess };
  });

export const getMyData = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    const c = await (await sess()).requireStudent(data.token);
    const { data: rows } = await (await db()).from("responses").select("*").eq("student_id", c.sid);
    return {
      pseudonym: c.p,
      pre: rows?.find((r) => r.phase === "pre") ?? null,
      post: rows?.find((r) => r.phase === "post") ?? null,
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

async function aiFeedback(phase: "pre" | "post", perception: string[], answers: Record<string, number>, planets: number, breakdown: Breakdown, previous?: { planets: number; perception: string[] }) {
  const { generateResponse } = await import("@lovable.dev/ai-gateway");
  const habits = QUESTIONS.map((q) => `- (${CATEGORY_LABEL[q.category]}) ${q.text} → ${q.options.find((o) => o.score === answers[q.id])?.label ?? "sem resposta"}`).join("\n");
  const refl = PERCEPTION_QUESTIONS.map((q, i) => `${i + 1}. ${q}\nResposta: ${perception[i] || "(em branco)"}`).join("\n");
  const dist = Object.entries(breakdown).map(([k, v]) => `${CATEGORY_LABEL[k as keyof Breakdown]}: ${v}`).join(", ");
  const compare = previous ? `\n\nCOMPARATIVO: No diagnóstico inicial o aluno precisava de ${previous.planets} Terras; agora ${planets}. Reflexão inicial sobre a preocupação: "${previous.perception[0] ?? ""}". Destaque o amadurecimento da reflexão e as mudanças de hábito.` : "";
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
  const input = `FASE: ${phase === "pre" ? "Diagnóstico inicial" : "Pós-intervenção"}\n\nREFLEXÃO DO ALUNO:\n${refl}\n\nHÁBITOS:\n${habits}\n\nRESULTADO: ${planets} Planetas Terra. Distribuição: ${dist}.${compare}`;
  try {
    const res = await generateResponse({ model: "openai/gpt-6-astra", instructions, input });
    return extractText(res).trim() || null;
  } catch (e) {
    console.error("AI feedback error", e);
    return null;
  }
}

export const submitPhase = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; phase: "pre" | "post"; perception: string[]; answers: Record<string, number> }) => d)
  .handler(async ({ data }) => {
    const c = await (await sess()).requireStudent(data.token);
    if (data.phase !== "pre" && data.phase !== "post") throw new Error("Fase inválida");
    for (const q of QUESTIONS) {
      const v = data.answers[q.id];
      if (typeof v !== "number" || v < 0 || v > 3) throw new Error("Responda todas as perguntas.");
    }
    const perception = PERCEPTION_QUESTIONS.map((_, i) => String(data.perception[i] ?? "").slice(0, 2000));
    const { planets, breakdown } = computeFootprint(data.answers);
    const sb = await db();
    let previous: { planets: number; perception: string[] } | undefined;
    if (data.phase === "post") {
      const { data: pre } = await sb.from("responses").select("*").eq("student_id", c.sid).eq("phase", "pre").maybeSingle();
      if (!pre) throw new Error("Faça primeiro o diagnóstico inicial.");
      previous = { planets: Number(pre.planets), perception: (pre.perception as { items?: string[] }).items ?? [] };
    }
    const feedback = await aiFeedback(data.phase, perception, data.answers, planets, breakdown, previous);
    const row = {
      student_id: c.sid, phase: data.phase, perception: { items: perception }, answers: data.answers,
      planets, breakdown, ai_feedback: feedback, updated_at: new Date().toISOString(),
    };
    const { error } = await sb.from("responses").upsert(row, { onConflict: "student_id,phase" });
    if (error) throw new Error("Não foi possível salvar. Tente de novo.");
    return { planets, breakdown, ai_feedback: feedback };
  });

export const regenerateFeedback = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; phase: "pre" | "post" }) => d)
  .handler(async ({ data }) => {
    const c = await (await sess()).requireStudent(data.token);
    const sb = await db();
    const { data: rows } = await sb.from("responses").select("*").eq("student_id", c.sid);
    const cur = rows?.find((r) => r.phase === data.phase);
    if (!cur) throw new Error("Resposta não encontrada");
    const pre = rows?.find((r) => r.phase === "pre");
    const items = (x: unknown) => (x as { items?: string[] }).items ?? [];
    const fb = await aiFeedback(data.phase, items(cur.perception), cur.answers as Record<string, number>, Number(cur.planets), cur.breakdown as Breakdown,
      data.phase === "post" && pre ? { planets: Number(pre.planets), perception: items(pre.perception) } : undefined);
    if (!fb) throw new Error("A IA não respondeu agora. Tente em instantes.");
    await sb.from("responses").update({ ai_feedback: fb }).eq("id", cur.id);
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
    const { data: students } = await sb.from("students").select("id,pseudonym,class_name,pin_hash").order("pseudonym");
    const { data: responses } = await sb.from("responses").select("*");
    return {
      students: (students ?? []).map((s) => ({ id: s.id, pseudonym: s.pseudonym, class_name: s.class_name, hasPin: !!s.pin_hash })),
      responses: (responses ?? []).map((r) => ({ ...r, planets: Number(r.planets) })),
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
