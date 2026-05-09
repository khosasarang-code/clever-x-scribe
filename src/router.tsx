import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      {/* ✅ FULLSCREEN VIDEO BACKGROUND — covers entire page */}
      <video
        autoPlay
        muted
        loop
        playsInline
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
        <source
          src="https://www.pexels.com/video/3931604/download/"
          type="video/mp4"
        />
      </video>

      {/* Page content renders on top */}
      <Outlet />
    </>
  );
}
