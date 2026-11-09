import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { PERCEPTION_QUESTIONS } from "@/lib/footprint";
import { ArrowLeft, ArrowRight, Leaf } from "lucide-react";

type Props = {
  phase: "pre" | "post";
  initialPerception?: string[] | undefined;
  previousPerception?: string[] | undefined;
  onSubmit: (perception: string[]) => Promise<void>;
  busy: boolean;
  imported?: boolean;
};

export function Questionnaire({ phase, initialPerception, previousPerception, onSubmit, busy, imported }: Props) {
  const steps = PERCEPTION_QUESTIONS.length;
  const [step, setStep] = useState(0);
  const [perception, setPerception] = useState<string[]>(initialPerception ?? PERCEPTION_QUESTIONS.map(() => ""));
  const canNext = (perception[step] ?? "").trim().length >= 3;
  const last = step === steps - 1;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {imported && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">
          <span>📋 Trouxemos as respostas que você já deu na atividade anterior. Leia, ajuste se quiser e salve.</span>
          <Button size="sm" variant="outline" className="rounded-full" disabled={busy} onClick={() => onSubmit(perception)}>Confirmar e salvar <ArrowRight /></Button>
        </div>
      )}
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-semibold text-muted-foreground">
          <span>Percepção Ambiental</span>
          <span>{step + 1} / {steps}</span>
        </div>
        <Progress value={((step + 1) / steps) * 100} />
      </div>

      <div key={step} className="animate-in fade-in slide-in-from-right-4 rounded-3xl bg-card p-6 shadow-soft sm:p-8">
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
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}><ArrowLeft /> Voltar</Button>
        {last ? (
          <Button size="lg" className="rounded-full" disabled={!canNext || busy} onClick={() => onSubmit(perception)}>
            {busy ? "Salvando..." : "Salvar minha reflexão 💚"}
          </Button>
        ) : (
          <Button size="lg" className="rounded-full" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>Próxima <ArrowRight /></Button>
        )}
      </div>
    </div>
  );
}
