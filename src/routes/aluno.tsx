import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getMyData, submitPhase, regenerateFeedback } from "@/lib/api.functions";
import { Questionnaire } from "@/components/eco/Questionnaire";
import { FootprintDonut, Planets, CAT_COLOR } from "@/components/eco/FootprintChart";
import { Feedback } from "@/components/eco/Feedback";
import { CATEGORY_LABEL, type Breakdown, type Category } from "@/lib/footprint";
import { LogOut, CheckCircle2, Lock } from "lucide-react";

export const Route = createFileRoute("/aluno")({
  head: () => ({
    meta: [
      { title: "Minha jornada · Pegada Ecológica" },
      { name: "description", content: "Diagnóstico inicial, resultado e comparativo antes e depois da sua Pegada Ecológica." },
      { property: "og:title", content: "Minha jornada · Pegada Ecológica" },
      { property: "og:description", content: "Acompanhe sua Pegada Ecológica antes e depois da aula." },
    ],
  }),
  component: Aluno,
});

type Resp = { perception: unknown; answers: unknown; planets: number | string; breakdown: unknown; ai_feedback: string | null };
type View = "home" | "pre" | "post" | "result-pre" | "result-post" | "compare";
const items = (p: unknown) => (p as { items?: string[] })?.items ?? [];

function Aluno() {
  const nav = useNavigate();
  const fetchData = useServerFn(getMyData);
  const submit = useServerFn(submitPhase);
  const regen = useServerFn(regenerateFeedback);
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<{ pseudonym: string; seedPerception: string[] | null; pre: Resp | null; post: Resp | null } | null>(null);
  const [view, setView] = useState<View>("home");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (t: string) => {
    try { setData(await fetchData({ data: { token: t } })); }
    catch { localStorage.removeItem("pe_student"); nav({ to: "/" }); }
  }, [fetchData, nav]);

  useEffect(() => {
    const t = localStorage.getItem("pe_student");
    if (!t) { nav({ to: "/" }); return; }
    setToken(t); load(t);
  }, [load, nav]);

  async function onSubmit(phase: "pre" | "post", perception: string[], answers: Record<string, number>) {
    if (!token) return;
    setBusy(true);
    try {
      await submit({ data: { token, phase, perception, answers } });
      await load(token);
      setView(phase === "pre" ? "result-pre" : "compare");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  }

  async function onRegen(phase: "pre" | "post") {
    if (!token) return;
    setBusy(true);
    try { await regen({ data: { token, phase } }); await load(token); }
    catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  }

  if (!data) return <div className="flex min-h-screen items-center justify-center text-4xl animate-pulse">🌱</div>;
  const { pre, post } = data;

  return (
    <main className="min-h-screen pb-16">
      <header className="sticky top-0 z-10 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <button onClick={() => setView("home")} className="font-display text-xl font-extrabold text-primary">🌍 Minha Pegada</button>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-secondary px-3 py-1 text-sm font-bold text-secondary-foreground">{data.pseudonym}</span>
            <Button variant="ghost" size="sm" onClick={() => { localStorage.removeItem("pe_student"); nav({ to: "/" }); }}><LogOut /> Sair</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 pt-8">
        {view === "home" && (
          <div className="space-y-6">
            <h1 className="text-3xl font-extrabold sm:text-4xl">Olá, {data.pseudonym}! 👋</h1>
            <p className="text-lg text-muted-foreground">Sua jornada tem duas etapas. Vamos lá?</p>
            <div className="grid gap-5 md:grid-cols-2">
              <PhaseCard n={1} title="Diagnóstico Inicial" desc="Antes da aula: reflexão + questionário de hábitos." done={!!pre}
                action={pre ? <><Button onClick={() => setView("result-pre")}>Ver resultado</Button><Button variant="outline" onClick={() => setView("pre")}>Refazer</Button></> : <Button size="lg" onClick={() => setView("pre")}>Começar 🚀</Button>} />
              <PhaseCard n={2} title="Depois da Aula" desc="Revisite sua reflexão, reavalie seus hábitos e compare." done={!!post} locked={!pre}
                action={post ? <><Button onClick={() => setView("compare")}>Antes vs. Depois</Button><Button variant="outline" onClick={() => setView("post")}>Refazer</Button></> : <Button size="lg" disabled={!pre} onClick={() => setView("post")}>Começar 🌱</Button>} />
            </div>
          </div>
        )}

        {view === "pre" && <Questionnaire phase="pre" busy={busy} initialPerception={pre ? items(pre.perception) : data.seedPerception ?? undefined} imported={!pre && !!data.seedPerception} initialAnswers={pre?.answers as Record<string, number> | undefined} onSubmit={(p, a) => onSubmit("pre", p, a)} />}
        {view === "post" && <Questionnaire phase="post" busy={busy} previousPerception={pre ? items(pre.perception) : undefined} initialAnswers={pre?.answers as Record<string, number> | undefined} onSubmit={(p, a) => onSubmit("post", p, a)} />}

        {view === "result-pre" && pre && (
          <Result title="Seu resultado inicial" r={pre} onRetry={() => onRegen("pre")} busy={busy}
            footer={<Button size="lg" className="rounded-full" onClick={() => setView("home")}>Voltar ao início</Button>} />
        )}

        {view === "compare" && pre && post && (
          <div className="space-y-8">
            <h1 className="text-3xl font-extrabold">Antes vs. Depois 🌱➡️🌳</h1>
            <DiffBanner before={Number(pre.planets)} after={Number(post.planets)} />
            <div className="grid gap-5 md:grid-cols-2">
              {[["Antes", pre], ["Depois", post]].map(([label, r]) => {
                const rr = r as Resp;
                return (
                  <div key={label as string} className="space-y-4 rounded-3xl bg-card p-6 shadow-soft">
                    <p className="text-center text-sm font-bold uppercase tracking-wider text-muted-foreground">{label as string}</p>
                    <Planets value={Number(rr.planets)} size="sm" />
                    <CategoryBars breakdown={rr.breakdown as Breakdown} />
                    <div className="rounded-xl bg-muted p-3 text-sm"><b>Minha preocupação:</b> {items(rr.perception)[0]}</div>
                    <div className="rounded-xl bg-muted p-3 text-sm"><b>O que faria diminuir:</b> {items(rr.perception)[3]}</div>
                  </div>
                );
              })}
            </div>
            <Feedback text={post.ai_feedback} onRetry={() => onRegen("post")} busy={busy} />
            <Button size="lg" className="rounded-full" onClick={() => setView("home")}>Voltar ao início</Button>
          </div>
        )}
      </div>
    </main>
  );
}

function PhaseCard({ n, title, desc, done, locked, action }: { n: number; title: string; desc: string; done: boolean; locked?: boolean; action: React.ReactNode }) {
  return (
    <div className={`space-y-4 rounded-3xl bg-card p-6 shadow-soft transition ${locked ? "opacity-60" : "hover:-translate-y-1"}`}>
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-hero font-extrabold text-primary-foreground">{n}</span>
        {done ? <span className="flex items-center gap-1 text-sm font-bold text-primary"><CheckCircle2 className="h-4 w-4" /> Concluído</span>
          : locked ? <span className="flex items-center gap-1 text-sm font-bold text-muted-foreground"><Lock className="h-4 w-4" /> Após a fase 1</span> : null}
      </div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-muted-foreground">{desc}</p>
      <div className="flex flex-wrap gap-2">{action}</div>
    </div>
  );
}

function Result({ title, r, footer, onRetry, busy }: { title: string; r: Resp; footer: React.ReactNode; onRetry: () => void; busy: boolean }) {
  const p = Number(r.planets);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">{title}</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4 rounded-3xl bg-card p-6 text-center shadow-soft">
          <p className="font-semibold text-muted-foreground">Se todas as pessoas vivessem como você, precisaríamos de</p>
          <Planets value={p} />
          <p className="text-sm text-muted-foreground">{p <= 1 ? "Uau! Seu estilo de vida cabe em um planeta. 💚" : "Temos só uma Terra — mas pequenas mudanças fazem muita diferença!"}</p>
        </div>
        <div className="rounded-3xl bg-card p-6 shadow-soft">
          <h2 className="mb-4 text-xl font-bold">De onde vem sua pegada</h2>
          <FootprintDonut breakdown={r.breakdown as Breakdown} />
        </div>
      </div>
      <Feedback text={r.ai_feedback} onRetry={onRetry} busy={busy} />
      {footer}
    </div>
  );
}

function CategoryBars({ breakdown }: { breakdown: Breakdown }) {
  return (
    <div className="space-y-2">
      {(Object.keys(breakdown) as Category[]).map((k) => (
        <div key={k}>
          <div className="flex justify-between text-xs font-semibold"><span>{CATEGORY_LABEL[k]}</span><span>{breakdown[k].toFixed(2)}</span></div>
          <div className="h-2.5 rounded-full bg-muted"><div className="h-full rounded-full" style={{ width: `${Math.min(100, (breakdown[k] / 1.25) * 100)}%`, background: CAT_COLOR[k] }} /></div>
        </div>
      ))}
    </div>
  );
}

function DiffBanner({ before, after }: { before: number; after: number }) {
  const d = Math.round((before - after) * 10) / 10;
  return (
    <div className="rounded-3xl bg-hero p-6 text-center text-primary-foreground shadow-soft">
      <p className="text-2xl font-extrabold font-display">
        {d > 0 ? `Você reduziu ${d.toFixed(1)} Terra${d >= 2 ? "s" : ""}! 🎉` : d === 0 ? "Sua pegada se manteve — e sua reflexão evoluiu! 🌱" : "Sua pegada aumentou um pouco. Vamos pensar juntos no porquê? 🤔"}
      </p>
      <p className="opacity-90">{before.toFixed(1)} → {after.toFixed(1)} Terras</p>
    </div>
  );
}
