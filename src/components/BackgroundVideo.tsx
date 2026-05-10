// Full-screen ambient background video that sits behind all page content.
// Replace VIDEO_SRC with your own .mp4 URL (or a /public asset path) anytime.
const VIDEO_SRC =
  "https://assets.mixkit.co/videos/4990/4990-720.mp4";

export function BackgroundVideo() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="h-full w-full object-cover opacity-30"
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>
      {/* Dark overlay so foreground text stays readable */}
      <div className="absolute inset-0 bg-background/70" />
    </div>
  );
}
