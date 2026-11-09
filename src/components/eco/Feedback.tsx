import ReactMarkdown from "react-markdown";
import { Sparkles } from "lucide-react";

export function Feedback({ text, onRetry, busy }: { text: string | null; onRetry?: (() => void) | undefined; busy?: boolean | undefined }) {
  return (
    <div className="rounded-3xl border-2 border-primary/20 bg-card p-6 shadow-soft">
      <div className="mb-3 flex items-center gap-2 text-primary">
        <Sparkles className="h-5 w-5" />
        <span className="font-bold">Feedback do seu tutor de IA</span>
      </div>
      {text ? (
        <div className="space-y-3 leading-relaxed [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_li]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ul]:list-disc [&_strong]:text-primary">
          <ReactMarkdown>{text}</ReactMarkdown>
          {onRetry && (
            <button onClick={onRetry} disabled={busy} className="text-sm font-semibold text-muted-foreground underline disabled:opacity-50">
              {busy ? "Gerando..." : "Gerar de novo"}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-muted-foreground">O feedback ainda não ficou pronto.</p>
          {onRetry && (
            <button onClick={onRetry} disabled={busy} className="rounded-full bg-primary px-4 py-2 font-bold text-primary-foreground disabled:opacity-50">
              {busy ? "Gerando..." : "Gerar feedback"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
