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
import { VantaHeroBackground } from "@/components/VantaHeroBackground";

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
      <header className="border-b border-border/50 backdrop-blur-xl sticky top-0 z-30 bg-background/60 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left: Logo */}
          <a
            href="/"
            className="flex items-center gap-2.5 min-w-0 hover:opacity-90 transition-all duration-200"
            aria-label="SmartReply AI X — Home"
          >
            <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-brand grid place-items-center shadow-[var(--shadow-glow-sm)]">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="font-semibold tracking-tight text-sm sm:text-base leading-none">
              SmartReply <span className="text-muted-foreground font-normal">AI X</span>
            </div>
          </a>

          {/* Center: Nav links */}
          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-foreground/5">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-foreground/5">
              How it Works
            </a>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-foreground/5">
              Pricing
            </Link>
          </nav>

          {/* Right: usage + auth */}
          <div className="flex items-center gap-3 shrink-0">
            {!isPro && (
              <span className="hidden lg:inline text-[11px] text-muted-foreground">
                {Math.max(0, FREE_DAILY_LIMIT - usedToday)}/{FREE_DAILY_LIMIT} left
              </span>
            )}
            {isPro && (
              <>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-gradient-brand text-primary-foreground px-2 py-1 rounded-full">
                  <Crown className="h-3 w-3" /> Pro
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={openPortal}
                  disabled={openingPortal}
                  className="text-xs h-8 px-2 text-muted-foreground hover:text-foreground"
                  title="Manage billing"
                >
                  {openingPortal ? <Loader2 className="h-3 w-3 animate-spin" /> : "Billing"}
                </Button>
              </>
            )}
            {user ? (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="h-7 w-7 rounded-full bg-gradient-brand grid place-items-center text-[11px] font-semibold text-primary-foreground ring-2 ring-background">
                  {(user.email ?? "U").slice(0, 1).toUpperCase()}
                </div>
                <Button size="sm" variant="ghost" onClick={signOut} title="Sign out" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-block"
                >
                  Sign in
                </Link>
                <Button
                  asChild
                  size="sm"
                  className="h-9 px-4 bg-gradient-brand text-primary-foreground hover:opacity-95 border-0 shadow-[var(--shadow-glow-sm)] hover:shadow-[var(--shadow-glow)] transition-all"
                >
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 lg:py-20 space-y-20 sm:space-y-28 lg:space-y-32">
        {/* Hero */}
        <section
          id="vanta-hero"
          className="relative isolate overflow-hidden rounded-[28px] border border-border/50 min-h-[100vh] scroll-mt-24"
        >
          <VantaHeroBackground />
          <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,oklch(0.08_0.01_260/0.18)_0%,oklch(0.08_0.01_260/0.38)_55%,oklch(0.08_0.01_260/0.62)_100%)]" />
          <div className="relative z-20 grid lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-start px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          {/* LEFT: Headline + trust + benefits */}
          <div id="features" className="lg:col-span-5 space-y-6 sm:space-y-7 lg:pt-4 relative">
            {/* Trust badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur px-3.5 py-1.5 text-xs font-medium text-foreground/90 animate-hero-in"
              style={{ animationDelay: "0ms" }}
            >
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

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.02] sm:leading-[0.98] animate-hero-in"
              style={{ animationDelay: "80ms" }}
            >
              Smart Replies & Viral Threads for X —{" "}
              <span className="text-gradient-brand">That Actually Sound Like You</span>
            </h1>

            <p
              className="text-foreground/80 text-base sm:text-lg lg:text-xl leading-relaxed font-medium animate-hero-in"
              style={{ animationDelay: "160ms" }}
            >
              Stop posting forgettable replies. SmartReply AI X writes{" "}
              <span className="text-gradient-brand font-semibold">9 ready-to-post replies</span> in seconds — witty, bold, savage, or professional. Paste a tweet. Pick a tone. Watch your engagement explode.
            </p>
          </div>


          {/* RIGHT: Smart Replies generator */}
          <div
            id="smart-replies"
            className="lg:col-span-7 scroll-mt-20 animate-hero-in"
            style={{ animationDelay: "200ms" }}
          >
            <div className="relative">
              {/* Soft glow halo to make the generator pop */}
              <div className="absolute -inset-3 sm:-inset-4 rounded-3xl bg-gradient-to-br from-primary/25 via-transparent to-accent/20 blur-2xl pointer-events-none opacity-80" />
              <Card className="relative p-5 sm:p-6 space-y-4 bg-card/80 backdrop-blur-xl border-border/70 shadow-[var(--shadow-elegant)] rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-brand grid place-items-center shadow-[var(--shadow-glow-sm)]">
                      <MessageSquareText className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <h2 className="text-base sm:text-lg font-semibold">Smart Replies</h2>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                    Free to try
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Tone
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1.5 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x">
                    {TONES.map((t) => {
                      const emoji: Record<string, string> = {
                        Witty: "😏",
                        Helpful: "❤️",
                        Professional: "💼",
                        Viral: "🔥",
                        Funny: "😂",
                        Savage: "💀",
                        Controversial: "🌶️",
                        Intellectual: "🧠",
                        Bold: "💪",
                        Empathetic: "🤗",
                        Roast: "🔥",
                        Salesy: "💰",
                      };
                      const active = tone === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTone(t)}
                          className={`shrink-0 snap-start inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border transition-all duration-200 ${
                            active
                              ? "bg-gradient-brand text-primary-foreground border-transparent shadow-[var(--shadow-glow-sm)] scale-[1.02]"
                              : "bg-background/40 text-muted-foreground border-border/60 hover:text-foreground hover:border-primary/40 hover:bg-background/60"
                          }`}
                        >
                          <span className="text-sm leading-none">{emoji[t] ?? "✨"}</span>
                          <span>{t}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reply like ... */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground mr-1">
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
                  className="min-h-[160px] text-base resize-none bg-input/40 border-border/60 focus-visible:ring-primary"
                />

                <Button
                  size="lg"
                  onClick={runReplies}
                  disabled={loadingReplies}
                  className="group w-full h-12 text-sm bg-gradient-brand text-primary-foreground hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] shadow-[var(--shadow-glow)] transition-all duration-200 font-semibold rounded-lg"
                >
                  {loadingReplies ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {loadingReplies ? "Crafting replies…" : "Generate Smart Replies"}
                  {!loadingReplies && (
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  )}
                </Button>

                <p className="text-[11px] text-center text-muted-foreground">
                  No login needed · Results in ~10 seconds
                </p>
              </Card>

              {/* Trust signals below generator */}
              <div
                className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px] text-muted-foreground animate-hero-in"
                style={{ animationDelay: "320ms" }}
              >
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-400" />
                  No login needed
                </span>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="font-semibold text-foreground">12k+</span> replies generated
                </span>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-400" />
                  Natural AI
                </span>
              </div>
            </div>
          </div>
          </div>
        </section>

        {/* Replies results */}
        {(loadingReplies || replies.length > 0) && (
          <section className="space-y-4 -mt-12 sm:-mt-20">
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
        )}

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
                className="bg-gradient-brand text-primary-foreground hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] shadow-[var(--shadow-glow)] transition-all duration-200 font-semibold rounded-lg"
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

        <div id="how-it-works" className="animate-reveal-up scroll-mt-24">
          <HowItWorks />
        </div>

        <div className="animate-reveal-up">
          <RealResults />
        </div>

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

        {/* Features grid */}
        <section className="space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Everything You Need to <span className="text-gradient-brand">Win on X</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "💬", title: "9 Replies Instantly", desc: "Never stare at a blank reply box again. Get 9 options, pick your favorite, post in seconds." },
              { icon: "🎭", title: "12 Tone Presets", desc: "From Witty to Savage to Intellectual — match your mood and your audience every time." },
              { icon: "🧵", title: "Viral Thread Generator", desc: "Drop an idea, get a full structured thread ready to post. No writer's block, ever." },
              { icon: "🎯", title: "Reply Like Top Creators", desc: "Generate replies in the style of @naval, @levelsio, or your own saved voice." },
              { icon: "🧩", title: "Chrome Extension (Soon)", desc: "Generate replies directly on X without switching tabs. Stay in the flow." },
              { icon: "🚀", title: "No Login to Try", desc: "Start generating in seconds. No credit card, no signup wall." },
            ].map((f) => (
              <Card key={f.title} className="p-5 bg-card/60 border-border/70 hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow-sm)] transition-all duration-300">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-base mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats strip */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: "🔥", value: "12,000+", label: "Replies Generated" },
            { icon: "⚡", value: "~10 sec", label: "Average Generation Time" },
            { icon: "🎯", value: "12", label: "Tone Presets Available" },
            { icon: "🌍", value: "No login", label: "Needed to start" },
          ].map((s) => (
            <Card key={s.label} className="p-5 text-center bg-card/60 border-border/70 hover:border-primary/40 transition-colors">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-gradient-brand">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </Card>
          ))}
        </section>

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
                  Stay on X. Still Win.
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Our Chrome Extension lets you generate smart replies inline — right inside your timeline. No tab switching, no copy-pasting. Just click, generate, post.
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => toast.success("You're on the list! We'll email you when the extension launches.")}
                className="btn-glow w-full sm:w-auto shrink-0 bg-gradient-brand text-primary-foreground hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] shadow-[var(--shadow-glow)] hover:shadow-[0_15px_50px_-10px_oklch(0.7_0.22_290/0.7)] transition-all duration-300 font-semibold group"
              >
                <Chrome className="h-4 w-4" />
                Join the Waitlist
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 bg-background/40 mt-10">
        <div className="container max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10">
            <div className="col-span-2 space-y-4">
              <Link to="/" className="inline-flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-brand grid place-items-center shadow-[var(--shadow-glow-sm)]">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-base font-semibold tracking-tight">
                  SmartReply <span className="text-muted-foreground">AI X</span>
                </span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                The premium AI tool for crafting smart replies and viral threads on X.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="X (Twitter)"
                  className="h-9 w-9 grid place-items-center rounded-md border border-border/60 bg-background/40 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-background/70 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="h-9 w-9 grid place-items-center rounded-md border border-border/60 bg-background/40 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-background/70 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.37V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
                  </svg>
                </a>
              </div>
            </div>

            {[
              {
                title: "Product",
                links: [
                  { label: "Features", href: "#features" },
                  { label: "Pricing", href: "/pricing" },
                ],
              },
              {
                title: "Support",
                links: [
                  { label: "Contact", href: "mailto:hello@smartreplyaix.com" },
                  { label: "Help", href: "#features" },
                ],
              },
              {
                title: "Legal",
                links: [
                  { label: "Privacy Policy", href: "#" },
                  { label: "Terms of Service", href: "#" },
                ],
              },
            ].map((col) => (
              <div key={col.title} className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/90">
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              © 2026 SmartReply AI X. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Made with <span className="text-red-400">❤️</span> using Lovable
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
