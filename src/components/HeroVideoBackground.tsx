import { useEffect, useRef } from "react";

/**
 * Lightweight animated "tech" background for the hero.
 * Renders a soft particle constellation + subtle drifting gradient haze on a
 * canvas. No external video, fully on-brand, GPU-friendly. Respects
 * prefers-reduced-motion (renders a static frame).
 */
export function HeroVideoBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    type P = { x: number; y: number; vx: number; vy: number; r: number };
    let particles: P[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.min(70, Math.floor((width * height) / 16000));
      particles = Array.from({ length: target }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1.6 + 0.4,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Soft radial gradient haze
      const g = ctx.createRadialGradient(
        width * 0.7,
        height * 0.3,
        0,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.8,
      );
      g.addColorStop(0, "rgba(79,142,247,0.10)");
      g.addColorStop(0.5, "rgba(120,80,220,0.05)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      // Particles + connecting lines
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!reduce) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(160,190,255,0.55)";
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 120 * 120) {
            const a = 1 - Math.sqrt(d2) / 120;
            ctx.strokeStyle = `rgba(120,160,240,${a * 0.18})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      if (!reduce) rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    draw();
    const onResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      resize();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden -z-10"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* Bottom fade so content sits cleanly above the canvas */}
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background:
            "linear-gradient(to bottom, transparent, var(--background) 95%)",
        }}
      />
    </div>
  );
}
