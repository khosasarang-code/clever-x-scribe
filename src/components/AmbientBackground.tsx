/**
 * Subtle ambient background: slow-drifting color orbs + faint particle grain.
 * Pure CSS, GPU-friendly, fixed behind all content. Respects prefers-reduced-motion.
 */
export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Drifting color orbs */}
      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />
      <div className="ambient-orb ambient-orb-3" />

      {/* Soft noise / particle texture */}
      <div className="ambient-noise" />

      {/* Vignette to keep edges grounded */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, oklch(0.12 0.012 295 / 0.55) 100%)",
        }}
      />
    </div>
  );
}
