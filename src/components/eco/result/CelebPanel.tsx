import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CELEBS, compareCeleb, nf, PERIOD_LABEL, whoCompares, type CarbonBreakdown, type CelebPeriod, type Perspective } from "@/lib/carbon";
import type { ClassAggregate } from "@/lib/footprint";

type Props = { total: number; breakdown: CarbonBreakdown; cls: ClassAggregate; showCalc: boolean };

const PERSPECTIVES: [Perspective, string][] = [["eu", "Eu"], ["como", "Se a turma fosse como eu"], ["turma", "Turma real"]];
const PERIODS = [1, 30.42, 365] as const;

function Chip({ active, disabled, onClick, children }: { active: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Button size="sm" variant={active ? "default" : "outline"} className="h-auto min-h-9 whitespace-normal rounded-full py-1.5" aria-pressed={active} disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  );
}

export function CelebPanel({ total, breakdown, cls, showCalc }: Props) {
  const [celebId, setCelebId] = useState("virginia");
  const [eventId, setEventId] = useState("bv");
  const [persp, setPersp] = useState<Perspective>("eu");
  const [period, setPeriod] = useState<CelebPeriod>("total");
  const [freqs, setFreqs] = useState<Record<string, number>>({});

  const celeb = CELEBS.find((c) => c.id === celebId)!;
  const ev = celeb.eventos.find((e) => e.id === eventId) ?? celeb.eventos[0]!;
  const key = `${celeb.id}-${ev.id}`;
  const freq = freqs[key];
  const shownPeriod = ev.unico ? "total" : period;
  const who = whoCompares(persp, total, breakdown.aviacao, { k: cls.k, sum: cls.sum, aviacaoAvg: cls.avgStages.aviacao });
  const result = compareCeleb(celeb.nome, ev, shownPeriod, freq, who, persp);
  const unidade = ev.unidade ?? "viagens";

  return (
    <section className="space-y-5 rounded-3xl bg-card p-6 shadow-soft">
      <div>
        <h2 className="text-xl font-bold">✈️ Eu × famosos</h2>
        <p className="text-sm text-muted-foreground">Escolha um famoso, quem vai comparar e o período. Os números dos famosos são só dos voos de jatinho ou helicóptero deles.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CELEBS.map((c) => <Chip key={c.id} active={c.id === celeb.id} onClick={() => { setCelebId(c.id); setEventId(c.eventos[0]!.id); }}>{c.nome}</Chip>)}
      </div>
      {celeb.eventos.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {celeb.eventos.map((e) => <Chip key={e.id} active={e.id === ev.id} onClick={() => setEventId(e.id)}>{e.rotulo}</Chip>)}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-bold uppercase text-muted-foreground">Quem compara</p>
        <div className="flex flex-wrap gap-2">
          {PERSPECTIVES.map(([p, label]) => <Chip key={p} active={p === persp} onClick={() => setPersp(p)}>{label}</Chip>)}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold uppercase text-muted-foreground">Período de {celeb.nome}</p>
        <div className="flex flex-wrap gap-2">
          <Chip active={shownPeriod === "total"} onClick={() => setPeriod("total")}>{ev.dias ? "Período registrado" : "1 viagem"}</Chip>
          {PERIODS.map((p) => <Chip key={p} active={shownPeriod === p} disabled={!!ev.unico} onClick={() => setPeriod(p)}>{PERIOD_LABEL[p]}</Chip>)}
        </div>
      </div>

      {ev.freq != null && (
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="celeb-freq" className="text-sm font-bold">{unidade[0]!.toUpperCase() + unidade.slice(1)} por mês (suposição)</label>
          <Input id="celeb-freq" type="number" min={0} max={120} step={1} className="w-24 rounded-xl" value={freq ?? ev.freq}
            onChange={(e) => { const v = parseFloat(e.target.value); setFreqs((m) => ({ ...m, [key]: v >= 0 && v <= 120 ? v : 0 })); }} />
          <span className="text-xs text-muted-foreground">O registro é de 1 viagem. A frequência real não foi informada; ajuste para ver o efeito.</span>
        </div>
      )}

      {result.notes.length > 0 && <p className="text-sm">{result.notes.join(" ")}</p>}

      {result.kind === "empty" ? (
        <p className="rounded-2xl bg-secondary p-5 font-display text-xl font-bold text-secondary-foreground">{result.message}</p>
      ) : (
        <>
          <p className="rounded-2xl bg-secondary p-5 font-display text-2xl font-bold text-secondary-foreground">
            {result.before}<span className="text-primary">{result.highlight}</span>{result.after}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {result.cards.map((c) => (
              <div key={c.q} className="flex flex-col gap-2 rounded-2xl border-2 border-border p-4">
                <p className="text-sm">{c.q}</p>
                <p className="font-display text-2xl font-extrabold text-primary">{c.a}</p>
                {showCalc && <p className="break-words text-xs text-muted-foreground">{c.calc}</p>}
              </div>
            ))}
          </div>
        </>
      )}

      <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
        {celeb.nome}: {nf(ev.E, ev.E % 1 ? 1 : 0)} kg de CO₂ — {ev.desc}. Fonte: {ev.fonte}
      </p>
    </section>
  );
}
