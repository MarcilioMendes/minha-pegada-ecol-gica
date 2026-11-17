import { Planets, STAGE_COLOR } from "@/components/eco/FootprintChart";
import { nf, STAGE_LABEL, type CarbonBreakdown, type Stage } from "@/lib/carbon";
import { formatTerras, MIN_CLASS_K, type ClassAggregate } from "@/lib/footprint";

const EXAMPLES: Record<Stage, string> = {
  alimentacao: "carne, leite, comida pronta e o que sobra no prato",
  transporte: "como você vai para a escola e os passeios de carro",
  aviacao: "as viagens de avião",
  energia: "banho, ar-condicionado, fogão, luzes e telas",
  consumo: "roupas, celular e coisas novas que vocês compram",
  residuos: "o lixo e a separação para reciclar",
};

const round1 = (v: number) => Math.round(v * 10) / 10;

export function planetsSentence(planets: number): string {
  const r = round1(planets);
  if (r > 1) return "Só existe uma Terra. Passar de 1 quer dizer que esse jeito de viver gasta mais do que o planeta consegue repor.";
  if (r === 1) return "Bem no limite: esse jeito de viver usa tudo o que o planeta consegue repor, sem sobrar nada.";
  return "Menos de 1 Terra: esse jeito de viver cabe no que o planeta consegue repor. 🎉";
}

export function SummaryPanel({ total, breakdown, planets, cls }: { total: number; breakdown: CarbonBreakdown; planets: number; cls: ClassAggregate }) {
  const stages = (Object.keys(STAGE_LABEL) as Stage[]).sort((a, b) => breakdown[b] - breakdown[a]);
  const pct = (s: Stage) => (breakdown[s] / (total || 1)) * 100;
  const top = stages[0]!;
  const mine = round1(planets), avg = round1(cls.avgPlanets);
  const rel = mine > avg ? "acima da média" : mine < avg ? "abaixo da média" : "bem na média";
  return (
    <section className="space-y-5 rounded-3xl bg-card p-6 shadow-soft">
      <div className="space-y-3 text-center">
        <p className="text-lg font-semibold">Se todo mundo vivesse como você, a gente precisaria de</p>
        <Planets value={planets} />
        <p className="mx-auto max-w-xl text-muted-foreground">{planetsSentence(planets)}</p>
        {cls.k >= MIN_CLASS_K && (
          <p className="font-semibold">A média da sua turma é {formatTerras(cls.avgPlanets)}. Você está {rel}.</p>
        )}
      </div>
      <div className="space-y-3">
        <h2 className="text-xl font-bold">O que mais pesa para você</h2>
        <p className="rounded-2xl bg-secondary p-4 text-secondary-foreground">
          O que mais pesa é <b>{STAGE_LABEL[top]}</b> ({nf(pct(top), 0)}% do total): {EXAMPLES[top]}. É aqui que uma mudança faz mais diferença.
        </p>
        <ul className="space-y-2 text-sm">
          {stages.map((s) => (
            <li key={s}>
              <div className="flex justify-between font-semibold"><span>{STAGE_LABEL[s]}</span><span>{nf(pct(s), 0)}%</span></div>
              <div className="h-2.5 rounded-full bg-muted"><div className="h-full rounded-full" style={{ width: `${pct(s)}%`, background: STAGE_COLOR[s] }} /></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
