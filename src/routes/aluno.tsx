import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getMyData, submitPhase, regenerateFeedback, getMyCarbon, submitCarbon } from "@/lib/api.functions";
import { CarbonQuiz, CarbonResult } from "@/components/eco/Carbon";
import { Questionnaire } from "@/components/eco/Questionnaire";
import { Feedback } from "@/components/eco/Feedback";
import { LogOut, CheckCircle2, Lock } from "lucide-react";

export const Route = createFileRoute("/aluno")({
  head: () => ({
    meta: [
      { title: "Minha jornada · Pegada Ecológica" },
      { name: "description", content: "Sua percepção ambiental e sua calculadora de carbono e pegada ecológica." },
      { property: "og:title", content: "Minha jornada · Pegada Ecológica" },
      { property: "og:description", content: "Reflita sobre o meio ambiente e descubra sua pegada de carbono e ecológica." },
    ],
  }),
  component: Aluno,
});

// A fase "Depois da Aula" volta quando for redesenhada sobre a calculadora.
const SHOW_POST_PHASE = false;

type View = "home" | "pre" | "post" | "carbon" | "result-carbon";
const items = (p: unknown) => (p as { items?: string[] })?.items ?? [];

function Aluno() {
  const nav = useNavigate();
  const fetchData = useServerFn(getMyData);
  const submit = useServerFn(submitPhase);
  const regen = useServerFn(regenerateFeedback);
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<Awaited<ReturnType<typeof getMyData>> | null>(null);
  const [view, setView] = useState<View>("home");
  const [busy, setBusy] = useState(false);
  const fetchCarbon = useServerFn(getMyCarbon);
  const sendCarbon = useServerFn(submitCarbon);
  const [carbon, setCarbon] = useState<Awaited<ReturnType<typeof getMyCarbon>> | null>(null);

  const load = useCallback(async (t: string) => {
    try { setData(await fetchData({ data: { token: t } })); setCarbon(await fetchCarbon({ data: { token: t } })); }
    catch { localStorage.removeItem("pe_student"); nav({ to: "/" }); }
  }, [fetchData, fetchCarbon, nav]);

  useEffect(() => {
    const t = localStorage.getItem("pe_student");
    if (!t) { nav({ to: "/" }); return; }
    setToken(t); load(t);
  }, [load, nav]);

  async function onSubmit(phase: "pre" | "post", perception: string[]) {
    if (!token) return;
    setBusy(true);
    try {
      await submit({ data: { token, phase, perception } });
      await load(token);
      setView("home");
      toast.success(phase === "pre" ? "Reflexão salva! Agora faça a Calculadora de Carbono. 🌎" : "Reflexão salva!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  }

  async function onCarbon(answers: Record<string, number>) {
    if (!token) return;
    setBusy(true);
    try { await sendCarbon({ data: { token, answers } }); await load(token); setView("result-carbon"); window.scrollTo({ top: 0, behavior: "smooth" }); }
    catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  }

  async function onRegen() {
    if (!token) return;
    setBusy(true);
    try { await regen({ data: { token } }); await load(token); }
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
              <PhaseCard n={1} title="Percepção Ambiental" desc="O que você pensa sobre o meio ambiente? Escreva com suas palavras." done={!!pre}
                action={pre ? <Button variant="outline" onClick={() => setView("pre")}>Ver/editar reflexão</Button> : <Button size="lg" onClick={() => setView("pre")}>Começar 🚀</Button>} />
              <PhaseCard n={2} title="Calculadora de Carbono e Pegada Ecológica" desc="Quanto CO₂ você emite por ano e quantas Terras seriam precisas? Compare com a turma, com famosos e com o Brasil." done={!!pre && !!carbon?.mine} locked={!pre}
                action={!pre ? <Button size="lg" disabled>Começar 🌎</Button>
                  : carbon?.mine ? <><Button onClick={() => setView("result-carbon")}>Ver resultado</Button><Button variant="outline" onClick={() => setView("carbon")}>Refazer</Button></>
                  : <Button size="lg" onClick={() => setView("carbon")}>Começar 🌎</Button>} />
              {SHOW_POST_PHASE && (
                <PhaseCard n={3} title="Depois da Aula" desc="Revisite sua reflexão depois da aula." done={!!post} locked={!pre}
                  action={<Button size="lg" disabled={!pre} onClick={() => setView("post")}>{post ? "Refazer" : "Começar 🌱"}</Button>} />
              )}
            </div>
          </div>
        )}

        {view === "pre" && <Questionnaire phase="pre" busy={busy} initialPerception={pre ? items(pre.perception) : data.seedPerception ?? undefined} imported={!pre && !!data.seedPerception} onSubmit={(p) => onSubmit("pre", p)} />}
        {view === "post" && <Questionnaire phase="post" busy={busy} previousPerception={pre ? items(pre.perception) : undefined} onSubmit={(p) => onSubmit("post", p)} />}

        {view === "carbon" && <CarbonQuiz busy={busy} initial={carbon?.mine?.answers} onSubmit={onCarbon} />}
        {view === "result-carbon" && carbon?.mine && (
          <div className="space-y-6">
            <h1 className="text-3xl font-extrabold">Sua pegada de carbono 🌎</h1>
            <CarbonResult total={carbon.mine.total} breakdown={carbon.mine.breakdown} classK={carbon.classK} classSum={carbon.classSum} />
            <Feedback text={data.feedback} onRetry={onRegen} busy={busy} />
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
          : locked ? <span className="flex items-center gap-1 text-sm font-bold text-muted-foreground"><Lock className="h-4 w-4" /> Após a percepção</span> : null}
      </div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-muted-foreground">{desc}</p>
      <div className="flex flex-wrap gap-2">{action}</div>
    </div>
  );
}
