import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Sparkles, Copy, Check, Loader2, MessageSquareText, Flame, History, Trash2, LogOut, Crown, Wand2, Chrome, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { generateAI, TONES, PERSONA_PRESETS } from "@/lib/ai.functions";
import { PWAEnhancements } from "@/components/PWAEnhancements";
import { InstallBanner } from "@/components/InstallBanner";
import { FloatingInstallButton } from "@/components/FloatingInstallButton";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { Testimonials } from "@/components/Testimonials";
import { HeroDemo } from "@/components/HeroDemo";
import { RewriteDialog } from "@/components/RewriteDialog";
import { HowItWorks } from "@/components/HowItWorks";
import { RealResults } from "@/components/RealResults";
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

import { getDailyUsage, FREE_DAILY_LIMIT } from "@/utils/usage.functions";
import { createPortalSession } from "@/utils/payments.functions";
import { getPaddleEnvironment } from "@/lib/paddle";

function useDailyUsage(enabled: boolean) {
  const [count, setCount] = useState(0);
  const [limit, setLimit] = useState(FREE_DAILY_LIMIT);
  const refresh = async () => {
    if (!enabled) {
      setCount(0);
      return;
    }
    try {
      const res = await getDailyUsage();
      setCount(res.count);
      setLimit(res.limit);
    } catch (error: any) {
      const message = error?.message ?? "";
      if (message.toLowerCase().includes("unauthorized")) {
        setCount(0);
        return;
      }
    }
  };
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
  return { count, limit, refresh };
}

function Index() {
  const [tweet, setTweet] = useState("");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Witty");
  const [persona, setPersona] = useState("");
  const [personaOpen, setPersonaOpen] = useState(false);
  const [idea, setIdea] = useState("");
  const [replies, setReplies] = useState<string[]>([]);
  const [thread, setThread] = useState<string[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const { history, save } = useHistory();
  const chatbaseLoaded = useRef(false);
  const { user } = useAuth();
  const { isPro, subscription, refetch: refetchSub } = useSubscription();
  const { count: usedToday, limit, refresh: refreshUsage } = useDailyUsage(Boolean(user) && !isPro);
  const navigate = useNavigate();
  const search = useSearch({ from: "/" });
  const [openingPortal, setOpeningPortal] = useState(false);

  const greetedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!user) {
      greetedRef.current = null;
      return;
    }
    if (greetedRef.current === user.id) return;
    greetedRef.current = user.id;
    const name =
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      user.email ||
      "creator";
    toast.success(`Signed in as ${name}`);
  }, [user]);

  useEffect(() => {
    if (search.checkout === "success") {
      toast.success("Welcome to Pro! Unlimited generations unlocked.");
      // Webhook may arrive after redirect — poll the subscription a few times.
      let tries = 0;
      const id = window.setInterval(async () => {
        tries += 1;
        await refetchSub();
        if (tries >= 6) window.clearInterval(id);
      }, 1500);
      navigate({ to: "/", search: {}, replace: true });
      return () => window.clearInterval(id);
    }
  }, [search.checkout, navigate, refetchSub]);

  // Guests can use the app without signing in. Sign-in is only nudged when
  // they hit the free daily limit or try to manage billing.

  const openPortal = async () => {
    if (!user) {
      toast.error("Sign in to manage billing.");
      navigate({ to: "/auth", search: { next: "/" } });
      return;
    }
    setOpeningPortal(true);
    try {
      const res = await createPortalSession({ data: { environment: getPaddleEnvironment() } });
      window.open(res.overviewUrl, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      const message = e?.message ?? "Could not open billing portal";
      if (String(message).toLowerCase().includes("unauthorized")) {
        toast.error("Please sign in again to manage billing.");
        navigate({ to: "/auth", search: { next: "/" } });
      } else {
        toast.error(message);
      }
    } finally {
      setOpeningPortal(false);
    }
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

    setLoadingReplies(true);
    setReplies([]);
    try {
      const res = await generateAI({ data: { prompt: tweet, mode: "replies", tone, persona: persona.trim() || undefined, environment: getPaddleEnvironment() } });
      setReplies(res.items);
      if (!isPro) refreshUsage();
      save([
        { id: crypto.randomUUID(), mode: "replies", prompt: tweet, items: res.items, createdAt: Date.now() },
        ...history,
      ]);
    } catch (e: any) {
      const message = e?.message ?? "Generation failed";
      if (String(message).toLowerCase().includes("unauthorized")) {
        toast.error("Please sign in again and retry.");
        navigate({ to: "/auth", search: { next: "/" } });
      } else {
        toast.error(message);
      }
    } finally {
      setLoadingReplies(false);
    }
  };

  const runThread = async () => {
    if (!idea.trim()) {
      toast.error("Drop a thread idea first");
      return;
    }

    setLoadingThread(true);
    setThread([]);
    try {
      const res = await generateAI({ data: { prompt: idea, mode: "thread", environment: getPaddleEnvironment() } });
      setThread(res.items);
      if (!isPro) refreshUsage();
      save([
        { id: crypto.randomUUID(), mode: "thread", prompt: idea, items: res.items, createdAt: Date.now() },
        ...history,
      ]);
    } catch (e: any) {
      const message = e?.message ?? "Generation failed";
      if (String(message).toLowerCase().includes("unauthorized")) {
        toast.error("Please sign in again and retry.");
        navigate({ to: "/auth", search: { next: "/" } });
      } else {
        toast.error(message);
      }
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
      <header className="border-b border-border/60 backdrop-blur-md sticky top-0 z-30 bg-background/70 transition-all duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <a
            href="/"
            className="flex items-center gap-3 min-w-0 hover:opacity-90 transition-all duration-200 hover:scale-[1.02]"
            aria-label="SmartReply AI X — Home"
          >
            <div className="h-9 w-9 shrink-0 rounded-lg bg-gradient-brand grid place-items-center shadow-[var(--shadow-glow)] transition-transform duration-300 animate-glow-pulse">
              <Sparkles className="h-4 w-4 text-primary-foreground drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold tracking-tight leading-tight">
                SmartReply <span className="text-muted-foreground">AI X</span>
              </div>
              <div className="text-[11px] text-muted-foreground truncate hidden sm:block">
                Write replies and threads that actually pop.
              </div>
            </div>
          </a>
          <div className="flex items-center gap-2 shrink-0">
            {!isPro && (
              <span className="hidden sm:inline text-[11px] text-muted-foreground transition-colors">
                {Math.max(0, FREE_DAILY_LIMIT - usedToday)}/{FREE_DAILY_LIMIT} left
              </span>
            )}
            {isPro && (
              <>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-gradient-brand text-primary-foreground px-2 py-1 rounded-full">
                  <Crown className="h-3 w-3" /> Pro
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={openPortal}
                  disabled={openingPortal}
                  className="text-xs transition-colors duration-200"
                  title="Manage billing"
                >
                  {openingPortal ? <Loader2 className="h-3 w-3 animate-spin" /> : "Billing"}
                </Button>
              </>
            )}
            <Link
              to="/pricing"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 px-2"
            >
              Pricing
            </Link>
          {user ? (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Signed in as</span>
                <span className="text-xs font-medium text-foreground truncate max-w-[160px]">
                  {(user.user_metadata?.full_name as string | undefined) || user.email}
                </span>
              </div>
              <div className="h-7 w-7 rounded-full bg-gradient-brand grid place-items-center text-[11px] font-semibold text-primary-foreground ring-2 ring-background transition-transform duration-200 hover:scale-110">
                {(user.email ?? "U").slice(0, 1).toUpperCase()}
              </div>
              <Button size="sm" variant="ghost" onClick={signOut} title="Sign out" className="transition-colors duration-200">
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

      {subscription && subscription.status === "past_due" && (
        <div className="w-full bg-red-100 border-b border-red-300 px-4 py-2 text-center text-sm text-red-800">
          Your last payment failed. Please update your payment method to keep Pro access.{" "}
          <button onClick={openPortal} className="underline font-medium">Update payment</button>
        </div>
      )}
      {subscription && subscription.status === "canceled" && subscription.current_period_end &&
        new Date(subscription.current_period_end) > new Date() && (
          <div className="w-full bg-amber-100 border-b border-amber-300 px-4 py-2 text-center text-sm text-amber-900">
            Your Pro plan ends on {new Date(subscription.current_period_end).toLocaleDateString()}.{" "}
            <Link to="/pricing" className="underline font-medium">Resubscribe</Link>
          </div>
        )}
      {subscription && subscription.cancel_at_period_end && subscription.status !== "canceled" &&
        subscription.current_period_end && (
          <div className="w-full bg-amber-100 border-b border-amber-300 px-4 py-2 text-center text-sm text-amber-900">
            Pro will not renew. Access continues until{" "}
            {new Date(subscription.current_period_end).toLocaleDateString()}.{" "}
            <button onClick={openPortal} className="underline font-medium">Manage</button>
          </div>
        )}

      <InstallBanner />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12 sm:space-y-16">
        {/* Hero */}
        <section className="text-center space-y-6">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur px-3.5 py-1.5 text-xs font-medium text-foreground/90">
            <span className="flex -space-x-1.5">
              {[12, 47, 33, 8].map((id) => (
                <img
                  key={id}
                  src={`https://i.pravatar.cc/40?img=${id}`}
                  alt=""
                  className="h-5 w-5 rounded-full ring-2 ring-background object-cover"
                  loading="lazy"
                />
              ))}
            </span>
            <span>Used by <span className="font-semibold text-gradient-brand">10,000+ creators</span></span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight leading-[0.95]">
            Smart Replies & <br />
            <span className="text-gradient-brand">Viral Threads</span> for X
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
            Paste any tweet to get 9 smart reply options. Drop an idea to get a full viral thread. No fluff.
          </p>

          {/* Social proof row */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1.5">
              <span className="text-amber-400">★★★★★</span>
              <span>4.9 / 5 from 1,200+ reviews</span>
            </span>
            <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-border" />
            <span>2M+ replies generated</span>
            <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-border" />
            <span>Featured on Product Hunt</span>
          </div>

          {/* Animated demo */}
          <div className="pt-4">
            <HeroDemo />
          </div>
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

            {/* Reply like ... */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs uppercase tracking-wider text-muted-foreground mr-1">
                Reply like
              </span>
              <div className="relative flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  onFocus={() => setPersonaOpen(true)}
                  onBlur={() => setTimeout(() => setPersonaOpen(false), 150)}
                  placeholder="@naval, @levelsio, or 'in my own style'…"
                  className="w-full h-9 px-3 rounded-md text-sm bg-input/40 border border-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary placeholder:text-muted-foreground/70"
                />
                {personaOpen && (
                  <div className="absolute z-20 left-0 right-0 mt-1 rounded-md border border-border/70 bg-popover shadow-lg overflow-hidden">
                    {PERSONA_PRESETS.filter((p) =>
                      persona.trim() === ""
                        ? true
                        : p.handle.toLowerCase().includes(persona.toLowerCase()) ||
                          p.label.toLowerCase().includes(persona.toLowerCase()),
                    ).map((p) => (
                      <button
                        key={p.handle}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setPersona(p.handle);
                          setPersonaOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 transition-colors flex items-center justify-between gap-3"
                      >
                        <span className="font-medium">{p.handle}</span>
                        <span className="text-xs text-muted-foreground truncate">{p.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {persona && (
                <button
                  type="button"
                  onClick={() => setPersona("")}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              )}
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
                className="bg-gradient-brand text-primary-foreground hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] shadow-[var(--shadow-glow)] hover:shadow-[0_15px_50px_-10px_oklch(0.7_0.22_290/0.7)] transition-all duration-300 font-semibold"
              >
                {loadingReplies ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {loadingReplies ? "Crafting replies…" : "Generate Smart Replies"}
              </Button>
            </div>
          </Card>

          {loadingReplies && replies.length === 0 && (
            <div className="grid sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card
                  key={i}
                  className="p-4 bg-card/40 border-border/60 h-32 overflow-hidden relative"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="absolute inset-0 shimmer-bg" />
                  <div className="space-y-2 relative">
                    <div className="h-3 rounded bg-muted/60 w-5/6" />
                    <div className="h-3 rounded bg-muted/60 w-full" />
                    <div className="h-3 rounded bg-muted/60 w-2/3" />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {replies.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-3">
              {replies.map((r, i) => (
                <Card
                  key={i}
                  role="button"
                  tabIndex={0}
                  style={{ animationDelay: `${i * 50}ms` }}
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
                  className="animate-card-in p-4 bg-card/60 border-border/70 hover:border-primary/50 hover:bg-card/80 hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow-sm)] transition-all duration-300 flex flex-col gap-3 cursor-pointer active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  title="Tap to copy"
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{r}</p>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Reply {i + 1} · {r.length} chars · tap to copy
                    </span>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <RewriteDialog
                        initialText={r}
                        trigger={
                          <Button size="sm" variant="ghost" className="gap-1.5 text-xs h-8">
                            <Wand2 className="h-3.5 w-3.5" /> Rewrite
                          </Button>
                        }
                      />
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
                className="bg-gradient-brand text-primary-foreground hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] shadow-[var(--shadow-glow)] hover:shadow-[0_15px_50px_-10px_oklch(0.7_0.22_290/0.7)] transition-all duration-300 font-semibold"
              >
                {loadingThread ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flame className="h-4 w-4" />}
                {loadingThread ? "Writing thread…" : "Generate Viral Thread"}
              </Button>
            </div>
          </Card>

          {loadingThread && thread.length === 0 && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-4 bg-card/40 border-border/60 relative overflow-hidden">
                  <div className="absolute inset-0 shimmer-bg" />
                  <div className="flex gap-3 relative">
                    <div className="h-7 w-7 rounded-full bg-muted/60" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 rounded bg-muted/60 w-full" />
                      <div className="h-3 rounded bg-muted/60 w-4/5" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {thread.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <CopyButton text={fullThreadText} />
              </div>
              {thread.map((t, i) => (
                <Card
                  key={i}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="animate-card-in p-4 bg-card/60 border-border/70 hover:border-primary/40 hover:shadow-[var(--shadow-glow-sm)] transition-all duration-300 flex gap-3"
                >
                  <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-brand grid place-items-center text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow-sm)]">
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

        <Testimonials />

        {/* Chrome Extension banner */}
        <section className="px-2">
          <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card/60 to-accent/15 backdrop-blur p-6 sm:p-8">
            <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-accent/25 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
              <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-brand grid place-items-center shadow-[var(--shadow-glow)] animate-glow-pulse">
                <Chrome className="h-7 w-7 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded-full mb-2">
                  Coming soon
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">
                  Want replies directly while using X?
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Get our Chrome Extension and generate smart replies inline — without leaving your timeline.
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => toast.success("You're on the list! We'll email you when the extension launches.")}
                className="w-full sm:w-auto shrink-0 bg-gradient-brand text-primary-foreground hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] shadow-[var(--shadow-glow)] hover:shadow-[0_15px_50px_-10px_oklch(0.7_0.22_290/0.7)] transition-all duration-300 font-semibold group"
              >
                <Chrome className="h-4 w-4" />
                Get Chrome Extension
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-10 text-center text-xs text-muted-foreground">
        Made with <span className="text-red-400">❤️</span> using Lovable
      </footer>
    </div>
  );
}
