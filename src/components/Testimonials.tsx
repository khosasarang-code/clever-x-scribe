import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

type Testimonial = {
  name: string;
  handle: string;
  avatar: number;
  text: string;
};

const TESTIMONIALS: Testimonial[] = [
  { name: "Alex Chen", handle: "techfounder", avatar: 12, text: "This tool literally 10x'd my reply game. Went from 20 likes to 200+ on average." },
  { name: "Sarah Patel", handle: "growthwithai", avatar: 47, text: "The thread generator is insane. Posted one and gained 800 followers in 2 days." },
  { name: "Mike Rivera", handle: "marketingmike", avatar: 33, text: "Best AI tool for X I've used. Replies feel natural, not robotic." },
  { name: "Chris Walker", handle: "startupchris", avatar: 8, text: "Saved me so much time. Now I actually enjoy replying to comments." },
  { name: "Jenna Lee", handle: "jennabuilds", avatar: 25, text: "Went from lurker to 5k followers in a month. The witty tone is gold." },
  { name: "Dev Kapoor", handle: "devbyday", avatar: 14, text: "I was paying $40/mo for a worse tool. Switched and never looked back." },
  { name: "Maya Soto", handle: "mayawrites", avatar: 49, text: "My engagement tripled. Threads sound exactly like me, just sharper." },
  { name: "Tom Becker", handle: "tombuilds", avatar: 60, text: "Finally an AI that doesn't sound like ChatGPT. Replies actually land." },
  { name: "Priya Shah", handle: "priyaongrowth", avatar: 44, text: "I built my whole audience with this. 10/10 would recommend to any creator." },
  { name: "Noah Fischer", handle: "noahsaas", avatar: 65, text: "Closed two deals from replies generated here. ROI was instant." },
  { name: "Lily Tran", handle: "lilycodes", avatar: 32, text: "The bold and witty tones are chef's kiss. My quote tweets go off now." },
  { name: "Marcus Hill", handle: "marcusbuilds", avatar: 53, text: "Posted one thread, hit 100k impressions. This is unfair leverage." },
];

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <Card className="w-[300px] sm:w-auto shrink-0 sm:shrink p-5 bg-card/60 border-border/70 hover:border-primary/40 transition-colors space-y-3">
      <div className="flex items-center gap-3">
        <img
          src={`https://i.pravatar.cc/80?img=${t.avatar}`}
          alt={t.name}
          loading="lazy"
          className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/30"
        />
        <div className="min-w-0">
          <div className="text-sm font-semibold leading-tight truncate">{t.name}</div>
          <div className="text-xs text-muted-foreground truncate">@{t.handle}</div>
        </div>
      </div>
      <div className="flex gap-0.5" aria-label="5 out of 5 stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
        ))}
      </div>
      <p className="text-sm text-foreground/90 leading-relaxed">"{t.text}"</p>
    </Card>
  );
}

export function Testimonials() {
  return (
    <section className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          What users are <span className="text-gradient-brand">saying</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Join thousands of creators growing on X with SmartReply.
        </p>
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="sm:hidden -mx-4 px-4 overflow-x-auto scroll-smooth snap-x snap-mandatory">
        <div className="flex gap-3 pb-2">
          {TESTIMONIALS.map((t) => (
            <div key={t.handle} className="snap-start">
              <TestimonialCard t={t} />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: grid */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TESTIMONIALS.map((t) => (
          <TestimonialCard key={t.handle} t={t} />
        ))}
      </div>
    </section>
  );
}
