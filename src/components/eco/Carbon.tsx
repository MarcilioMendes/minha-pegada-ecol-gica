import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CARBON_QUESTIONS, STAGE_LABEL, type CarbonBreakdown } from "@/lib/carbon";
import type { ClassAggregate, EcoResult } from "@/lib/footprint";
import { ScorePanel } from "@/components/eco/result/ScorePanel";
import { EcoPanel } from "@/components/eco/result/EcoPanel";
import { ClassPanel } from "@/components/eco/result/ClassPanel";
import { BrasilPanel } from "@/components/eco/result/BrasilPanel";
import { CelebPanel } from "@/components/eco/result/CelebPanel";
import { ContasPanel } from "@/components/eco/result/ContasPanel";

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
          <span>Etapa 2 · Calculadora da pegada · {q.stage === "contexto" ? "Sobre sua casa" : STAGE_LABEL[q.stage]}</span>
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
          <Button size="lg" className="rounded-full" disabled={!done || busy} onClick={() => onSubmit(answers)}>{busy ? "Calculando e pensando no seu feedback..." : "Ver minha pegada 🌎"}</Button>
        ) : (
          <Button size="lg" className="rounded-full" disabled={!done} onClick={() => setStep((s) => s + 1)}>Próxima <ArrowRight /></Button>
        )}
      </div>
    </div>
  );
}

export function CarbonResult({ answers, total, breakdown, eco, cls, feedback }: { answers: Record<string, number>; total: number; breakdown: CarbonBreakdown; eco: EcoResult; cls: ClassAggregate; feedback: React.ReactNode }) {
  const [showCalc, setShowCalc] = useState(false);
  return (
    <div className="space-y-6">
      <ScorePanel total={total} breakdown={breakdown} planets={eco.planets} />
      <EcoPanel eco={eco} />
      <ClassPanel total={total} breakdown={breakdown} planets={eco.planets} cls={cls} />
      <CelebPanel total={total} breakdown={breakdown} cls={cls} showCalc={showCalc} />
      <BrasilPanel total={total} breakdown={breakdown} cls={cls} />
      {feedback}
      <ContasPanel answers={answers} eco={eco} open={showCalc} onToggle={() => setShowCalc((v) => !v)} />
    </div>
  );
}
