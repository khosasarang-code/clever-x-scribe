import { Sparkles, MessageSquareText } from "lucide-react";

/**
 * Animated hero demo — a stylized 8s loop showing a tweet being pasted,
 * the AI "thinking", then 3 replies typing in. Pure CSS keyframes, no video.
 */
export function HeroDemo() {
  return (
    <div className="relative mx-auto max-w-2xl">
      <div className="absolute -inset-4 bg-gradient-brand opacity-20 blur-3xl rounded-3xl pointer-events-none" />
      <div className="relative rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl shadow-[var(--shadow-elegant)] overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border/50 bg-card/40">
          <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
          <div className="ml-auto flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" />
            SmartReply · live demo
          </div>
        </div>

        {/* Tweet input */}
        <div className="p-5 space-y-4 text-left">
          <div className="rounded-lg border border-border/50 bg-background/40 p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Tweet</div>
            <div className="text-sm font-medium min-h-[1.25rem]">
              <span className="hero-typing">Just shipped my SaaS in 2 weeks using AI tools 🚀</span>
            </div>
          </div>

          {/* Generate button pulse */}
          <div className="flex items-center gap-2">
            <div className="hero-btn inline-flex items-center gap-1.5 rounded-md bg-gradient-brand px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow-sm)]">
              <Sparkles className="h-3 w-3" />
              Generate
            </div>
            <div className="hero-thinking text-xs text-muted-foreground inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Crafting replies…
            </div>
          </div>

          {/* Replies */}
          <div className="space-y-2">
            {[
              "Congrats! What was the hardest part — distribution or the actual build?",
              "2 weeks?? Drop the stack, this is the kind of post that makes me jealous 😅",
              "Shipping fast is a superpower. Now the real game begins: getting users.",
            ].map((reply, i) => (
              <div
                key={i}
                className="hero-reply rounded-lg border border-border/50 bg-background/30 p-3 text-xs leading-relaxed flex gap-2"
                style={{ animationDelay: `${4 + i * 0.6}s` }}
              >
                <MessageSquareText className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <span>{reply}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes heroTyping {
          0%, 5% { clip-path: inset(0 100% 0 0); }
          25%, 100% { clip-path: inset(0 0 0 0); }
        }
        @keyframes heroBtn {
          0%, 30% { transform: scale(1); filter: brightness(1); }
          32%, 36% { transform: scale(0.94); filter: brightness(1.2); }
          40%, 100% { transform: scale(1); filter: brightness(1); }
        }
        @keyframes heroThinking {
          0%, 35% { opacity: 0; }
          40%, 55% { opacity: 1; }
          60%, 100% { opacity: 0; }
        }
        @keyframes heroReply {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .hero-typing {
          display: inline-block;
          animation: heroTyping 8s steps(40, end) infinite;
        }
        .hero-btn { animation: heroBtn 8s ease-in-out infinite; }
        .hero-thinking { animation: heroThinking 8s ease-in-out infinite; }
        .hero-reply {
          opacity: 0;
          animation: heroReply 0.5s ease-out forwards;
          animation-iteration-count: infinite;
          animation-duration: 8s;
        }
        @keyframes heroReplyLoop {
          0%, 50% { opacity: 0; transform: translateY(8px); }
          60%, 95% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(0); }
        }
        .hero-reply { animation: heroReplyLoop 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
