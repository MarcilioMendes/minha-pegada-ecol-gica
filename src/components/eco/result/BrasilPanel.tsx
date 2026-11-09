import { STAGE_COLOR } from "@/components/eco/FootprintChart";
import { BRASIL, CLASS_SIZE, nf, SEEG, type CarbonBreakdown, type Stage } from "@/lib/carbon";
import type { ClassAggregate } from "@/lib/footprint";
import { StatCard } from "./StatCard";

type Props = { total: number; breakdown: CarbonBreakdown; cls: ClassAggregate };
type Row = { nome: string; cor: Stage; get: (b: CarbonBreakdown) => number; br: number; brNome: string; br2?: number; br2Nome?: string };

const ROWS: Row[] = [
  { nome: "Alimentação", cor: "alimentacao", get: (b) => b.alimentacao, br: BRASIL.agro, brNome: "Agropecuária", br2: BRASIL.agro + BRASIL.usoTerra, br2Nome: "Agropecuária + uso da terra" },
  { nome: "Transporte + aviação + energia", cor: "transporte", get: (b) => b.transporte + b.aviacao + b.energia, br: BRASIL.energia, brNome: "Energia" },
  { nome: "Consumo", cor: "consumo", get: (b) => b.consumo, br: BRASIL.industria, brNome: "Processos industriais" },
  { nome: "Resíduos", cor: "residuos", get: (b) => b.residuos, br: BRASIL.residuos, brNome: "Resíduos" },
];

const perCapita = (t: number) => (t / SEEG.pop) * 1000;

export function BrasilPanel({ total, breakdown, cls }: Props) {
  return (
    <section className="space-y-5 rounded-3xl bg-card p-6 shadow-soft">
      <div>
        <h2 className="text-xl font-bold">🇧🇷 Eu × Brasil</h2>
        <p className="text-sm text-muted-foreground">Cada parte da sua pegada ao lado da parte de um brasileiro médio no setor parecido (SEEG 2025). “1,5×” quer dizer uma vez e meia o brasileiro médio.</p>
      </div>
      <div className="space-y-5">
        {ROWS.map((r) => {
          const me = r.get(breakdown);
          const avg = r.get(cls.avgStages);
          const lines: [string, number, string, number][] = [
            ["Você", me, STAGE_COLOR[r.cor], 1],
            ...(cls.k ? [["Média turma", avg, STAGE_COLOR[r.cor], 0.55] as [string, number, string, number]] : []),
            ["Brasileiro", r.br, "var(--muted-foreground)", 1],
            ...(r.br2 ? [["c/ uso terra", r.br2, "var(--muted-foreground)", 0.55] as [string, number, string, number]] : []),
          ];
          const max = Math.max(...lines.map((l) => l[1])) || 1;
          return (
            <div key={r.nome} className="space-y-1.5">
              <h3 className="font-bold">{r.nome}</h3>
              <p className="text-xs text-muted-foreground">
                você: {nf(me / r.br, 2)}× {r.brNome}
                {r.br2 && ` · ${nf(me / r.br2, 2)}× ${r.br2Nome}`}
                {cls.k > 0 && ` · turma: ${nf(avg / r.br, 2)}×`}
              </p>
              {lines.map(([label, v, color, opacity]) => (
                <div key={label} className="grid grid-cols-[5.5rem_minmax(0,1fr)_4.5rem] items-center gap-2 text-xs">
                  <span>{label}</span>
                  <div className="h-3 rounded-full bg-muted"><div className="h-full rounded-full" style={{ width: `${(v / max) * 100}%`, background: color, opacity }} /></div>
                  <span className="text-right font-bold">{nf(v, 0)} kg</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard label="Você × brasileiro médio" value={`${nf((total / BRASIL.bruto) * 100, 0)}%`} sub={`${nf(total, 0)} kg ÷ ${nf(BRASIL.bruto, 0)} kg (emissões brutas por habitante)`} />
        {cls.k > 0 && <StatCard label="A turma real equivale a" value={`${nf(cls.sum / BRASIL.bruto, 1)} brasileiros`} sub={`${nf(cls.sum, 0)} kg ÷ ${nf(BRASIL.bruto, 0)} kg`} />}
        <StatCard label="Turma como você equivale a" value={`${nf((CLASS_SIZE * total) / BRASIL.bruto, 1)} brasileiros`} sub={`${CLASS_SIZE} × ${nf(total, 0)} kg ÷ ${nf(BRASIL.bruto, 0)} kg`} />
        <StatCard label="Florestas brasileiras removeram" value={`${nf(BRASIL.remocoes, 0)} kg`} sub="por habitante em 2025, cerca de 1/3 das emissões brutas" />
      </div>
      <details>
        <summary className="cursor-pointer font-bold text-primary">Ver os números do Brasil</summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr><th className="p-2">Setor (SEEG 2025)</th><th className="p-2 text-right">t CO₂e no Brasil</th><th className="p-2 text-right">kg por habitante</th><th className="p-2 text-right">Parte das brutas</th></tr>
            </thead>
            <tbody>
              {SEEG.setores.map((s) => (
                <tr key={s.nome} className="border-t"><td className="p-2">{s.nome}</td><td className="p-2 text-right">{nf(s.t, 0)}</td><td className="p-2 text-right">{nf(perCapita(s.t), 0)}</td><td className="p-2 text-right">{nf((s.t / SEEG.brutas) * 100, 1)}%</td></tr>
              ))}
              {([["Emissões brutas", SEEG.brutas, "100%"], ["Remoções", SEEG.remocoes, "—"], ["Emissões líquidas", SEEG.liquidas, "—"]] as [string, number, string][]).map(([nome, t, p]) => (
                <tr key={nome} className="border-t font-bold"><td className="p-2">{nome}</td><td className="p-2 text-right">{nf(t, 0)}</td><td className="p-2 text-right">{nf(perCapita(t), 0)}</td><td className="p-2 text-right">{p}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <p className="text-xs text-muted-foreground">O SEEG mede o que é emitido no território brasileiro, inclusive carne e soja exportadas; o questionário mede o consumo de um estudante. Escola, hospitais e estradas ficam fora do questionário, mas entram na média do Brasil. População usada: 213,4 milhões (a confirmar no IBGE).</p>
    </section>
  );
}
