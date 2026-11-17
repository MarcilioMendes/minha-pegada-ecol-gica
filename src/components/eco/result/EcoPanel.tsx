import { AREA_COLOR, FootprintDonut } from "@/components/eco/FootprintChart";
import { nf } from "@/lib/carbon";
import { AREA_LABEL, BIOCAP_MUNDIAL, formatTerras, PEGADA_BRASIL, type EcoResult } from "@/lib/footprint";

export function EcoPanel({ eco }: { eco: EcoResult }) {
  const rows: [string, number, number, string][] = [
    ["Você", eco.gha, eco.planets, "bg-primary"],
    ["O que a Terra consegue repor por pessoa", BIOCAP_MUNDIAL, 1, "bg-muted-foreground"],
    ["Média do Brasil", PEGADA_BRASIL, PEGADA_BRASIL / BIOCAP_MUNDIAL, "bg-muted-foreground"],
  ];
  const max = Math.max(...rows.map(([, v]) => v));
  return (
    <section className="space-y-5 rounded-3xl bg-card p-6 shadow-soft">
      <h2 className="text-xl font-bold">🌍 Pegada ecológica</h2>
      <p className="text-lg">
        Se todos vivessem como você, precisaríamos de <b className="text-primary">{formatTerras(eco.planets)}</b>.
      </p>
      <p className="text-sm text-muted-foreground">
        A pegada ecológica mede quanta área do planeta é usada para produzir a sua comida e as suas coisas, e quanta floresta seria preciso para absorver a fumaça de gasolina, gás e carvão. A unidade é o hectare global (gha): um pedaço de terra um pouco maior que um campo de futebol.
      </p>
      <FootprintDonut data={eco.byArea} labels={AREA_LABEL} colors={AREA_COLOR} unit="gha" />
      <div className="space-y-2">
        {rows.map(([label, v, planets, cls]) => (
          <div key={label}>
            <div className="flex justify-between gap-3 text-sm"><span className="font-semibold">{label}</span><span className="whitespace-nowrap">{nf(v, 2)} gha · {formatTerras(planets, 2)}</span></div>
            <div className="h-2.5 rounded-full bg-muted"><div className={`h-full rounded-full ${cls}`} style={{ width: `${(v / max) * 100}%` }} /></div>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        A média do Brasil conta tudo o que o país consome. Esta calculadora pergunta só sobre uma parte: comida, transporte, voos, energia em casa e algumas compras. Por isso, o seu resultado costuma ficar abaixo da média, mesmo com hábitos parecidos com os da maioria.
      </p>
      <p className="text-xs text-muted-foreground">
        Fonte da média do Brasil: Relatório Anual WWF-Brasil 2024. Em 2024, o Dia da Sobrecarga da Terra caiu em 4 de agosto no Brasil: se todos vivessem como a média brasileira, os recursos do ano acabariam no 217º dia de 366, o que dá cerca de 1,69 Terra.
      </p>
      <p className="text-xs text-muted-foreground">
        A pegada ecológica tem uma parte fixa, igual para todo mundo. É o que o país usa junto: governo, escolas e estradas. A pegada de carbono, no quadro de cima, não tem essa parte. O peixe está na mesma pergunta do frango e conta como frango. Por isso a pesca aparece zerada.
      </p>
    </section>
  );
}
