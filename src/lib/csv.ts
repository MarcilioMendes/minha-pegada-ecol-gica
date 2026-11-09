/** Célula de CSV entre aspas. Texto que começa como fórmula é neutralizado, pois Excel e Sheets o executariam. */
export function csvCell(v: unknown): string {
  const s = String(v ?? "");
  return `"${(/^[=+\-@\t\r]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
}
