import { AREA_COLOR, FootprintDonut } from "@/components/eco/FootprintChart";
import { nf } from "@/lib/carbon";
import { AREA_LABEL, BIOCAP_MUNDIAL, PEGADA_BRASIL, type EcoResult } from "@/lib/footprint";

export function EcoPanel({ eco }: { eco: EcoResult }) {
  const rows: [string, number, string][] = [
    ["Você", eco.gha, "bg-primary"],
    ["Biocapacidade mundial por pessoa", BIOCAP_MUNDIAL, "bg-muted-foreground"],
    ["Média do Brasil", PEGADA_BRASIL, "bg-muted-foreground"],
  ];
  const max = Math.max(...rows.map(([, v]) => v));
  return (
    <section className="space-y-5 rounded-3xl bg-card p-6 shadow-soft">
      <h2 className="text-xl font-bold">🌍 Pegada ecológica</h2>
      <p className="text-lg">
        Se todos vivessem como você, precisaríamos de <b className="text-primary">{nf(eco.planets, 1)} {eco.planets < 2 ? "Terra" : "Terras"}</b>.
      </p>
      <FootprintDonut data={eco.byArea} labels={AREA_LABEL} colors={AREA_COLOR} unit="gha" />
      <div className="space-y-2">
        {rows.map(([label, v, cls]) => (
          <div key={label}>
            <div className="flex justify-between gap-3 text-sm"><span className="font-semibold">{label}</span><span className="whitespace-nowrap">{nf(v, 2)} gha</span></div>
            <div className="h-2.5 rounded-full bg-muted"><div className={`h-full rounded-full ${cls}`} style={{ width: `${(v / max) * 100}%` }} /></div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        CO₂e mede os gases que esquentam o planeta. Hectare global (gha) mede a área de planeta necessária para produzir o que você consome e absorver o CO₂ fóssil. A conta inclui uma parte fixa igual para todos (governo, escolas, estradas). O peixe entra na mesma pergunta do frango e é contado como frango, por isso a pesca aparece zerada.
      </p>
    </section>
  );
}
