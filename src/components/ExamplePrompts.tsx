import { Sparkles, Flame } from "lucide-react";

const REPLY_EXAMPLES = [
  "Most people fail not from lack of talent but from lack of patience.",
  "Just shipped my SaaS in 2 weeks using AI tools 🚀",
  "Hot take: distribution > product, every single time.",
  "What's one habit that 10x'd your output this year?",
];

const THREAD_EXAMPLES = [
  "why most startups fail at distribution",
  "how I got my first 10k followers on X",
  "5 lessons from shipping 12 products in 12 months",
  "the underrated skill every founder needs in 2026",
];

type Props = {
  onPickReply: (text: string) => void;
  onPickThread: (text: string) => void;
};

export function ExamplePrompts({ onPickReply, onPickThread }: Props) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Try a Reply
        </div>
        <div className="flex flex-wrap gap-2">
          {REPLY_EXAMPLES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onPickReply(t)}
              className="text-xs sm:text-[13px] text-left px-3 py-2 rounded-lg border border-border/60 bg-background/40 text-foreground/90 hover:border-primary/50 hover:bg-primary/5 hover:-translate-y-0.5 transition-all"
            >
              {t.length > 64 ? t.slice(0, 62) + "…" : t}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
          <Flame className="h-3.5 w-3.5" />
          Try a Thread idea
        </div>
        <div className="flex flex-wrap gap-2">
          {THREAD_EXAMPLES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onPickThread(t)}
              className="text-xs sm:text-[13px] text-left px-3 py-2 rounded-lg border border-border/60 bg-background/40 text-foreground/90 hover:border-accent/50 hover:bg-accent/5 hover:-translate-y-0.5 transition-all"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
