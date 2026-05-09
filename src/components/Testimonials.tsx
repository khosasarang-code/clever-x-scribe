import { useEffect, useRef, useState } from "react";
import { Star, ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Testimonial = {
  name: string;
  handle: string;
  avatar: number;
  text: string;
  role?: string;
};

const TESTIMONIALS: Testimonial[] = [
  { name: "Alex Chen", handle: "techfounder", avatar: 12, role: "Founder, Indie SaaS", text: "This tool literally 10x'd my reply game. Went from 20 likes to 200+ on average within two weeks." },
  { name: "Sarah Patel", handle: "growthwithai", avatar: 47, role: "Growth Marketer", text: "The thread generator is insane. Posted one and gained 800 followers in 2 days. Nothing else comes close." },
  { name: "Mike Rivera", handle: "marketingmike", avatar: 33, role: "Content Strategist", text: "Best AI tool for X I've used. Replies feel natural, not robotic — my audience actually engages back." },
  { name: "Chris Walker", handle: "startupchris", avatar: 8, role: "Startup CEO", text: "Saved me 2 hours a day. Now I actually enjoy replying to comments instead of dreading it." },
  { name: "Jenna Lee", handle: "jennabuilds", avatar: 25, role: "Indie Hacker", text: "Went from lurker to 5k followers in a month. The witty tone is gold and converts like crazy." },
  { name: "Dev Kapoor", handle: "devbyday", avatar: 14, role: "Developer", text: "I was paying $40/mo for a worse tool. Switched here and never looked back. Worth every cent." },
  { name: "Maya Soto", handle: "mayawrites", avatar: 49, role: "Copywriter", text: "My engagement tripled. Threads sound exactly like me, just sharper and more punchy." },
  { name: "Tom Becker", handle: "tombuilds", avatar: 60, role: "Product Designer", text: "Finally an AI that doesn't sound like ChatGPT. Replies actually land with real humans." },
  { name: "Priya Shah", handle: "priyaongrowth", avatar: 44, role: "Creator Coach", text: "I built my whole audience with this. 10/10 would recommend to any creator serious about X." },
  { name: "Noah Fischer", handle: "noahsaas", avatar: 65, role: "SaaS Founder", text: "Closed two deals from replies generated here. ROI was instant — paid for itself in a day." },
  { name: "Lily Tran", handle: "lilycodes", avatar: 32, role: "Engineer", text: "The bold and witty tones are chef's kiss. My quote tweets go off now consistently." },
  { name: "Marcus Hill", handle: "marcusbuilds", avatar: 53, role: "Solopreneur", text: "Posted one thread, hit 100k impressions. This is unfair leverage for anyone building in public." },
  { name: "Emma Reyes", handle: "emmascales", avatar: 23, role: "Brand Strategist", text: "Clients ask how I'm so consistent on X. This is the secret. Cannot believe it's this affordable." },
  { name: "Jordan Blake", handle: "jordancreates", avatar: 56, role: "Content Creator", text: "Doubled my newsletter signups from X traffic alone. The replies pull people into my profile." },
  { name: "Aisha Khan", handle: "aishabuilds", avatar: 41, role: "Tech Founder", text: "I've tried every X growth tool out there. Nothing comes close to the quality of this one." },
];

// Duplicate the list so the marquee loops seamlessly.
const LOOP = [...TESTIMONIALS, ...TESTIMONIALS];

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <Card className="w-[320px] sm:w-[360px] shrink-0 p-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur border-border/60 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_oklch(0.72_0.18_245/0.4)] space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={`https://i.pravatar.cc/120?img=${t.avatar}`}
            alt={t.name}
            loading="lazy"
            className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/40"
          />
          <BadgeCheck className="absolute -bottom-1 -right-1 h-4 w-4 text-primary fill-background" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold leading-tight truncate">{t.name}</span>
          </div>
          <div className="text-xs text-muted-foreground truncate">@{t.handle}</div>
        </div>
        <div className="flex gap-0.5" aria-label="5 out of 5 stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-primary text-primary" />
          ))}
        </div>
      </div>
      <p className="text-sm text-foreground/90 leading-relaxed">"{t.text}"</p>
      {t.role && <p className="text-xs text-muted-foreground pt-1 border-t border-border/40">{t.role}</p>}
    </Card>
  );
}

export function Testimonials() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  // Auto-scroll loop
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;
    let last = performance.now();
    const speed = 30; // px/sec

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!paused) {
        el.scrollLeft += speed * dt;
        // Reset when we've scrolled past the first copy
        const half = el.scrollWidth / 2;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 380, behavior: "smooth" });
  };

  return (
    <section className="space-y-8 py-8">
      <div className="text-center space-y-3 max-w-2xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
          What Creators Are <span className="text-gradient-brand">Saying</span>
        </h2>
        <p className="text-base text-muted-foreground">
          Join thousands growing on X with SmartReply.
        </p>
      </div>

      <div
        className="relative group"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-background to-transparent z-10" />

        {/* Scroll buttons */}
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous"
          onClick={() => scrollBy(-1)}
          className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-background/80 backdrop-blur border-primary/30 hover:bg-primary/10 hover:border-primary opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Next"
          onClick={() => scrollBy(1)}
          className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-background/80 backdrop-blur border-primary/30 hover:bg-primary/10 hover:border-primary opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar px-4"
          style={{ scrollbarWidth: "none" }}
        >
          {LOOP.map((t, i) => (
            <TestimonialCard key={`${t.handle}-${i}`} t={t} />
          ))}
        </div>
      </div>

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>
    </section>
  );
}
