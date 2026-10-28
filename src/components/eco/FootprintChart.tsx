import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CATEGORY_LABEL, type Breakdown, type Category } from "@/lib/footprint";

export const CAT_COLOR: Record<Category, string> = {
  alimentacao: "var(--chart-1)",
  transporte: "var(--chart-2)",
  energia: "var(--chart-3)",
  consumo: "var(--chart-4)",
};

export function Planets({ value, size = "lg" }: { value: number; size?: "lg" | "sm" }) {
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
        {value.toFixed(1)} <span className="text-lg font-semibold text-muted-foreground">Terras</span>
      </p>
    </div>
  );
}

export function FootprintDonut({ breakdown }: { breakdown: Breakdown }) {
  const data = (Object.keys(breakdown) as Category[]).map((k) => ({ key: k, name: CATEGORY_LABEL[k], value: breakdown[k] }));
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div className="grid items-center gap-4 sm:grid-cols-2">
      <div className="h-56">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="90%" paddingAngle={3} stroke="none">
              {data.map((d) => <Cell key={d.key} fill={CAT_COLOR[d.key]} />)}
            </Pie>
            <Tooltip formatter={(v: number) => `${v.toFixed(2)} Terras`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-2">
        {data.map((d) => (
          <li key={d.key} className="flex items-center gap-3 rounded-xl bg-muted px-3 py-2">
            <span className="h-3 w-3 rounded-full" style={{ background: CAT_COLOR[d.key] }} />
            <span className="flex-1 font-semibold">{d.name}</span>
            <span className="text-sm text-muted-foreground">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
