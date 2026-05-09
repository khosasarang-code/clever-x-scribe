import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Sparkles, Copy, Check, Loader2, MessageSquareText, Flame, History, Trash2, LogOut, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { generateAI, TONES } from "@/lib/ai.functions";
import { PWAEnhancements } from "@/components/PWAEnhancements";
import { InstallBanner } from "@/components/InstallBanner";
import { FloatingInstallButton } from "@/components/FloatingInstallButton";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: Index,
  validateSearch: z.object({ checkout: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "SmartReply AI X — AI Replies & Viral Threads" },
      {
        name: "description",
        content:
          "SmartReply AI X — Generate witty Twitter/X replies and viral threads in seconds with AI. Paste a tweet, get 9 smart replies. Drop an idea, get a full thread.",
      },
      { property: "og:title", content: "SmartReply AI X" },
      {
        property: "og:description",
        content: "SmartReply AI X — AI-powered replies and viral threads for X / Twitter.",
      },
    ],
  }),
});

type HistoryItem = {
  id: string;
  mode: "replies" | "thread";
  prompt: string;
  items: string[];
  createdAt: number;
};

const HISTORY_KEY = "smartreply_history_v1";

function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);
  const save = (next: HistoryItem[]) => {
    setHistory(next);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next.slice(0, 30)));
    } catch {}
  };
  return { history, save };
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

const USAGE_KEY = "smartreply_usage_v1";
const FREE_DAILY_LIMIT = 10;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function useDailyUsage() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(USAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.day === todayKey()) setCount(parsed.count);
      }
    } catch {}
  }, []);
  const increment = () => {
    setCount((c) => {
      const next = c + 1;
      try {
        localStorage.setItem(USAGE_KEY, JSON.stringify({ day: todayKey(), count: next }));
      } catch {}
      return next;
    });
  };
  return { count, increment, limit: FREE_DAILY_LIMIT };
}

function Index() {
  const [tweet, setTweet] = useState("");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Witty");
  const [idea, setIdea] = useState("");
  const [replies, setReplies] = useState<string[]>([]);
  const [thread, setThread] = useState<string[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const { history, save } = useHistory();
  const chatbaseLoaded = useRef(false);
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const { count: usedToday, increment: incrementUsage, limit } = useDailyUsage();
  const navigate = useNavigate();
  const search = useSearch({ from: "/" });

  useEffect(() => {
    if (search.checkout === "success") {
      toast.success("Welcome to Pro! Unlimited generations unlocked.");
      navigate({ to: "/", search: {}, replace: true });
    }
  }, [search.checkout, navigate]);

  const canGenerate = isPro || usedToday < limit;
  const requireQuota = (): boolean => {
    if (canGenerate) return true;
    if (!user) {
      toast.error("Daily free limit reached. Sign up to continue.");
      navigate({ to: "/auth", search: { next: "/pricing" } });
    } else {
      toast.error("Daily free limit reached. Upgrade to Pro for unlimited.");
      navigate({ to: "/pricing" });
    }
    return false;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
  };

  // Inject Chatbase floating bubble — deferred until browser is idle so it
  // never blocks first paint or interaction.
  useEffect(() => {
    if (chatbaseLoaded.current) return;
    const load = () => {
      if (chatbaseLoaded.current) return;
      chatbaseLoaded.current = true;
      // @ts-expect-error
      if (!window.chatbase || window.chatbase("getState") !== "initialized") {
        // @ts-expect-error
        window.chatbase = (...args: unknown[]) => {
          // @ts-expect-error
          if (!window.chatbase.q) window.chatbase.q = [];
          // @ts-expect-error
          window.chatbase.q.push(args);
        };
        // @ts-expect-error
        window.chatbase = new Proxy(window.chatbase, {
          get(target: any, prop: string) {
            if (prop === "q") return target.q;
            return (...args: unknown[]) => target(prop, ...args);
          },
        });
      }
      const script = document.createElement("script");
      script.src = "https://www.chatbase.co/embed.min.js";
      script.id = "Bu3haMN8YOvxWTktdugqJ";
      script.async = true;
      script.defer = true;
      // @ts-expect-error custom attr
      script.domain = "www.chatbase.co";
      document.body.appendChild(script);
    };
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const id = w.requestIdleCallback
      ? w.requestIdleCallback(load, { timeout: 4000 })
      : (window.setTimeout(load, 2500) as unknown as number);
    return () => {
      if (w.cancelIdleCallback) w.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
  }, []);

  const runReplies = async () => {
    if (!tweet.trim()) {
      toast.error("Paste a tweet first");
      return;
    }
    if (!requireQuota()) return;
    setLoadingReplies(true);
    setReplies([]);
    try {
      const res = await generateAI({ data: { prompt: tweet, mode: "replies", tone } });
      setReplies(res.items);
      if (!isPro) incrementUsage();
      save([
        { id: crypto.randomUUID(), mode: "replies", prompt: tweet, items: res.items, createdAt: Date.now() },
        ...history,
      ]);
    } catch (e: any) {
      toast.error(e?.message ?? "Generation failed");
    } finally {
      setLoadingReplies(false);
    }
  };

  const runThread = async () => {
    if (!idea.trim()) {
      toast.error("Drop a thread idea first");
      return;
    }
    if (!requireQuota()) return;
    setLoadingThread(true);
    setThread([]);
    try {
      const res = await generateAI({ data: { prompt: idea, mode: "thread" } });
      setThread(res.items);
      if (!isPro) incrementUsage();
      save([
        { id: crypto.randomUUID(), mode: "thread", prompt: idea, items: res.items, createdAt: Date.now() },
        ...history,
      ]);
    } catch (e: any) {
      toast.error(e?.message ?? "Generation failed");
    } finally {
      setLoadingThread(false);
    }
  };


  const fullThreadText = thread.map((t, i) => `${i + 1}/ ${t}`).join("\n\n");

  return (
    <div className="min-h-screen">
      <Toaster theme="dark" position="top-center" />
      <PWAEnhancements />
      <FloatingInstallButton />
      <WelcomeDialog />

      {/* Header */}
      <header className="border-b border-border/60 backdrop-blur-sm sticky top-0 z-30 bg-background/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 shrink-0 rounded-lg bg-gradient-brand grid place-items-center shadow-[var(--shadow-glow)]">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold tracking-tight leading-tight">
                SmartReply <span className="text-muted-foreground">AI X</span>
              </div>
              <div className="text-[11px] text-muted-foreground truncate hidden sm:block">
                Write replies and threads that actually pop.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isPro && (
              <span className="hidden sm:inline text-[11px] text-muted-foreground">
                {Math.max(0, FREE_DAILY_LIMIT - usedToday)}/{FREE_DAILY_LIMIT} left
              </span>
            )}
            {isPro && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-gradient-brand text-primary-foreground px-2 py-1 rounded-full">
                <Crown className="h-3 w-3" /> Pro
              </span>
            )}
            <Link
              to="/pricing"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2"
            >
              Pricing
            </Link>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline truncate max-w-[140px]">
                {user.email}
              </span>
              <div className="h-7 w-7 rounded-full bg-gradient-brand grid place-items-center text-[11px] font-semibold text-primary-foreground">
                {(user.email ?? "U").slice(0, 1).toUpperCase()}
              </div>
              <Button size="sm" variant="ghost" onClick={signOut} title="Sign out">
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              asChild
              size="sm"
              className="bg-foreground text-background hover:bg-foreground/90 shrink-0"
            >
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
          </div>
        </div>
      </header>

      <InstallBanner />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12 sm:space-y-16">
        {/* Hero */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Write replies and threads <br />
            that <span className="text-gradient-brand">actually pop.</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Paste any tweet to get 9 smart reply options. Drop an idea to get a full viral thread. No fluff.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Smart Replies</h2>
          </div>
          <Card className="p-4 space-y-3 bg-card/60 border-border/70">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground self-center mr-1">
                Tone
              </span>
              {TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    tone === t
                      ? "bg-gradient-brand text-primary-foreground border-transparent shadow-[var(--shadow-glow)]"
                      : "bg-background/40 text-muted-foreground border-border/60 hover:text-foreground hover:border-primary/40"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <Textarea
              value={tweet}
              onChange={(e) => setTweet(e.target.value)}
              placeholder="Paste any tweet text or link here…"
              className="min-h-[140px] text-base resize-none bg-input/40 border-border/60 focus-visible:ring-primary"
            />
            <div className="flex justify-end">
              <Button
                size="lg"
                onClick={runReplies}
                disabled={loadingReplies}
                className="bg-gradient-brand text-primary-foreground hover:opacity-90 shadow-[var(--shadow-glow)]"
              >
                {loadingReplies ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate Smart Replies
              </Button>
            </div>
          </Card>

          {replies.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-3">
              {replies.map((r, i) => (
                <Card
                  key={i}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    navigator.clipboard.writeText(r);
                    toast.success("Reply copied to clipboard");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigator.clipboard.writeText(r);
                      toast.success("Reply copied to clipboard");
                    }
                  }}
                  className="p-4 bg-card/60 border-border/70 hover:border-primary/40 hover:bg-card/80 transition-colors flex flex-col gap-3 cursor-pointer active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  title="Tap to copy"
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{r}</p>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Reply {i + 1} · {r.length} chars · tap to copy
                    </span>
                    <div onClick={(e) => e.stopPropagation()}>
                      <CopyButton text={r} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Thread */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold">Viral Thread</h2>
          </div>
          <Card className="p-4 space-y-3 bg-card/60 border-border/70">
            <Textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Drop one idea, topic, or rough outline… e.g. 'why most startups fail at distribution'"
              className="min-h-[120px] text-base resize-none bg-input/40 border-border/60 focus-visible:ring-accent"
            />
            <div className="flex justify-end">
              <Button
                size="lg"
                onClick={runThread}
                disabled={loadingThread}
                className="bg-gradient-brand text-primary-foreground hover:opacity-90 shadow-[var(--shadow-glow)]"
              >
                {loadingThread ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flame className="h-4 w-4" />}
                Generate Viral Thread
              </Button>
            </div>
          </Card>

          {thread.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <CopyButton text={fullThreadText} />
              </div>
              {thread.map((t, i) => (
                <Card key={i} className="p-4 bg-card/60 border-border/70 flex gap-3">
                  <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-brand grid place-items-center text-xs font-semibold text-primary-foreground">
                    {i + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{t}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {t.length} chars
                      </span>
                      <CopyButton text={t} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* History */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">History</h2>
            </div>
            {history.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => save([])}>
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">Your past generations will show up here.</p>
          ) : (
            <div className="space-y-2">
              {history.map((h) => (
                <details
                  key={h.id}
                  className="group rounded-lg border border-border/60 bg-card/40 p-3 transition-colors open:border-primary/40"
                >
                  <summary className="cursor-pointer flex items-center justify-between gap-3 list-none">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          h.mode === "replies"
                            ? "bg-primary/15 text-primary"
                            : "bg-accent/15 text-accent"
                        }`}
                      >
                        {h.mode === "replies" ? "Replies" : "Thread"}
                      </span>
                      <span className="text-sm truncate text-muted-foreground">{h.prompt}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {new Date(h.createdAt).toLocaleString()}
                    </span>
                  </summary>
                  <div className="mt-3 space-y-2">
                    {h.items.map((it, i) => (
                      <div
                        key={i}
                        className="text-sm p-2 rounded bg-background/40 border border-border/40 flex justify-between gap-2"
                      >
                        <span className="whitespace-pre-wrap">{it}</span>
                        <CopyButton text={it} />
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="py-10 text-center text-xs text-muted-foreground">
        Made with <span className="text-red-400">❤️</span> using Lovable
      </footer>
    </div>
  );
}
