import { ALTERNATIVES, CARBON_QUESTIONS, explainCarbon, nf, STAGE_LABEL } from "@/lib/carbon";
import { BASE_GHA, BIOCAP_MUNDIAL, formatTerras, GHA_PER_T_CO2, type EcoResult } from "@/lib/footprint";

type Props = { answers: Record<string, number>; eco: EcoResult; open: boolean; onToggle: () => void };

const fmt = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

export function ContasPanel({ answers, eco, open, onToggle }: Props) {
  return (
    <div className="space-y-3">
      <button onClick={onToggle} aria-expanded={open} className="text-sm font-semibold text-muted-foreground underline">
        {open ? "Esconder as contas" : "Mostrar as contas"}
      </button>
      {open && (
        <section className="space-y-5 rounded-3xl bg-card p-6 text-sm shadow-soft">
          <div className="space-y-2">
            <h2 className="text-xl font-bold">🧮 As contas</h2>
            <p className="text-muted-foreground">Cada etapa em kg CO₂e por ano, com os valores das suas respostas.</p>
            <ul className="space-y-1.5">
              {explainCarbon(answers).map((l) => <li key={l.stage} className="break-words rounded-lg bg-muted px-3 py-1.5"><b>{STAGE_LABEL[l.stage]}:</b> {l.formula}</li>)}
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold">Pegada ecológica</h3>
            <ul className="space-y-1.5">
              <li className="rounded-lg bg-muted px-3 py-1.5"><b>Carbono:</b> 1 tonelada de CO₂ da queima de combustíveis = (1 − 0,28) ÷ 2,68 × 1,26 = {nf(GHA_PER_T_CO2, 3)} gha. Resíduos e metano ficam fora, porque a Global Footprint Network, que criou o método da pegada ecológica, só conta o CO₂.</li>
              <li className="rounded-lg bg-muted px-3 py-1.5"><b>Cultivo e pastagem:</b> m² ÷ 10.000 × fator de equivalência (cultivo 2,51; pastagem 0,46).</li>
              <li className="rounded-lg bg-muted px-3 py-1.5"><b>Parte compartilhada:</b> {nf(BASE_GHA, 2)} gha, igual para todos (governo e infraestrutura).</li>
              <li className="rounded-lg bg-muted px-3 py-1.5"><b>Terras:</b> {nf(eco.gha, 2)} gha ÷ {nf(BIOCAP_MUNDIAL, 2)} gha que o planeta consegue repor por pessoa = {formatTerras(eco.planets, 2)}.</li>
            </ul>
          </div>
          <details>
            <summary className="cursor-pointer font-bold text-primary">Ver o valor de cada alternativa</summary>
            <ul className="mt-3 space-y-2">
              {CARBON_QUESTIONS.filter((q) => ALTERNATIVES[q.id]).map((q) => {
                const alt = ALTERNATIVES[q.id]!;
                return (
                  <li key={q.id}>
                    <p className="font-semibold">{q.text}</p>
                    <p className="text-muted-foreground">
                      {alt.values.map((v, i) => (
                        <span key={i} className={i === answers[q.id] ? "font-bold text-primary" : undefined}>
                          {i > 0 && " · "}{"ABCD"[i]}: {alt.prefix}{fmt(v)}
                        </span>
                      ))}
                      {alt.suffix}
                    </p>
                  </li>
                );
              })}
            </ul>
          </details>
        </section>
      )}
    </div>
  );
}
