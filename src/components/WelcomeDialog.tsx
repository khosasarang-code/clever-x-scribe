import { useEffect, useState } from "react";
import { Sparkles, MessageSquareText, Flame, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const WELCOME_KEY = "smartreply_welcome_seen_v1";

export function WelcomeDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(WELCOME_KEY)) {
      const t = setTimeout(() => setOpen(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => {
    localStorage.setItem(WELCOME_KEY, "1");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4 bg-background/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl p-[1px] bg-gradient-to-br from-primary/40 via-border/40 to-accent/40 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="relative rounded-[calc(1.5rem-1px)] bg-card/95 backdrop-blur-xl p-6 sm:p-7 overflow-hidden">
          {/* glow */}
          <div className="pointer-events-none absolute -top-24 -right-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />

          <button
            onClick={close}
            aria-label="Close"
            className="absolute top-3 right-3 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-primary">
              <Sparkles className="h-3 w-3" />
              New here
            </div>

            <h2 className="text-2xl font-semibold tracking-tight mt-4">
              Welcome to <span className="text-gradient-brand">SmartReply AI X</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              Two ways to make your X game pop.
            </p>

            <ul className="mt-5 space-y-3">
              <li className="flex gap-3 items-start rounded-xl border border-border/50 bg-background/40 p-3">
                <div className="h-9 w-9 shrink-0 rounded-lg bg-primary/15 grid place-items-center">
                  <MessageSquareText className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <div className="font-medium">Smart Replies</div>
                  <div className="text-muted-foreground text-xs leading-relaxed">
                    Paste any tweet, get 9 reply options in your tone.
                  </div>
                </div>
              </li>
              <li className="flex gap-3 items-start rounded-xl border border-border/50 bg-background/40 p-3">
                <div className="h-9 w-9 shrink-0 rounded-lg bg-accent/15 grid place-items-center">
                  <Flame className="h-4 w-4 text-accent" />
                </div>
                <div className="text-sm">
                  <div className="font-medium">Viral Threads</div>
                  <div className="text-muted-foreground text-xs leading-relaxed">
                    Drop one idea, get a numbered 7–10 tweet thread.
                  </div>
                </div>
              </li>
            </ul>

            <div className="flex items-center gap-2 mt-6">
              <Button
                variant="ghost"
                onClick={close}
                className="text-muted-foreground hover:text-foreground"
              >
                Skip
              </Button>
              <Button
                onClick={close}
                className="flex-1 bg-gradient-brand text-primary-foreground hover:opacity-90 shadow-[var(--shadow-glow)]"
              >
                Let's go
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
