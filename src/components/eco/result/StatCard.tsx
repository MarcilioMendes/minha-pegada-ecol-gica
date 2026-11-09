export function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-muted p-4">
      <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-extrabold text-primary">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
