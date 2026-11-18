// As três etapas da jornada do aluno, na ordem em que aparecem.
export const ETAPAS = ["pre", "carbon", "post"] as const;
export type Etapa = (typeof ETAPAS)[number];
export type Locks = Record<Etapa, boolean>;

export const ETAPA_LABEL: Record<Etapa, string> = {
  pre: "Etapa 1 · Minha reflexão",
  carbon: "Etapa 2 · Calculadora da pegada",
  post: "Etapa 3 · Minha reflexão, de novo",
};

export const NO_LOCKS: Locks = { pre: false, carbon: false, post: false };

export const isEtapa = (v: unknown): v is Etapa => (ETAPAS as readonly unknown[]).includes(v);

export function locksFrom(rows: { stage: string; locked: boolean }[]): Locks {
  const locks = { ...NO_LOCKS };
  for (const r of rows) if (isEtapa(r.stage)) locks[r.stage] = r.locked;
  return locks;
}

export const LOCKED_MESSAGE = "O professor trancou esta etapa. O que você já enviou continua salvo.";
