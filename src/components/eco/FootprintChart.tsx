import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { terraWord, type Area } from "@/lib/footprint";
import { nf, type Stage } from "@/lib/carbon";

export const AREA_COLOR: Record<Area, string> = {
  cultivo: "var(--chart-1)",
  pastagem: "var(--chart-3)",
  pesca: "var(--chart-2)",
  floresta: "var(--chart-5)",
  construida: "var(--chart-4)",
  carbono: "var(--muted-foreground)",
};

export const STAGE_COLOR: Record<Stage, string> = {
  alimentacao: "var(--chart-1)",
  transporte: "var(--chart-2)",
  aviacao: "var(--chart-5)",
  energia: "var(--chart-3)",
  consumo: "var(--chart-4)",
  residuos: "var(--muted-foreground)",
};

export function Planets({ value, size = "lg" }: { value: number; size?: "lg" | "sm" }) {
  const shown = Math.round(value * 10) / 10;
  const full = Math.floor(value);
  const frac = value - full;
  const n = size === "lg" ? "text-4xl" : "text-2xl";
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`flex flex-wrap justify-center gap-1 ${n}`} aria-hidden>
        {Array.from({ length: full }).map((_, i) => <span key={i}>🌍</span>)}
        {frac > 0.05 && (
          <span className="relative inline-block overflow-hidden" style={{ width: `${frac}em` }}>🌍</span>
        )}
      </div>
      <p className={`font-display font-extrabold text-primary ${size === "lg" ? "text-5xl" : "text-3xl"}`}>
        {nf(shown, 1)} <span className="text-lg font-semibold text-muted-foreground">{terraWord(shown)}</span>
      </p>
    </div>
  );
}

export function FootprintDonut<K extends string>({ data, labels, colors, unit = "Terras" }: { data: Record<K, number>; labels: Record<K, string>; colors: Record<K, string>; unit?: string }) {
  const rows = (Object.keys(labels) as K[]).map((k) => ({ key: k, name: labels[k], value: data[k] }));
  const total = rows.reduce((s, d) => s + d.value, 0) || 1;
  const slices = rows.filter((d) => d.value > 0);
  return (
    <div className="grid items-center gap-4 sm:grid-cols-2">
      <div className="h-56">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={slices} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="90%" paddingAngle={3} stroke="none">
              {slices.map((d) => <Cell key={d.key} fill={colors[d.key]} />)}
            </Pie>
            <Tooltip formatter={(v) => `${nf(Number(v), 2)} ${unit}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-2">
        {rows.map((d) => (
          <li key={d.key} className="flex items-center gap-3 rounded-xl bg-muted px-3 py-2">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: colors[d.key] }} />
            <span className="flex-1 font-semibold">{d.name}</span>
            <span className="text-sm text-muted-foreground">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
