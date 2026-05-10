import { useEffect, useState } from "react";
import { Star, Loader2, BadgeCheck, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/Reveal";

type Review = {
  id: string;
  name: string;
  handle: string | null;
  rating: number;
  message: string;
  created_at: string;
};

function StarRow({ value, onChange, size = "h-5 w-5" }: { value: number; onChange?: (n: number) => void; size?: string }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={`${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <Star className={`${size} ${n <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
        </button>
      ))}
    </div>
  );
}

export function ReviewForm({ onSubmitted, trigger }: { onSubmitted?: () => void; trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (name.trim().length < 1) return toast.error("Please enter your name");
    if (message.trim().length < 4) return toast.error("Review must be at least 4 characters");
    if (rating < 1 || rating > 5) return toast.error("Pick a rating");

    setLoading(true);
    const cleanHandle = handle.trim().replace(/^@+/, "").slice(0, 30) || null;
    const { error } = await supabase.from("reviews").insert({
      name: name.trim().slice(0, 60),
      handle: cleanHandle,
      rating,
      message: message.trim().slice(0, 600),
    });
    setLoading(false);

    if (error) {
      toast.error("Could not submit review", { description: error.message });
      return;
    }
    toast.success("Thanks for your review!");
    setOpen(false);
    setName(""); setHandle(""); setRating(5); setMessage("");
    onSubmitted?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="bg-gradient-brand text-primary-foreground hover:opacity-95">
            <MessageSquarePlus className="h-4 w-4" /> Write a Review
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share your experience</DialogTitle>
          <DialogDescription>Your review will appear publicly on this page.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rev-name">Name</Label>
            <Input id="rev-name" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rev-handle">X / Twitter handle <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input id="rev-handle" maxLength={30} value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@yourhandle" />
          </div>
          <div className="space-y-2">
            <Label>Rating</Label>
            <StarRow value={rating} onChange={setRating} size="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rev-msg">Review</Label>
            <Textarea id="rev-msg" maxLength={600} rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What did you love about SmartReply?" />
            <p className="text-xs text-muted-foreground text-right">{message.length}/600</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={submit} disabled={loading} className="bg-gradient-brand text-primary-foreground hover:opacity-95">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UserReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("id,name,handle,rating,message,created_at")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(60);
    if (!error && data) setReviews(data as Review[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <section id="user-reviews" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24 space-y-10 scroll-mt-24">
      <Reveal className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-primary">Reviews from Users</div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          What real users are <span className="text-gradient-brand">saying</span>
        </h2>
        <p className="text-muted-foreground">Honest feedback from creators using SmartReply every day.</p>
        <div className="pt-2">
          <ReviewForm onSubmitted={load} />
        </div>
      </Reveal>

      <Reveal y={24}>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : reviews.length === 0 ? (
          <Card className="p-10 text-center bg-card/40 border-border/60">
            <p className="text-muted-foreground">Be the first to leave a review!</p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map((r) => (
              <Card key={r.id} className="p-6 bg-card/50 border-border/60 hover:border-primary/40 transition-colors space-y-3 rounded-2xl">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 font-semibold truncate">
                      {r.name}
                      {r.handle && <BadgeCheck className="h-3.5 w-3.5 text-sky-400 shrink-0" />}
                    </div>
                    {r.handle && (
                      <a
                        href={`https://x.com/${r.handle}`} target="_blank" rel="noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary truncate block"
                      >
                        @{r.handle}
                      </a>
                    )}
                  </div>
                  <StarRow value={r.rating} size="h-3.5 w-3.5" />
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">"{r.message}"</p>
                <p className="text-[11px] text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                </p>
              </Card>
            ))}
          </div>
        )}
      </Reveal>
    </section>
  );
}
