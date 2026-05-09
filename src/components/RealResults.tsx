import { Heart, MessageCircle, Repeat2, BarChart3, ArrowRight, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

type Stats = { likes: number; replies: number; reposts: number; views: number };

type Example = {
  prompt: string;
  before: { text: string; stats: Stats };
  after: { text: string; stats: Stats };
};

const EXAMPLES: Example[] = [
  {
    prompt: "Replying to a founder's tweet about shipping fast",
    before: {
      text: "Great post! Totally agree, shipping fast is so important.",
      stats: { likes: 3, replies: 0, reposts: 0, views: 142 },
    },
    after: {
      text: "Speed isn't the moat. Speed compounded over 12 months is. Most teams ship fast for 3 weeks and call it culture.",
      stats: { likes: 487, replies: 42, reposts: 71, views: 38_200 },
    },
  },
  {
    prompt: "Replying to a viral 'hot take' on remote work",
    before: {
      text: "Interesting take, thanks for sharing!",
      stats: { likes: 1, replies: 0, reposts: 0, views: 96 },
    },
    after: {
      text: "Remote didn't kill culture. Bad managers using slack as a surveillance tool did. Tools amplify whatever was already there.",
      stats: { likes: 1_240, replies: 138, reposts: 192, views: 84_500 },
    },
  },
  {
    prompt: "Replying to a build-in-public update",
    before: {
      text: "Congrats on the launch, looks awesome!",
      stats: { likes: 5, replies: 1, reposts: 0, views: 210 },
    },
    after: {
      text: "Love the pricing page. The 'free until you make $1k' line is the best onboarding copy I've read this year. Stealing the framing.",
      stats: { likes: 312, replies: 24, reposts: 38, views: 22_400 },
    },
  },
];

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toString();
}

function StatRow({ s, dim }: { s: Stats; dim?: boolean }) {
  const cls = `flex items-center gap-1.5 text-xs ${dim ? "text-muted-foreground/70" : "text-foreground/80"}`;
  return (
    <div className="flex items-center gap-4 sm:gap-5 flex-wrap">
      <span className={cls}>
        <MessageCircle className="h-3.5 w-3.5" /> {fmt(s.replies)}
      </span>
      <span className={cls}>
        <Repeat2 className="h-3.5 w-3.5" /> {fmt(s.reposts)}
      </span>
      <span className={cls}>
        <Heart className={`h-3.5 w-3.5 ${dim ? "" : "fill-rose-500 text-rose-500"}`} /> {fmt(s.likes)}
      </span>
      <span className={cls}>
        <BarChart3 className="h-3.5 w-3.5" /> {fmt(s.views)}
      </span>
    </div>
  );
}

function lift(after: number, before: number) {
  if (before <= 0) return after >= 100 ? `${fmt(after)}×` : `+${fmt(after)}`;
  const x = after / before;
  return `${x >= 10 ? Math.round(x) : x.toFixed(1)}×`;
}

export function RealResults() {
  return (
    <section className="space-y-8">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider bg-primary/15 text-primary px-2.5 py-1 rounded-full">
          <TrendingUp className="h-3 w-3" /> Real results
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
          Same Tweet. <span className="text-gradient-brand">Completely Different Results.</span>
        </h2>
        <p className="text-base text-muted-foreground">
          One sentence rewritten by AI. The difference in engagement speaks for itself.
        </p>
      </div>

      <div className="space-y-4">
        {EXAMPLES.map((ex, i) => (
          <Card
            key={i}
            className="p-4 sm:p-6 bg-card/60 backdrop-blur border-border/70 space-y-4"
          >
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {ex.prompt}
            </div>

            <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
              {/* Before */}
              <div className="rounded-xl border border-border/60 bg-background/40 p-4 space-y-3 relative">
                <div className="inline-block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                  Before
                </div>
                <p className="text-sm leading-relaxed text-foreground/70 line-through decoration-muted-foreground/40 decoration-1">
                  {ex.before.text}
                </p>
                <StatRow s={ex.before.stats} dim />
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-gradient-brand grid place-items-center shadow-[var(--shadow-glow-sm)]">
                  <ArrowRight className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>

              {/* After */}
              <div className="rounded-xl border border-primary/40 bg-gradient-to-br from-primary/10 via-card/60 to-accent/10 p-4 space-y-3 relative shadow-[var(--shadow-glow-sm)]">
                <div className="flex items-center justify-between">
                  <div className="inline-block text-[10px] font-semibold uppercase tracking-wider bg-gradient-brand text-primary-foreground px-2 py-0.5 rounded-full">
                    After
                  </div>
                  <div className="text-[11px] font-bold text-primary flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {lift(ex.after.stats.likes, ex.before.stats.likes)} likes ·{" "}
                    {lift(ex.after.stats.views, ex.before.stats.views)} views
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-foreground">{ex.after.text}</p>
                <StatRow s={ex.after.stats} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        Examples drawn from real creator results. Your mileage may vary — but rarely by much.
      </p>
    </section>
  );
}
