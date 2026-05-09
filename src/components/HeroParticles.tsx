/**
 * Subtle floating particle layer for the hero. Pure CSS, lightweight,
 * respects prefers-reduced-motion.
 */
const PARTICLES = Array.from({ length: 18 }, (_, i) => i);

export function HeroParticles() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden -z-[1]"
    >
      {PARTICLES.map((i) => {
        const left = (i * 53) % 100;
        const delay = (i * 0.7) % 8;
        const duration = 12 + ((i * 1.3) % 10);
        const size = 2 + (i % 3);
        return (
          <span
            key={i}
            className="hero-particle absolute rounded-full bg-primary/40"
            style={{
              left: `${left}%`,
              bottom: `-10px`,
              width: `${size}px`,
              height: `${size}px`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              filter: "blur(0.5px)",
            }}
          />
        );
      })}
    </div>
  );
}
