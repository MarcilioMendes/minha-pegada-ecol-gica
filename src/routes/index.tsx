import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { studentLogin } from "@/lib/api.functions";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Minha Pegada Ecológica · Turma 81" },
      { name: "description", content: "Descubra quantos planetas Terra seriam necessários se todos vivessem como você — com feedback personalizado por IA." },
      { property: "og:title", content: "Minha Pegada Ecológica · Turma 81" },
      { property: "og:description", content: "Diagnóstico de Pegada Ecológica com feedback por IA para alunos do 8º ano." },
    ],
  }),
  component: Index,
});

function Index() {
  const login = useServerFn(studentLogin);
  const nav = useNavigate();
  const [pseudonym, setPseudonym] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await login({ data: { pseudonym, pin } });
      localStorage.setItem("pe_student", r.token);
      if (r.firstAccess) toast.success("PIN criado! Guarde bem o seu PIN 🔐");
      nav({ to: "/aluno" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen">
      <section className="bg-hero px-4 pb-24 pt-14 text-primary-foreground">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 inline-block rounded-full bg-background/20 px-3 py-1 text-sm font-bold">🌱 8º ano · Turma 81</p>
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-6xl">Quantas Terras você usa?</h1>
          <p className="mt-4 max-w-xl text-lg opacity-90">Reflita sobre o meio ambiente, descubra sua Pegada Ecológica e compare a sua pegada com de com outras figuras.</p>
        </div>
      </section>
      <section className="mx-auto -mt-16 grid max-w-5xl gap-6 px-4 pb-16 md:grid-cols-[1.2fr_1fr]">
        <form onSubmit={submit} className="space-y-5 rounded-3xl bg-card p-8 shadow-soft">
          <h2 className="text-2xl font-bold">Entrar como aluno</h2>
          <div className="space-y-2">
            <Label htmlFor="ps">Seu pseudônimo</Label>
            <Input id="ps" value={pseudonym} onChange={(e) => setPseudonym(e.target.value.toUpperCase())} placeholder="Ex: A009" className="h-12 rounded-xl text-lg uppercase" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pin">PIN (4 a 6 números)</Label>
            <Input id="pin" type="password" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="••••" className="h-12 rounded-xl text-lg tracking-widest" required />
            <p className="text-sm text-muted-foreground">Primeiro acesso? O PIN que você digitar agora vira o seu PIN.</p>
          </div>
          <Button type="submit" size="lg" className="h-12 w-full rounded-full text-base" disabled={busy}>{busy ? "Entrando..." : "Começar 🚀"}</Button>
        </form>
        <div className="space-y-4">
          {[["📝", "Reflita", "Conte o que te preocupa no meio ambiente."], ["🌍", "Calcule", "Responda 10 perguntas sobre seus hábitos."], ["🎯", "Aja", "Receba feedback e missões para o dia a dia."]].map(([e, t, d]) => (
            <div key={t} className="flex gap-4 rounded-2xl bg-card/70 p-4">
              <span className="text-3xl">{e}</span>
              <div><p className="font-bold">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div>
            </div>
          ))}
          <div className="flex gap-3 rounded-2xl bg-accent p-4 text-sm text-accent-foreground">
            <ShieldCheck className="h-5 w-5 shrink-0" />
            <p>Sua privacidade é protegida: usamos só pseudônimos, sem nome ou e-mail (LGPD).</p>
          </div>
          <Link to="/professor" className="block text-center text-sm font-semibold text-muted-foreground underline">Acesso do professor</Link>
        </div>
      </section>
    </main>
  );
}
