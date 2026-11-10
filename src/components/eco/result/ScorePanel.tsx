import { Planets, STAGE_COLOR } from "@/components/eco/FootprintChart";
import { carEquivalent, nf, STAGE_LABEL, type CarbonBreakdown, type Stage } from "@/lib/carbon";

export function ScorePanel({ total, breakdown, planets }: { total: number; breakdown: CarbonBreakdown; planets: number }) {
  const stages = Object.keys(STAGE_LABEL) as Stage[];
  const car = carEquivalent(total);
  const pct = (kg: number) => (kg / (total || 1)) * 100;
  return (
    <section className="space-y-5 rounded-3xl bg-card p-6 shadow-soft">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col justify-center rounded-2xl bg-hero p-5 text-center text-primary-foreground">
          <p className="font-semibold opacity-90">Sua pegada de carbono</p>
          <p className="font-display text-5xl font-extrabold">{nf(total / 1000, 2)}</p>
          <p className="opacity-90">toneladas de CO₂e por ano</p>
        </div>
        <div className="rounded-2xl bg-muted p-5 text-center">
          <p className="mb-2 font-semibold text-muted-foreground">Sua pegada ecológica</p>
          <Planets value={planets} size="sm" />
        </div>
      </div>
      <div className="space-y-1 text-sm">
        <p className="text-muted-foreground">{nf(total, 0)} kg por ano · {nf(total / 365, 1)} kg por dia</p>
        <p>É como um carro rodando {nf(car.km, 0)} km, ou {nf(car.laps, 1)} voltas ao redor da Terra.</p>
        <p className="text-muted-foreground">CO₂e (CO₂ equivalente) junta todos os gases que esquentam o planeta, como o gás carbônico e o metano, numa medida só.</p>
      </div>
      <div>
        <h2 className="mb-2 text-xl font-bold">De onde vem</h2>
        <div className="flex h-4 overflow-hidden rounded-full bg-muted" aria-hidden>
          {stages.map((s) => <div key={s} style={{ width: `${pct(breakdown[s])}%`, background: STAGE_COLOR[s] }} />)}
        </div>
        <ul className="mt-3 space-y-1.5 text-sm">
          {stages.map((s) => (
            <li key={s} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: STAGE_COLOR[s] }} />
              <span className="flex-1 font-semibold">{STAGE_LABEL[s]}</span>
              <span>{nf(breakdown[s], 0)} kg</span>
              <span className="w-10 text-right text-muted-foreground">{nf(pct(breakdown[s]), 0)}%</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-muted-foreground">É uma estimativa, não uma medição exata. O avião aparece separado do transporte, como pedem as regras internacionais desse tipo de cálculo (norma ISO 14067).</p>
    </section>
  );
}
