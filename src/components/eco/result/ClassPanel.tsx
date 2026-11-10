import { STAGE_COLOR } from "@/components/eco/FootprintChart";
import { CLASS_SIZE, formatKg, nf, STAGE_LABEL, type CarbonBreakdown, type Stage } from "@/lib/carbon";
import { formatTerras, MIN_CLASS_K, type ClassAggregate } from "@/lib/footprint";
import { StatCard } from "./StatCard";

type Props = { total: number; breakdown: CarbonBreakdown; planets: number; cls: ClassAggregate };

export function ClassPanel({ total, breakdown, planets, cls }: Props) {
  const stages = Object.keys(STAGE_LABEL) as Stage[];
  const dif = total - cls.avg;
  return (
    <section className="space-y-5 rounded-3xl bg-card p-6 shadow-soft">
      <div>
        <h2 className="text-xl font-bold">👥 Eu × turma</h2>
        <p className="text-sm text-muted-foreground">A turma real é a soma de todo mundo que respondeu. Ninguém vê o resultado de cada colega, só o total e a sua parte. Nas barras, “Turma” é a média por aluno.</p>
      </div>
      {cls.k === 0 ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Se a turma fosse como eu" value={formatKg(CLASS_SIZE * total)} sub={`${CLASS_SIZE} × ${nf(total, 0)} kg`} />
          </div>
          <p className="rounded-2xl bg-muted p-4">Os números da turma aparecem quando pelo menos {MIN_CLASS_K} pessoas tiverem respondido, para ninguém descobrir o resultado de um colega.</p>
        </>
      ) : (
        <>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Se a turma fosse como eu" value={formatKg(CLASS_SIZE * total)} sub={`${CLASS_SIZE} × ${nf(total, 0)} kg`} />
          <StatCard label="Turma real" value={formatKg(cls.sum)} sub={`${cls.k} ${cls.k === 1 ? "resposta" : "respostas"}`} />
          <StatCard label="Média da turma" value={`${nf(cls.avg, 0)} kg`} sub="por aluno, por ano" />
          <StatCard label="Minha parte" value={`${nf(cls.sum ? (total / cls.sum) * 100 : 0, 1)}%`} sub="da soma da turma" />
          <StatCard label="Eu × média" value={`${dif >= 0 ? "+" : "−"}${nf(Math.abs(dif), 0)} kg`} sub={dif >= 0 ? "acima da média da turma" : "abaixo da média da turma"} />
          {cls.k < CLASS_SIZE && <StatCard label="Turma completa estimada" value={formatKg(cls.avg * CLASS_SIZE)} sub={`média × ${CLASS_SIZE} alunos`} />}
        </div>
        <p className="rounded-2xl bg-muted p-4">
          Em Terras: você, <b>{formatTerras(planets)}</b>; a média da turma, <b>{formatTerras(cls.avgPlanets)}</b>.
        </p>
        <div className="space-y-3">
          {stages.map((s) => {
            const max = Math.max(breakdown[s], cls.avgStages[s]) || 1;
            const lines: [string, number, number][] = [["Você", breakdown[s], 1], ["Turma", cls.avgStages[s], 0.55]];
            return (
              <div key={s}>
                <p className="text-sm font-semibold">{STAGE_LABEL[s]}</p>
                {lines.map(([label, v, opacity]) => (
                  <div key={label} className="grid grid-cols-[3.5rem_minmax(0,1fr)_4.5rem] items-center gap-2 text-xs">
                    <span>{label}</span>
                    <div className="h-2.5 rounded-full bg-muted"><div className="h-full rounded-full" style={{ width: `${(v / max) * 100}%`, background: STAGE_COLOR[s], opacity }} /></div>
                    <span className="text-right font-bold">{nf(v, 0)} kg</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        </>
      )}
    </section>
  );
}
