import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  CARBON_QUESTIONS, STAGE_LABEL, CELEBRITIES, CLASS_SIZE, formatKg, timeEquivalent,
  type CarbonBreakdown,
} from "@/lib/carbon";
import type { ClassAggregate, EcoResult } from "@/lib/footprint";
import { ScorePanel } from "@/components/eco/result/ScorePanel";
import { EcoPanel } from "@/components/eco/result/EcoPanel";
import { ClassPanel } from "@/components/eco/result/ClassPanel";
import { BrasilPanel } from "@/components/eco/result/BrasilPanel";

export function CarbonQuiz({ initial, busy, onSubmit }: { initial?: Record<string, number> | undefined; busy: boolean; onSubmit: (a: Record<string, number>) => void }) {
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
          <Button size="lg" className="rounded-full" disabled={!done || busy} onClick={() => onSubmit(answers)}>{busy ? "Calculando e pensando no seu feedback..." : "Ver minha pegada de carbono 🌎"}</Button>
        ) : (
          <Button size="lg" className="rounded-full" disabled={!done} onClick={() => setStep((s) => s + 1)}>Próxima <ArrowRight /></Button>
        )}
      </div>
    </div>
  );
}

export function CarbonResult({ total, breakdown, eco, cls }: { total: number; breakdown: CarbonBreakdown; eco: EcoResult; cls: ClassAggregate }) {
  const [celeb, setCeleb] = useState(0);
  const c = CELEBRITIES[celeb]!;
  const b = breakdown;
  return (
    <div className="space-y-6">
      <ScorePanel total={total} breakdown={breakdown} planets={eco.planets} />
      <EcoPanel eco={eco} />
      <ClassPanel total={total} breakdown={breakdown} planets={eco.planets} cls={cls} />

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
          <Compare label="A turma real levaria" value={cls.k ? timeEquivalent(c.kg, cls.sum) : "—"} sub={`${cls.k} resposta(s): ${formatKg(cls.sum)}/ano`} />
        </div>
        <p className="text-sm text-muted-foreground">
          Comparação justa (mesmo recorte, só voos): sua aviação é {formatKg(b.aviacao)}/ano
          {b.aviacao > 0 ? ` — levaria ${timeEquivalent(c.kg, b.aviacao)} para igualar.` : " — você não voou, então nunca chegaria lá."}
        </p>
      </div>

      <BrasilPanel total={total} breakdown={breakdown} cls={cls} />
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
