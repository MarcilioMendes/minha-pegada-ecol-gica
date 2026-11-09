import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { teacherLogin, teacherOverview, teacherAddStudents, teacherResetPin, teacherCarbon } from "@/lib/api.functions";
import { AREA_LABEL, PERCEPTION_QUESTIONS, aggregateClass, type Area } from "@/lib/footprint";
import { Planets, FootprintDonut, AREA_COLOR } from "@/components/eco/FootprintChart";
import { formatKg, STAGE_LABEL, CARBON_QUESTIONS, CELEBS, topKey, type Stage } from "@/lib/carbon";
import { Feedback } from "@/components/eco/Feedback";
import { Download, LogOut, UserPlus, Check, Minus } from "lucide-react";

export const Route = createFileRoute("/professor")({
  head: () => ({
    meta: [
      { title: "Painel do Professor · Pegada Ecológica" },
      { name: "description", content: "Acompanhe a Turma 81: percepção, calculadora, métricas da turma e exportação CSV." },
      { property: "og:title", content: "Painel do Professor · Pegada Ecológica" },
      { property: "og:description", content: "Painel de acompanhamento da turma na atividade de Pegada Ecológica." },
    ],
  }),
  component: Professor,
});

type Overview = Awaited<ReturnType<typeof teacherOverview>>;
const items = (p: unknown) => (p as { items?: string[] })?.items ?? [];

function Professor() {
  const loginFn = useServerFn(teacherLogin);
  const overviewFn = useServerFn(teacherOverview);
  const addFn = useServerFn(teacherAddStudents);
  const resetFn = useServerFn(teacherResetPin);
  const [token, setToken] = useState<string | null>(null);
  const [pw, setPw] = useState("");
  const [data, setData] = useState<Overview | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const [newList, setNewList] = useState("");
  const carbonFn = useServerFn(teacherCarbon);
  const [carbon, setCarbon] = useState<Awaited<ReturnType<typeof teacherCarbon>>>([]);

  const load = useCallback(async (t: string) => {
    try { setData(await overviewFn({ data: { token: t } })); setCarbon(await carbonFn({ data: { token: t } })); }
    catch { localStorage.removeItem("pe_teacher"); setToken(null); }
  }, [overviewFn, carbonFn]);

  useEffect(() => {
    const t = localStorage.getItem("pe_teacher");
    if (t) { setToken(t); load(t); }
  }, [load]);

  const stats = useMemo(() => {
    if (!data) return null;
    const pre = data.responses.filter((r) => r.phase === "pre");
    const cls = aggregateClass(carbon);
    return { pre, cls, top: cls.k ? topKey(cls.avgStages) : null };
  }, [data, carbon]);

  function exportCsv() {
    if (!data) return;
    const stages = Object.keys(STAGE_LABEL) as Stage[];
    const areas = Object.keys(AREA_LABEL) as Area[];
    const head = ["pseudonimo", "turma", ...PERCEPTION_QUESTIONS.map((_, i) => `percepcao_${i + 1}`), "co2_total_kg", ...stages.map((k) => STAGE_LABEL[k]), "gha", "terras", ...areas.map((k) => AREA_LABEL[k]), ...CARBON_QUESTIONS.map((q) => q.id.toUpperCase()), "feedback_ia"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const num = (v: number | undefined) => (v === undefined ? "" : String(v).replace(".", ","));
    const lines = [head.map(esc).join(";")];
    data.students.forEach((s) => {
      const pre = data.responses.find((r) => r.student_id === s.id && r.phase === "pre");
      const c = carbon.find((x) => x.student_id === s.id);
      lines.push([s.pseudonym, s.class_name,
        ...PERCEPTION_QUESTIONS.map((_, i) => pre ? items(pre.perception)[i] : ""),
        num(c?.total), ...stages.map((k) => num(c?.breakdown[k])),
        num(c?.eco.gha), num(c?.eco.planets), ...areas.map((k) => num(c?.eco.byArea[k])),
        ...CARBON_QUESTIONS.map((q) => (c ? q.options[c.answers[q.id] ?? -1] : "")),
        pre?.feedback].map(esc).join(";"));
    });
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url; el.download = `pegada-ecologica-turma81-${new Date().toISOString().slice(0, 10)}.csv`; el.click();
    URL.revokeObjectURL(url);
  }

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <form className="w-full max-w-sm space-y-4 rounded-3xl bg-card p-8 shadow-soft" onSubmit={async (e) => {
          e.preventDefault();
          try { const r = await loginFn({ data: { password: pw } }); localStorage.setItem("pe_teacher", r.token); setToken(r.token); load(r.token); }
          catch (err) { toast.error((err as Error).message); }
        }}>
          <h1 className="text-2xl font-extrabold">👩‍🏫 Acesso do Professor</h1>
          <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Senha administrativa" className="h-12 rounded-xl" />
          <Button type="submit" className="h-11 w-full rounded-full">Entrar</Button>
          <Link to="/" className="block text-center text-sm text-muted-foreground underline">Voltar</Link>
        </form>
      </main>
    );
  }

  if (!data || !stats) return <div className="flex min-h-screen items-center justify-center text-4xl animate-pulse">🌱</div>;
  const selStudent = data.students.find((s) => s.id === sel);
  const selPre = data.responses.find((r) => r.student_id === sel && r.phase === "pre");

  return (
    <main className="min-h-screen pb-16">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="font-display text-xl font-extrabold text-primary">Painel · Turma 81</span>
          <div className="flex gap-2">
            <Button onClick={exportCsv}><Download /> Exportar CSV</Button>
            <Button variant="ghost" onClick={() => { localStorage.removeItem("pe_teacher"); setToken(null); setData(null); }}><LogOut /></Button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl space-y-6 px-4 pt-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Responderam percepção" value={`${stats.pre.length}/${data.students.length}`} />
          <Stat label="Responderam calculadora" value={`${stats.cls.k}/${data.students.length}`} />
          <Stat label="Média de Terras" value={stats.cls.k ? stats.cls.avgPlanets.toFixed(1) : "—"} />
          <Stat label="Etapa de maior impacto" value={stats.top ? STAGE_LABEL[stats.top] : "—"} />
        </div>

        {carbon.length > 0 && (() => {
          const sum = carbon.reduce((a, c) => a + c.total, 0);
          const st = Object.keys(STAGE_LABEL) as Stage[];
          return (
            <div className="space-y-3 rounded-3xl bg-card p-6 shadow-soft">
              <h2 className="text-xl font-bold">🌎 Calculadora de carbono · {carbon.length} resposta(s)</h2>
              <p>Turma: <b>{formatKg(sum)}</b> CO₂e/ano · média <b>{formatKg(sum / carbon.length)}</b> por aluno · equivale a {(sum / 9642).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} brasileiros médios.</p>
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {st.map((k) => <div key={k} className="rounded-xl bg-muted p-3 text-sm"><p className="font-semibold">{STAGE_LABEL[k]}</p><p>{formatKg(carbon.reduce((a, c) => a + c.breakdown[k], 0) / carbon.length)}</p></div>)}
              </div>
              <p className="text-sm text-muted-foreground">A turma levaria {(CELEBS.find((c) => c.id === "taylor")!.eventos[0]!.E / sum).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} anos para emitir o que o jato da Taylor Swift emitiu em ~200 dias de 2022.</p>
            </div>
          );
        })()}

        {stats.cls.k > 0 && (
          <div className="rounded-3xl bg-card p-6 shadow-soft">
            <h2 className="mb-4 text-xl font-bold">Pegada ecológica média da turma, por tipo de área</h2>
            <FootprintDonut data={stats.cls.avgAreas} labels={AREA_LABEL} colors={AREA_COLOR} unit="gha" />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="overflow-x-auto rounded-3xl bg-card shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left"><tr>
                <th className="p-3">Aluno</th><th className="p-3">PIN</th><th className="p-3">Percepção</th><th className="p-3">Calculadora</th><th className="p-3">CO₂/ano</th><th className="p-3">Terras</th><th className="p-3"></th>
              </tr></thead>
              <tbody>
                {data.students.map((s) => {
                  const pre = data.responses.find((r) => r.student_id === s.id && r.phase === "pre");
                  const c = carbon.find((x) => x.student_id === s.id);
                  return (
                    <tr key={s.id} className="border-t">
                      <td className="p-3 font-bold">{s.pseudonym}</td>
                      <td className="p-3">{s.hasPin ? <button className="text-xs text-muted-foreground underline" onClick={async () => { if (confirm(`Redefinir o PIN de ${s.pseudonym}? O aluno criará um novo no próximo acesso.`)) { await resetFn({ data: { token, studentId: s.id } }); toast.success("PIN redefinido"); load(token); } }}>redefinir</button> : <span className="text-xs text-muted-foreground">não criado</span>}</td>
                      <td className="p-3">{pre ? <Check className="h-4 w-4 text-primary" /> : <Minus className="h-4 w-4 text-muted-foreground" />}</td>
                      <td className="p-3">{c ? <Check className="h-4 w-4 text-primary" /> : <Minus className="h-4 w-4 text-muted-foreground" />}</td>
                      <td className="p-3">{c ? formatKg(c.total) : "—"}</td>
                      <td className="p-3">{c ? c.eco.planets.toFixed(1) : "—"}</td>
                      <td className="p-3">{(pre || s.seedPerception || c) && <Button size="sm" variant="outline" onClick={() => setSel(s.id)}>Ver</Button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="h-fit space-y-3 rounded-3xl bg-card p-6 shadow-soft">
            <h2 className="flex items-center gap-2 font-bold"><UserPlus className="h-5 w-5" /> Cadastrar alunos</h2>
            <p className="text-sm text-muted-foreground">Um pseudônimo por linha ou separados por vírgula (ex: A031, A032).</p>
            <Textarea value={newList} onChange={(e) => setNewList(e.target.value)} rows={4} />
            <Button className="w-full" onClick={async () => {
              try { const r = await addFn({ data: { token, pseudonyms: newList.split(/[\s,;]+/), className: "81" } }); toast.success(`${r.added} pseudônimo(s) processado(s)`); setNewList(""); load(token); }
              catch (e) { toast.error((e as Error).message); }
            }}>Adicionar</Button>
          </div>
        </div>
      </div>

      <Dialog open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader><DialogTitle>{selStudent?.pseudonym}</DialogTitle></DialogHeader>
          {selStudent?.seedPerception && (
            <section className="space-y-2 border-b pb-6">
              <h3 className="text-xl font-bold">Percepção importada da planilha</h3>
              {PERCEPTION_QUESTIONS.map((q, i) => (
                <div key={i} className="rounded-xl bg-muted p-3 text-sm"><p className="font-semibold">{q}</p><p className="whitespace-pre-line">{selStudent.seedPerception?.[i]}</p></div>
              ))}
            </section>
          )}
          {selPre && (
            <section className="space-y-2 border-b pb-6">
              <h3 className="text-xl font-bold">Percepção Ambiental</h3>
              {PERCEPTION_QUESTIONS.map((q, i) => (
                <div key={i} className="rounded-xl bg-muted p-3 text-sm"><p className="font-semibold">{q}</p><p className="whitespace-pre-line">{items(selPre.perception)[i]}</p></div>
              ))}
            </section>
          )}
          {(() => {
            const c = carbon.find((x) => x.student_id === sel);
            if (!c) return null;
            return (
              <section className="space-y-4 pb-6">
                <h3 className="text-xl font-bold">Calculadora de carbono · {formatKg(c.total)}/ano</h3>
                <div className="flex flex-wrap gap-2 text-sm">{(Object.keys(STAGE_LABEL) as Stage[]).map((k) => <span key={k} className="rounded-full bg-muted px-3 py-1">{STAGE_LABEL[k]}: {formatKg(c.breakdown[k])}</span>)}</div>
                <Planets value={c.eco.planets} size="sm" />
                <FootprintDonut data={c.eco.byArea} labels={AREA_LABEL} colors={AREA_COLOR} unit="gha" />
                <ul className="grid gap-1 text-sm sm:grid-cols-2">{CARBON_QUESTIONS.map((q) => <li key={q.id}><b>{q.id.toUpperCase()}:</b> {q.options[c.answers[q.id] ?? 0]}</li>)}</ul>
                <Feedback text={selPre?.feedback ?? null} />
              </section>
            );
          })()}
        </DialogContent>
      </Dialog>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-card p-5 shadow-soft">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold text-primary">{value}</p>
    </div>
  );
}
