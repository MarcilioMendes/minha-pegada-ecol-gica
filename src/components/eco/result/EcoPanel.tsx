import { AREA_COLOR, FootprintDonut } from "@/components/eco/FootprintChart";
import { nf } from "@/lib/carbon";
import { AREA_LABEL, BIOCAP_MUNDIAL, PEGADA_BRASIL, type EcoResult } from "@/lib/footprint";

const terras = (planets: number) => (planets < 2 ? "Terra" : "Terras");

export function EcoPanel({ eco }: { eco: EcoResult }) {
  const rows: [string, number, number, string][] = [
    ["Você", eco.gha, eco.planets, "bg-primary"],
    ["Biocapacidade mundial por pessoa", BIOCAP_MUNDIAL, 1, "bg-muted-foreground"],
    ["Média do Brasil", PEGADA_BRASIL, PEGADA_BRASIL / BIOCAP_MUNDIAL, "bg-muted-foreground"],
  ];
  const max = Math.max(...rows.map(([, v]) => v));
  return (
    <section className="space-y-5 rounded-3xl bg-card p-6 shadow-soft">
      <h2 className="text-xl font-bold">🌍 Pegada ecológica</h2>
      <p className="text-lg">
        Se todos vivessem como você, precisaríamos de <b className="text-primary">{nf(eco.planets, 1)} {terras(eco.planets)}</b>.
      </p>
      <FootprintDonut data={eco.byArea} labels={AREA_LABEL} colors={AREA_COLOR} unit="gha" />
      <div className="space-y-2">
        {rows.map(([label, v, planets, cls]) => (
          <div key={label}>
            <div className="flex justify-between gap-3 text-sm"><span className="font-semibold">{label}</span><span className="whitespace-nowrap">{nf(v, 2)} gha · {nf(planets, 2)} {terras(planets)}</span></div>
            <div className="h-2.5 rounded-full bg-muted"><div className={`h-full rounded-full ${cls}`} style={{ width: `${(v / max) * 100}%` }} /></div>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        A média do Brasil inclui todo o consumo do país. Esta calculadora pergunta só sobre uma parte dele (comida, transporte, voos, energia em casa e algumas compras), por isso o seu resultado tende a ficar abaixo da média, mesmo com hábitos parecidos com os da maioria.
      </p>
      <p className="text-xs text-muted-foreground">
        Fonte da média do Brasil: Relatório Anual WWF-Brasil 2024. Em 2024, o Dia da Sobrecarga da Terra caiu em 4 de agosto no Brasil: se todos vivessem como a média brasileira, os recursos do ano acabariam no 217º dia de 366, o que dá cerca de 1,69 Terra.
      </p>
      <p className="text-xs text-muted-foreground">
        CO₂e mede os gases que esquentam o planeta. Hectare global (gha) mede a área de planeta necessária para produzir o que você consome e absorver o CO₂ fóssil. A conta inclui uma parte fixa igual para todos (governo, escolas, estradas). O peixe entra na mesma pergunta do frango e é contado como frango, por isso a pesca aparece zerada.
      </p>
    </section>
  );
}
