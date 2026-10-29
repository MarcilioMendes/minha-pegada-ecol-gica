import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  CARBON_QUESTIONS, STAGE_LABEL, CELEBRITIES, BRASIL, CLASS_SIZE, formatKg, timeEquivalent,
  type CarbonBreakdown, type Stage,
} from "@/lib/carbon";

const STAGE_COLOR: Record<Stage, string> = {
  alimentacao: "var(--chart-1)", transporte: "var(--chart-2)", aviacao: "var(--chart-5)",
  energia: "var(--chart-3)", consumo: "var(--chart-4)", residuos: "var(--muted-foreground)",
};

export function CarbonQuiz({ initial, busy, onSubmit }: { initial?: Record<string, number>; busy: boolean; onSubmit: (a: Record<string, number>) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>(initial ?? {});
  const q = CARBON_QUESTIONS[step]!;
  const last = step === CARBON_QUESTIONS.length - 1;
  const done = answers[q.id] !== undefined;
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-semibold text-muted-foreground">
          <span>Calculadora de carbono · {q.stage === "contexto" ? "Contexto" : STAGE_LABEL[q.stage]}</span>
          <span>{step + 1} / {CARBON_QUESTIONS.length}</span>
        </div>
        <Progress value={((step + 1) / CARBON_QUESTIONS.length) * 100} />
      </div>
      <div key={step} className="animate-in fade-in slide-in-from-right-4 rounded-3xl bg-card p-6 shadow-soft sm:p-8">
        <div className="mb-3 text-5xl">{q.emoji}</div>
        <h2 className="mb-2 text-2xl font-bold">{q.text}</h2>
        {q.note && <p className="mb-4 text-sm text-muted-foreground">{q.note}</p>}
        <div className="mt-4 grid gap-3">
          {q.options.map((label, i) => {
            const sel = answers[q.id] === i;
            return (
              <button key={label}
                onClick={() => { setAnswers((a) => ({ ...a, [q.id]: i })); if (!last) setTimeout(() => setStep((s) => s + 1), 180); }}
                className={`rounded-2xl border-2 px-4 py-3 text-left font-semibold transition-all ${sel ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:-translate-y-0.5 hover:border-primary/50"}`}>
                <span className="mr-2 text-muted-foreground">{"ABCD"[i]})</span>{label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex justify-between">
        <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}><ArrowLeft /> Voltar</Button>
        {last ? (
          <Button size="lg" className="rounded-full" disabled={!done || busy} onClick={() => onSubmit(answers)}>{busy ? "Calculando..." : "Ver minha pegada de carbono 🌎"}</Button>
        ) : (
          <Button size="lg" className="rounded-full" disabled={!done} onClick={() => setStep((s) => s + 1)}>Próxima <ArrowRight /></Button>
        )}
      </div>
    </div>
  );
}

export function CarbonResult({ total, breakdown, classK, classSum }: { total: number; breakdown: CarbonBreakdown; classK: number; classSum: number }) {
  const [celeb, setCeleb] = useState(0);
  const c = CELEBRITIES[celeb]!;
  const stages = Object.keys(breakdown) as Stage[];
  const avg = classK ? classSum / classK : 0;
  const share = classSum ? (total / classSum) * 100 : 0;
  const est = classK && classK < CLASS_SIZE ? (classSum * CLASS_SIZE) / classK : null;
  const b = breakdown;
  const brRows: [string, number, number][] = [
    ["Alimentação × Agropecuária", b.alimentacao, BRASIL.agro],
    ["Alimentação × Agropecuária + Uso da terra", b.alimentacao, BRASIL.agro + BRASIL.usoTerra],
    ["Transporte + Aviação + Energia × Energia", b.transporte + b.aviacao + b.energia, BRASIL.energia],
    ["Consumo × Processos industriais", b.consumo, BRASIL.industria],
    ["Resíduos × Resíduos", b.residuos, BRASIL.residuos],
    ["Total × Emissões brutas", total, BRASIL.bruto],
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-3 rounded-3xl bg-hero p-6 text-center text-primary-foreground shadow-soft">
          <p className="font-semibold opacity-90">Sua pegada de carbono estimada é</p>
          <p className="font-display text-5xl font-extrabold">{formatKg(total)}</p>
          <p className="opacity-90">de CO₂e por ano</p>
          <p className="text-xs opacity-80">É uma ordem de grandeza, não uma medição exata.</p>
        </div>
        <div className="space-y-3 rounded-3xl bg-card p-6 shadow-soft">
          <h2 className="text-xl font-bold">De onde vem</h2>
          <div className="flex h-4 overflow-hidden rounded-full">
            {stages.map((s) => <div key={s} style={{ width: `${(b[s] / (total || 1)) * 100}%`, background: STAGE_COLOR[s] }} />)}
          </div>
          <ul className="space-y-1.5 text-sm">
            {stages.map((s) => (
              <li key={s} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
                <span className="h-3 w-3 rounded-full" style={{ background: STAGE_COLOR[s] }} />
                <span className="flex-1 font-semibold">{STAGE_LABEL[s]}</span>
                <span>{formatKg(b[s])}</span>
                <span className="w-10 text-right text-muted-foreground">{Math.round((b[s] / (total || 1)) * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-4 rounded-3xl bg-card p-6 shadow-soft">
        <h2 className="text-xl font-bold">✈️ Comparar com uma celebridade</h2>
        <div className="flex flex-wrap gap-2">
          {CELEBRITIES.map((x, i) => (
            <Button key={x.name} size="sm" variant={i === celeb ? "default" : "outline"} className="rounded-full" onClick={() => setCeleb(i)}>{x.name}</Button>
          ))}
        </div>
        <div className="rounded-2xl bg-muted p-4 text-sm">
          <p><b>{c.name}</b>: {formatKg(c.kg)} de CO₂ — {c.what}.</p>
          <p className="text-muted-foreground">Período: {c.period}{c.trip ? " · valor de uma viagem, não de um ano" : ""}. Só voos.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Compare label="Você levaria" value={timeEquivalent(c.kg, total)} sub="para emitir o mesmo, com tudo que você faz" />
          <Compare label="Se a turma toda fosse como você" value={timeEquivalent(c.kg, total * CLASS_SIZE)} sub={`${CLASS_SIZE} alunos × ${formatKg(total)}`} />
          <Compare label="A turma real levaria" value={classK ? timeEquivalent(c.kg, classSum) : "—"} sub={`${classK} resposta(s): ${formatKg(classSum)}/ano`} />
        </div>
        <p className="text-sm text-muted-foreground">
          Comparação justa (mesmo recorte, só voos): sua aviação é {formatKg(b.aviacao)}/ano
          {b.aviacao > 0 ? ` — levaria ${timeEquivalent(c.kg, b.aviacao)} para igualar.` : " — você não voou, então nunca chegaria lá."}
        </p>
        {est && <p className="text-xs text-muted-foreground">Ainda faltam respostas: a turma completa ({CLASS_SIZE} alunos) é estimada em {formatKg(est)}/ano.</p>}
      </div>

      <div className="space-y-4 rounded-3xl bg-card p-6 shadow-soft">
        <h2 className="text-xl font-bold">🇧🇷 Você × brasileiro médio (SEEG 2025)</h2>
        <div className="space-y-2">
          {brRows.map(([label, me, br]) => (
            <div key={label}>
              <div className="flex justify-between text-sm"><span className="font-semibold">{label}</span><span>{formatKg(me)} vs {formatKg(br)} · <b>{(me / br).toFixed(2)}×</b></span></div>
              <div className="h-2.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (me / br) * 100)}%` }} /></div>
            </div>
          ))}
        </div>
        {classK > 0 && (
          <p className="text-sm">Você é <b>{share.toFixed(1)}%</b> da turma; a média é {formatKg(avg)} ({total >= avg ? "+" : "−"}{formatKg(Math.abs(total - avg))}). Juntos, vocês emitem o mesmo que <b>{(classSum / BRASIL.bruto).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} brasileiros médios</b>.</p>
        )}
        <p className="text-xs text-muted-foreground">A floresta brasileira removeu {formatKg(BRASIL.remocoes)} por habitante em 2025. O questionário não inclui escola, saúde e serviços públicos, por isso costuma ficar abaixo de 9,6 t.</p>
      </div>
    </div>
  );
}

function Compare({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border-2 border-border p-4 text-center">
      <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-extrabold text-primary">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
