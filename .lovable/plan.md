This is a large polish pass. I'll do it in one focused sweep on the homepage (`src/routes/index.tsx`) and supporting components, prioritizing high-impact visuals without breaking the working generation flow.

## Scope

### 1. Hero (premium feel)
- Stronger headline + subhead with clearer value prop
- Animated gradient background layer + existing particles tuned up
- Subtle mouse-parallax on hero visual (lightweight, no Framer dependency needed)
- Typing animation showing example reply being generated
- CTA: glowing hover state + sheen sweep

### 2. Motion system
- Scroll-reveal on all major sections (already have `.reveal`, wire up via IntersectionObserver hook)
- Hover-lift on cards (use existing `.hover-lift`)
- Smooth section transitions, micro-interactions on buttons/inputs
- Respect `prefers-reduced-motion` (already in CSS)
- No Framer Motion install — use existing CSS system to keep bundle small and fast

### 3. Testimonials (TweetHunter style)
- Replace current testimonials with continuous auto-scroll marquee (two rows, opposite directions)
- Glassmorphism cards with avatar, name, @handle, verified check, quote
- Pause on hover, edge fade mask (already have `.marquee-mask`)

### 4. UI polish
- Increase section spacing/padding
- Cards: backdrop-blur + gradient borders (use existing `.glow-border`)
- Subtle noise texture (already in `AmbientBackground`)
- Tighter typography hierarchy

### 5. Product experience
- "Try Demo" section with clickable example prompts that prefill the generator
- Loading shimmer while AI generates (already have `shimmer-bg`, ensure it shows)
- Keep current auth-gated generation working

### 6. Trust & conversion
- Trust strip with "10,000+ replies generated", user count, creator logos
- Keep existing TrustBar, expand with stats row

### 7. Homepage section order
Hero → Trusted-by strip → Features → Live demo → Templates/examples → Testimonials marquee → Pricing teaser → FAQ → Final CTA

### 8. Mobile
- Larger tap targets (min 44px), tighter mobile spacing, ensure marquee + particles perform on mobile

### 9. SEO/perf
- Verify head metadata (title, description, og tags) on `/`
- Lazy-load testimonials marquee + heavy sections via dynamic import where appropriate
- Skip Vanta if not visible (already conditional)

## Out of scope this round
- Framer Motion install (CSS system covers it; happy to add later if you want)
- New routes (FAQ/Templates as separate pages) — added as sections instead
- Lighthouse audit run (I can't hit PageSpeed from here; I'll optimize what I can verify locally)

## Technical notes
- Edits centered on: `src/routes/index.tsx`, `src/components/Testimonials*.tsx`, `src/components/HeroDemo.tsx`, `src/styles.css`
- New small components if needed: `StatsStrip`, `TemplateExamples`, `FAQSection`
- No new npm dependencies
- Preserve `runReplies` / `runThread` logic and auth flow exactly

Want me to proceed with this full sweep, or trim to a subset (e.g. hero + testimonials + trust only)?