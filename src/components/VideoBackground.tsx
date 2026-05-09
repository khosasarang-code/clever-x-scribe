/**
 * Full-page subtle background video. Sits behind everything (z-index: -1).
 * Must be a direct child of the root layout — no parent with overflow:hidden.
 */
export function VideoBackground() {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        zIndex: -1,
        opacity: 0.15,
        pointerEvents: "none",
      }}
    >
      <source
        src="https://cdn.coverr.co/videos/coverr-typing-on-a-phone-1584/1080p.mp4"
        type="video/mp4"
      />
    </video>
  );
}
