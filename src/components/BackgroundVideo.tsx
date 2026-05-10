// Full-screen ambient background video that sits behind all page content.
const VIDEO_SRC = "https://images.pexels.com/videos/3183192/pexels-video-3183192.mp4";

export function BackgroundVideo() {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      id="background-video"
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        zIndex: -1,
      }}
    >
      <source src={VIDEO_SRC} type="video/mp4" />
      Your browser does not support HTML5 video.
    </video>
  );
}
