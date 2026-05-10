import { Star, BadgeCheck } from "lucide-react";

type T = { q: string; n: string; h: string; a: number };

const ROW_A: T[] = [
  { q: "This tool 10x'd my reply game. Went from 20 likes to 200+ in weeks.", n: "Alex Chen", h: "techfounder", a: 12 },
  { q: "The thread generator is insane. Gained 800 followers in 2 days.", n: "Sarah Patel", h: "growthwithai", a: 47 },
  { q: "Replies feel natural, not robotic. My audience actually engages back.", n: "Mike Rivera", h: "marketingmike", a: 33 },
  { q: "Saved me 2 hours a day. Now I enjoy replying to comments again.", n: "Chris Walker", h: "startupchris", a: 8 },
  { q: "Went from lurker to 5k followers in a month. Pure gold.", n: "Jenna Lee", h: "jennabuilds", a: 25 },
  { q: "Finally an AI that doesn't sound like ChatGPT. Worth every cent.", n: "Tom Becker", h: "tombuilds", a: 60 },
];

const ROW_B: T[] = [
  { q: "I write threads in 30 seconds now. My engagement doubled in 3 weeks.", n: "Priya Shah", h: "priyabuilds", a: 49 },
  { q: "Best $19 I spend every month. Period.", n: "Daniel Kim", h: "dankimx", a: 14 },
  { q: "Sounds like me — only sharper. My DMs exploded.", n: "Lara Moreno", h: "laraonx", a: 65 },
  { q: "From 200 to 12k followers in 4 months. SmartReply is the secret.", n: "Owen Hart", h: "owenwrites", a: 11 },
  { q: "The persona feature is a cheat code for creators.", n: "Mei Tanaka", h: "meigrowth", a: 68 },
  { q: "Killed my writer's block. I post daily now.", n: "Ivan Volkov", h: "ivanships", a: 5 },
];

function Card({ t }: { t: T }) {
  return (
    <article
      className="marquee-card group relative shrink-0 w-[320px] sm:w-[360px] rounded-2xl border border-border/60 bg-card/50 backdrop-blur-xl p-5 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.5)] hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow-sm)] transition-all duration-300"
    >
      <div className="flex items-center gap-3">
        <img
          src={`https://i.pravatar.cc/96?img=${t.a}`}
          alt={t.n}
          loading="lazy"
          className="h-11 w-11 rounded-full object-cover ring-2 ring-border/40"
        />
        <div className="min-w-0">
          <div className="text-sm font-semibold leading-none truncate">{t.n}</div>
          <div className="text-xs text-muted-foreground mt-1 truncate">@{t.h}</div>
        </div>
        <div className="ml-auto flex items-center gap-0.5 text-amber-400">
          {Array.from({ length: 5 }).map((_, j) => (
            <Star key={j} className="h-3 w-3 fill-current" />
          ))}
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-foreground/90">"{t.q}"</p>
    </article>
  );
}

function Row({ items, reverse = false }: { items: T[]; reverse?: boolean }) {
  // duplicate for seamless loop
  const doubled = [...items, ...items];
  return (
    <div className="marquee-mask">
      <div
        className="marquee-row flex gap-5 w-max"
        style={{
          animationDirection: reverse ? "reverse" : "normal",
          animationDuration: reverse ? "55s" : "45s",
        }}
      >
        {doubled.map((t, i) => (
          <Card key={`${t.h}-${i}`} t={t} />
        ))}
      </div>
    </div>
  );
}

export function TestimonialsMarquee() {
  return (
    <div className="space-y-5">
      <Row items={ROW_A} />
      <Row items={ROW_B} reverse />
    </div>
  );
}
