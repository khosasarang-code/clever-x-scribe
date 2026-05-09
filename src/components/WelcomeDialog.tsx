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
      className="fixed inset-0 z-50 grid place-items-center p-4 bg-background/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-border/70 bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-3 right-3 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="h-12 w-12 rounded-xl bg-gradient-brand grid place-items-center shadow-[var(--shadow-glow)] mb-4">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>

        <h2 className="text-xl font-semibold tracking-tight">
          Welcome to SmartReply 👋
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          Two ways to make your X game pop:
        </p>

        <ul className="mt-4 space-y-3">
          <li className="flex gap-3">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-primary/15 grid place-items-center">
              <MessageSquareText className="h-4 w-4 text-primary" />
            </div>
            <div className="text-sm">
              <div className="font-medium">Smart Replies</div>
              <div className="text-muted-foreground text-xs">
                Paste any tweet, get 9 reply options in your tone.
              </div>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-accent/15 grid place-items-center">
              <Flame className="h-4 w-4 text-accent" />
            </div>
            <div className="text-sm">
              <div className="font-medium">Viral Threads</div>
              <div className="text-muted-foreground text-xs">
                Drop one idea, get a numbered 7–10 tweet thread.
              </div>
            </div>
          </li>
        </ul>

        <Button
          onClick={close}
          className="w-full mt-6 bg-gradient-brand text-primary-foreground hover:opacity-90"
        >
          Let's go
        </Button>
      </div>
    </div>
  );
}
