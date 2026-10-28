import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { QUESTIONS, PERCEPTION_QUESTIONS, CATEGORY_LABEL } from "@/lib/footprint";
import { ArrowLeft, ArrowRight, Leaf } from "lucide-react";

type Props = {
  phase: "pre" | "post";
  initialPerception?: string[] | undefined;
  initialAnswers?: Record<string, number> | undefined;
  previousPerception?: string[] | undefined;
  onSubmit: (perception: string[], answers: Record<string, number>) => Promise<void>;
  busy: boolean;
};

export function Questionnaire({ phase, initialPerception, initialAnswers, previousPerception, onSubmit, busy }: Props) {
  const steps = PERCEPTION_QUESTIONS.length + QUESTIONS.length;
  const [step, setStep] = useState(0);
  const [perception, setPerception] = useState<string[]>(initialPerception ?? PERCEPTION_QUESTIONS.map(() => ""));
  const [answers, setAnswers] = useState<Record<string, number>>(initialAnswers ?? {});
  const isPerc = step < PERCEPTION_QUESTIONS.length;
  const q = isPerc ? null : QUESTIONS[step - PERCEPTION_QUESTIONS.length];
  const canNext = isPerc ? perception[step].trim().length >= 3 : answers[q!.id] !== undefined;
  const last = step === steps - 1;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-semibold text-muted-foreground">
          <span>{isPerc ? "Parte 1 · Percepção Ambiental" : `Parte 2 · ${CATEGORY_LABEL[q!.category]}`}</span>
          <span>{step + 1} / {steps}</span>
        </div>
        <Progress value={((step + 1) / steps) * 100} />
      </div>

      <div key={step} className="animate-in fade-in slide-in-from-right-4 rounded-3xl bg-card p-6 shadow-soft sm:p-8">
        {isPerc ? (
          <>
            <Leaf className="mb-3 h-8 w-8 text-primary" />
            <h2 className="mb-4 text-2xl font-bold">{PERCEPTION_QUESTIONS[step]}</h2>
            {phase === "post" && previousPerception?.[step] && (
              <p className="mb-3 rounded-xl bg-secondary p-3 text-sm text-secondary-foreground">
                <b>Antes você escreveu:</b> “{previousPerception[step]}”. Depois da aula, o que mudou no seu jeito de pensar?
              </p>
            )}
            <Textarea
              rows={5}
              value={perception[step]}
              onChange={(e) => setPerception((p) => p.map((v, i) => (i === step ? e.target.value : v)))}
              placeholder="Escreva com suas palavras... não existe resposta errada 💚"
              className="rounded-2xl text-base"
            />
          </>
        ) : (
          <>
            <div className="mb-3 text-5xl">{q!.emoji}</div>
            <h2 className="mb-5 text-2xl font-bold">{q!.text}</h2>
            <div className="grid gap-3">
              {q!.options.map((o) => {
                const sel = answers[q!.id] === o.score;
                return (
                  <button
                    key={o.label}
                    onClick={() => { setAnswers((a) => ({ ...a, [q!.id]: o.score })); if (!last) setTimeout(() => setStep((s) => s + 1), 180); }}
                    className={`rounded-2xl border-2 px-4 py-3 text-left font-semibold transition-all ${sel ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:border-primary/50 hover:-translate-y-0.5"}`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}><ArrowLeft /> Voltar</Button>
        {last ? (
          <Button size="lg" className="rounded-full" disabled={!canNext || busy} onClick={() => onSubmit(perception, answers)}>
            {busy ? "Calculando e pensando no seu feedback..." : "Ver meu resultado 🌍"}
          </Button>
        ) : (
          <Button size="lg" className="rounded-full" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>Próxima <ArrowRight /></Button>
        )}
      </div>
    </div>
  );
}
