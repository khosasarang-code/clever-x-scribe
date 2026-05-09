/**
 * Full-page subtle background video. Sits behind everything (z-index: -1).
 * Dark base color from the page background remains underneath for readability.
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
        opacity: 0.18,
        pointerEvents: "none",
      }}
    >
      <source
        src="https://videos.pexels.com/video-files/3931604/3931604-uhd_2560_1440_25fps.mp4"
        type="video/mp4"
      />
    </video>
  );
}
