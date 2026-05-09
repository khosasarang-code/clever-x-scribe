import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import {
  Sparkles, Copy, Check, Loader2, MessageSquareText, Flame, History, Trash2,
  LogOut, Crown, Wand2, ArrowRight, Zap, TrendingUp, Users, Clock, Shield,
  Star, Twitter,
} from "lucide-react";
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
import { TypewriterLogo } from "@/components/TypewriterLogo";
import { RewriteDialog } from "@/components/RewriteDialog";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { getDailyUsage, FREE_DAILY_LIMIT } from "@/utils/usage.functions";
import { createPortalSession } from "@/utils/payments.functions";
import { getPaddleEnvironment } from "@/lib/paddle";

export const Route = createFileRoute("/")({
  component: Index,
  validateSearch: z.object({ checkout: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "SmartReply AI X — Write replies people actually engage with" },
      {
        name: "description",
        content:
          "SmartReply AI X helps creators, founders & marketers grow on X. Generate smart replies and viral threads in seconds — written in your voice.",
      },
      { property: "og:title", content: "SmartReply AI X — Grow faster on X with AI" },
      {
        property: "og:description",
        content: "Write replies people engage with. Generate viral threads instantly. Save hours every week.",
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

/* ---------- Static product preview (TweetHunter-style mock) ---------- */
function ProductPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 bg-gradient-to-br from-primary/20 via-transparent to-accent/15 blur-3xl opacity-60 pointer-events-none" />
      <div className="relative rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xl shadow-[var(--shadow-elegant)] overflow-hidden">
        {/* window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border/60 bg-background/40">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          <div className="ml-3 text-[11px] text-muted-foreground font-mono">smartreplyaix.com / generate</div>
        </div>
        <div className="p-5 space-y-4">
          {/* original tweet */}
          <div className="rounded-xl border border-border/60 bg-background/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-gradient-brand grid place-items-center text-[11px] font-bold text-primary-foreground">N</div>
              <div className="text-sm">
                <div className="font-semibold leading-none">Naval</div>
                <div className="text-[11px] text-muted-foreground">@naval</div>
              </div>
            </div>
            <p className="text-sm text-foreground/90">Most people fail not from lack of talent but from lack of patience.</p>
          </div>
          {/* tone chips */}
          <div className="flex gap-1.5 flex-wrap">
            {["Witty","Bold","Helpful","Savage"].map((t,i)=>(
              <span key={t} className={`text-[11px] px-2.5 py-1 rounded-full border ${i===0?"bg-gradient-brand text-primary-foreground border-transparent":"border-border/60 text-muted-foreground"}`}>{t}</span>
            ))}
          </div>
          {/* generated replies */}
          {[
            "Patience is just talent stretched over time. Most quit before compounding kicks in.",
            "Talent gets you noticed. Patience gets you paid.",
            "The market rewards the people still showing up after everyone else got bored.",
          ].map((r, i) => (
            <div key={i} className="rounded-lg border border-border/50 bg-background/40 p-3 hover:border-primary/40 transition-colors">
              <p className="text-sm leading-relaxed">{r}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Reply {i+1} · {r.length} chars</span>
                <span className="text-[11px] text-primary font-medium">Copy</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Logo strip (avatar row) ---------- */
function CreatorStrip() {
  const ids = [12, 47, 33, 8, 25, 14, 49, 60, 65, 68];
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex -space-x-2">
        {ids.map(id => (
          <img key={id} src={`https://i.pravatar.cc/64?img=${id}`} alt="" loading="lazy"
               className="h-8 w-8 rounded-full ring-2 ring-background object-cover" />
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span className="flex items-center gap-0.5 text-amber-400">
          {Array.from({length:5}).map((_,i)=>(<Star key={i} className="h-3.5 w-3.5 fill-current" />))}
        </span>
        <span><span className="font-semibold text-foreground">10,000+</span> creators trust SmartReply AI X</span>
      </div>
    </div>
  );
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
  const { count: usedToday, refresh: refreshUsage } = useDailyUsage(Boolean(user) && !isPro);
  const navigate = useNavigate();
  const search = useSearch({ from: "/" });
  const [openingPortal, setOpeningPortal] = useState(false);

  const greetedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!user) { greetedRef.current = null; return; }
    if (greetedRef.current === user.id) return;
    greetedRef.current = user.id;
    const name =
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      user.email || "creator";
    toast.success(`Signed in as ${name}`);
  }, [user]);

  useEffect(() => {
    if (search.checkout === "success") {
      toast.success("Welcome to Pro! Unlimited generations unlocked.");
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
      } else { toast.error(message); }
    } finally { setOpeningPortal(false); }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
  };

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
    if (!tweet.trim()) { toast.error("Paste a tweet first"); return; }
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
      } else { toast.error(message); }
    } finally { setLoadingReplies(false); }
  };

  const runThread = async () => {
    if (!idea.trim()) { toast.error("Drop a thread idea first"); return; }
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
      } else { toast.error(message); }
    } finally { setLoadingThread(false); }
  };

  const fullThreadText = thread.map((t, i) => `${i + 1}/ ${t}`).join("\n\n");
  const scrollToGenerator = () => {
    document.getElementById("try-it")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <Toaster theme="dark" position="top-center" />
      <PWAEnhancements />
      <FloatingInstallButton />
      <WelcomeDialog />

      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-xl sticky top-0 z-30 bg-background/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2.5 min-w-0 hover:opacity-90 transition-opacity"
             aria-label="SmartReply AI X — Home">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-brand grid place-items-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <TypewriterLogo />
          </a>

          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 text-sm">
            <a href="#features" className="px-3 py-2 rounded-md text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-colors">Features</a>
            <a href="#how-it-works" className="px-3 py-2 rounded-md text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-colors">How it works</a>
            <a href="#testimonials" className="px-3 py-2 rounded-md text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-colors">Testimonials</a>
            <Link to="/pricing" className="px-3 py-2 rounded-md text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-colors">Pricing</Link>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {!isPro && user && (
              <span className="hidden lg:inline text-[12px] font-semibold text-amber-400">
                {Math.max(0, FREE_DAILY_LIMIT - usedToday)}/{FREE_DAILY_LIMIT} left
              </span>
            )}
            {isPro && (
              <>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-gradient-brand text-primary-foreground px-2 py-1 rounded-full">
                  <Crown className="h-3 w-3" /> Pro
                </span>
                <Button size="sm" variant="ghost" onClick={openPortal} disabled={openingPortal}
                  className="text-xs h-8 px-2 text-muted-foreground hover:text-foreground">
                  {openingPortal ? <Loader2 className="h-3 w-3 animate-spin" /> : "Billing"}
                </Button>
              </>
            )}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-gradient-brand grid place-items-center text-[11px] font-semibold text-primary-foreground">
                  {(user.email ?? "U").slice(0, 1).toUpperCase()}
                </div>
                <Button size="sm" variant="ghost" onClick={signOut} title="Sign out"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <>
                <Link to="/auth"
                  className="hidden sm:inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-foreground/90 hover:text-foreground transition-colors">
                  Sign in
                </Link>
                <Button asChild size="sm"
                  className="h-9 px-4 font-semibold bg-gradient-brand text-primary-foreground border-0 hover:opacity-95">
                  <Link to="/auth">Get started free</Link>
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

      <main>
        {/* ============== HERO ============== */}
        <section className="relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              <div className="lg:col-span-6 space-y-7 animate-hero-in">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 backdrop-blur px-3 py-1 text-xs text-foreground/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Trusted by 10,000+ creators on X
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[64px] font-bold tracking-tight leading-[1.05]">
                  Write replies people <span className="text-gradient-brand">actually engage</span> with.
                </h1>

                <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                  SmartReply AI X helps creators, founders and marketers grow on X.
                  Generate smart replies and viral threads in seconds — written in your voice,
                  not corporate AI mush.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <Button size="lg" onClick={scrollToGenerator}
                    className="h-12 px-6 text-sm font-semibold bg-gradient-brand text-primary-foreground hover:opacity-95 shadow-[var(--shadow-glow)]">
                    Try it free <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button asChild size="lg" variant="outline"
                    className="h-12 px-6 text-sm font-semibold border-border/70 bg-card/40 backdrop-blur hover:bg-card/70">
                    <Link to="/pricing">See pricing</Link>
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> No credit card required</span>
                  <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> 10 free replies / day</span>
                  <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Cancel anytime</span>
                </div>
              </div>

              <div className="lg:col-span-6 animate-hero-in" style={{ animationDelay: "120ms" }}>
                <ProductPreview />
              </div>
            </div>

            <div className="mt-16">
              <CreatorStrip />
            </div>
          </div>
        </section>

        {/* ============== STATS STRIP ============== */}
        <section className="border-y border-border/40 bg-card/20 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { v: "10,000+", l: "Active creators" },
              { v: "1.2M+", l: "Replies generated" },
              { v: "12 sec", l: "Avg. generation time" },
              { v: "4.9 / 5", l: "Average rating" },
            ].map(s => (
              <div key={s.l}>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient-brand">{s.v}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ============== FEATURES ============== */}
        <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 space-y-16 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-primary">Features</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Everything you need to <span className="text-gradient-brand">grow on X</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              From smart replies to viral threads, SmartReply AI X gives you the unfair advantage every serious creator deserves.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: MessageSquareText, title: "Smart AI Replies", desc: "Paste any tweet, get 9 ready-to-post replies that sound human, not robotic." },
              { icon: Flame, title: "Viral Thread Generator", desc: "Drop one idea — get a structured, engagement-ready thread in seconds." },
              { icon: Wand2, title: "12 Reply Tones", desc: "Witty, Bold, Helpful, Savage, Professional… match your audience every time." },
              { icon: TrendingUp, title: "Faster Audience Growth", desc: "Reply more, post more, grow more. Tested by 10,000+ creators." },
              { icon: Users, title: "Reply Like Top Creators", desc: "Mirror the voice of @naval, @levelsio, or save your own personal style." },
              { icon: Shield, title: "Private & Secure", desc: "We never train on your inputs. Your account, your voice, your data." },
            ].map(f => (
              <Card key={f.title} className="p-6 bg-card/50 border-border/60 hover:border-primary/40 hover:bg-card/70 transition-all duration-300">
                <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary grid place-items-center mb-4">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-base mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ============== HOW IT WORKS ============== */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
            <div className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-primary">Workflow</div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">From blank screen to posted in 30 seconds</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { step: "01", title: "Paste a tweet or idea", desc: "Drop in any tweet you want to reply to, or a single thread idea." },
              { step: "02", title: "Pick your tone & voice", desc: "Choose from 12 tones and optional creator personas." },
              { step: "03", title: "Copy. Post. Grow.", desc: "Pick the reply you love, copy with one click, and ship it." },
            ].map(s => (
              <Card key={s.step} className="p-6 bg-card/50 border-border/60">
                <div className="text-xs font-mono text-primary mb-3">{s.step}</div>
                <h3 className="font-semibold text-lg mb-1.5">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ============== TRY IT (functional generator) ============== */}
        <section id="try-it" className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 scroll-mt-24 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <div className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-primary">Try it now</div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Generate your first 9 replies</h2>
            <p className="text-muted-foreground">No login required. Your first 10 generations a day are free, forever.</p>
          </div>

          <Card className="p-5 sm:p-7 space-y-5 bg-card/70 backdrop-blur-xl border-border/70 shadow-[var(--shadow-elegant)] rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-gradient-brand grid place-items-center">
                  <MessageSquareText className="h-4 w-4 text-primary-foreground" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold">Smart Replies</h3>
              </div>
              <span className="text-[10px] uppercase tracking-wider bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">Free to try</span>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Tone</span>
              <div className="flex gap-2 overflow-x-auto pb-1.5 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {TONES.map(t => {
                  const active = tone === t;
                  return (
                    <button key={t} type="button" onClick={() => setTone(t)}
                      className={`shrink-0 h-8 px-3 rounded-full text-xs font-medium border transition-all ${
                        active
                          ? "bg-gradient-brand text-primary-foreground border-transparent"
                          : "bg-background/40 text-muted-foreground border-border/60 hover:text-foreground hover:border-primary/40"
                      }`}>
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground mr-1">Reply like</span>
              <div className="relative flex-1 min-w-[200px]">
                <input type="text" value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  onFocus={() => setPersonaOpen(true)}
                  onBlur={() => setTimeout(() => setPersonaOpen(false), 150)}
                  placeholder="@naval, @levelsio, or 'in my own style'…"
                  className="w-full h-9 px-3 rounded-md text-sm bg-input/40 border border-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary placeholder:text-muted-foreground/70" />
                {personaOpen && (
                  <div className="absolute z-20 left-0 right-0 mt-1 rounded-md border border-border/70 bg-popover shadow-lg overflow-hidden">
                    {PERSONA_PRESETS.filter(p =>
                      persona.trim() === ""
                        ? true
                        : p.handle.toLowerCase().includes(persona.toLowerCase()) ||
                          p.label.toLowerCase().includes(persona.toLowerCase()),
                    ).map(p => (
                      <button key={p.handle} type="button"
                        onMouseDown={(e) => { e.preventDefault(); setPersona(p.handle); setPersonaOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 transition-colors flex items-center justify-between gap-3">
                        <span className="font-medium">{p.handle}</span>
                        <span className="text-xs text-muted-foreground truncate">{p.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {persona && (
                <button type="button" onClick={() => setPersona("")}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors">Clear</button>
              )}
            </div>

            <Textarea value={tweet} onChange={(e) => setTweet(e.target.value)}
              placeholder="Paste any tweet text or link here…"
              className="min-h-[140px] text-base resize-none bg-input/40 border-border/60 focus-visible:ring-primary" />

            <Button size="lg" onClick={runReplies} disabled={loadingReplies}
              className="group w-full h-12 text-sm bg-gradient-brand text-primary-foreground hover:opacity-95 shadow-[var(--shadow-glow)] font-semibold rounded-lg">
              {loadingReplies ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loadingReplies ? "Crafting replies…" : "Generate Smart Replies"}
              {!loadingReplies && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
            </Button>
            <p className="text-[11px] text-center text-muted-foreground">No login needed · ~10 seconds</p>
          </Card>

          {(loadingReplies || replies.length > 0) && (
            <div className="space-y-4">
              {loadingReplies && replies.length === 0 && (
                <div className="grid sm:grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="p-4 bg-card/40 border-border/60 h-32 overflow-hidden relative">
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
                    <Card key={i} role="button" tabIndex={0}
                      style={{ animationDelay: `${i * 50}ms` }}
                      onClick={() => { navigator.clipboard.writeText(r); toast.success("Reply copied"); }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigator.clipboard.writeText(r);
                          toast.success("Reply copied");
                        }
                      }}
                      className="animate-card-in p-4 bg-card/60 border-border/70 hover:border-primary/50 hover:bg-card/80 transition-all flex flex-col gap-3 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      title="Tap to copy">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{r}</p>
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Reply {i + 1} · {r.length} chars</span>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <RewriteDialog initialText={r}
                            trigger={<Button size="sm" variant="ghost" className="gap-1.5 text-xs h-8"><Wand2 className="h-3.5 w-3.5" /> Rewrite</Button>} />
                          <CopyButton text={r} />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Thread generator */}
          <Card className="p-5 sm:p-7 space-y-4 bg-card/70 backdrop-blur-xl border-border/70 shadow-[var(--shadow-elegant)] rounded-2xl">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-gradient-brand grid place-items-center">
                <Flame className="h-4 w-4 text-primary-foreground" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold">Viral Thread Generator</h3>
            </div>
            <Textarea value={idea} onChange={(e) => setIdea(e.target.value)}
              placeholder="Drop one idea, topic, or rough outline… e.g. 'why most startups fail at distribution'"
              className="min-h-[120px] text-base resize-none bg-input/40 border-border/60 focus-visible:ring-accent" />
            <div className="flex justify-end">
              <Button size="lg" onClick={runThread} disabled={loadingThread}
                className="bg-gradient-brand text-primary-foreground hover:opacity-95 shadow-[var(--shadow-glow)] font-semibold rounded-lg">
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
              <div className="flex justify-end"><CopyButton text={fullThreadText} /></div>
              {thread.map((t, i) => (
                <Card key={i} style={{ animationDelay: `${i * 60}ms` }}
                  className="animate-card-in p-4 bg-card/60 border-border/70 hover:border-primary/40 transition-all flex gap-3">
                  <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-brand grid place-items-center text-xs font-semibold text-primary-foreground">
                    {i + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{t}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.length} chars</span>
                      <CopyButton text={t} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* ============== TESTIMONIALS ============== */}
        <section id="testimonials" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 space-y-12 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-primary">Loved by creators</div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Join <span className="text-gradient-brand">10,000+</span> creators growing on X
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { q: "This tool 10x'd my reply game. Went from 20 likes to 200+ in weeks.", n: "Alex Chen", h: "techfounder", a: 12 },
              { q: "The thread generator is insane. Gained 800 followers in 2 days.", n: "Sarah Patel", h: "growthwithai", a: 47 },
              { q: "Replies feel natural, not robotic. My audience actually engages back.", n: "Mike Rivera", h: "marketingmike", a: 33 },
              { q: "Saved me 2 hours a day. Now I enjoy replying to comments again.", n: "Chris Walker", h: "startupchris", a: 8 },
              { q: "Went from lurker to 5k followers in a month. Pure gold.", n: "Jenna Lee", h: "jennabuilds", a: 25 },
              { q: "Finally an AI that doesn't sound like ChatGPT. Worth every cent.", n: "Tom Becker", h: "tombuilds", a: 60 },
            ].map((r, i) => (
              <Card key={i} className="p-6 bg-card/50 border-border/60 hover:border-primary/40 transition-colors flex flex-col gap-4">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({length:5}).map((_,j)=>(<Star key={j} className="h-3.5 w-3.5 fill-current" />))}
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">"{r.q}"</p>
                <div className="flex items-center gap-3 mt-auto pt-3 border-t border-border/50">
                  <img src={`https://i.pravatar.cc/64?img=${r.a}`} alt={r.n} loading="lazy"
                       className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <div className="text-sm font-semibold">{r.n}</div>
                    <div className="text-xs text-muted-foreground">@{r.h}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ============== PRICING ============== */}
        <section id="pricing" className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28 space-y-12 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-primary">Pricing</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">Simple, honest pricing</h2>
            <p className="text-muted-foreground text-lg">Start free. Upgrade when you're ready to post like a machine.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <Card className="p-7 bg-card/50 border-border/60 flex flex-col gap-5">
              <div>
                <h3 className="text-xl font-semibold">Free</h3>
                <p className="text-sm text-muted-foreground mt-1">For casual posters trying it out.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">$0</span>
                <span className="text-sm text-muted-foreground">/ forever</span>
              </div>
              <ul className="space-y-2.5 text-sm flex-1">
                {["10 generations per day","9 smart replies per tweet","Viral thread builder","All 12 tone presets","Local history"].map(f => (
                  <li key={f} className="flex items-start gap-2"><Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />{f}</li>
                ))}
              </ul>
              <Button variant="outline" className="border-border/70" onClick={scrollToGenerator}>Get started free</Button>
            </Card>

            <Card className="p-7 bg-card/60 border-primary/40 flex flex-col gap-5 relative shadow-[var(--shadow-glow)]">
              <div className="absolute -top-3 left-7 text-[10px] font-semibold tracking-wider uppercase bg-gradient-brand text-primary-foreground px-2.5 py-1 rounded-full">
                Most popular
              </div>
              <div>
                <h3 className="text-xl font-semibold">Pro</h3>
                <p className="text-sm text-muted-foreground mt-1">For creators who post every day.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">$19</span>
                <span className="text-sm text-muted-foreground">/ month</span>
              </div>
              <ul className="space-y-2.5 text-sm flex-1">
                {["Unlimited replies","Unlimited viral threads","Advanced AI tones","Faster generations","Priority support","Early access to new features"].map(f => (
                  <li key={f} className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />{f}</li>
                ))}
              </ul>
              <Button asChild className="bg-gradient-brand text-primary-foreground hover:opacity-95">
                <Link to="/pricing">Upgrade to Pro</Link>
              </Button>
            </Card>
          </div>

          <p className="text-center text-xs text-muted-foreground">Cancel anytime. No hidden fees.</p>
        </section>

        {/* ============== CTA ============== */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/15 via-card/40 to-accent/15 p-10 sm:p-14 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Ready to grow on X?</h2>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto">Generate your first 9 replies in under a minute. No credit card required.</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" onClick={scrollToGenerator}
                className="h-12 px-6 bg-gradient-brand text-primary-foreground hover:opacity-95 shadow-[var(--shadow-glow)] font-semibold">
                Try it free <ArrowRight className="h-4 w-4" />
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 border-border/70 bg-card/40 backdrop-blur">
                <Link to="/pricing">View pricing</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ============== HISTORY (compact) ============== */}
        {history.length > 0 && (
          <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Your history</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => save([])}>
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </Button>
            </div>
            <div className="space-y-2">
              {history.map((h) => (
                <details key={h.id}
                  className="group rounded-lg border border-border/60 bg-card/40 p-3 transition-colors open:border-primary/40">
                  <summary className="cursor-pointer flex items-center justify-between gap-3 list-none">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        h.mode === "replies" ? "bg-primary/15 text-primary" : "bg-accent/15 text-accent"
                      }`}>{h.mode === "replies" ? "Replies" : "Thread"}</span>
                      <span className="text-sm truncate text-muted-foreground">{h.prompt}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {new Date(h.createdAt).toLocaleString()}
                    </span>
                  </summary>
                  <div className="mt-3 space-y-2">
                    {h.items.map((it, i) => (
                      <div key={i} className="text-sm p-2 rounded bg-background/40 border border-border/40 flex justify-between gap-2">
                        <span className="whitespace-pre-wrap">{it}</span>
                        <CopyButton text={it} />
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ============== FOOTER ============== */}
      <footer className="border-t border-border/50 bg-background/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Link to="/" className="inline-flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-brand grid place-items-center">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-base font-semibold tracking-tight">
                  SmartReply <span className="text-muted-foreground">AI X</span>
                </span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                The premium AI writing tool for creators, founders and marketers growing on X.
              </p>
              <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X (Twitter)"
                 className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 bg-background/40 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/90">Product</h3>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it works</a></li>
                <li><a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</a></li>
                <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/90">Company</h3>
              <ul className="space-y-2.5 text-sm">
                <li><a href="mailto:hello@smartreplyaix.com" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
                <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row gap-2 items-center justify-between text-xs text-muted-foreground">
            <p>© 2026 SmartReply AI X. All rights reserved.</p>
            <p>
              <a href="mailto:hello@smartreplyaix.com" className="hover:text-foreground transition-colors">hello@smartreplyaix.com</a>
              {" · "}
              <a href="tel:+14378558844" className="hover:text-foreground transition-colors">+1 437 855 8844</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
