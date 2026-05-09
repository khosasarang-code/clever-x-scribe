import { useEffect, useRef } from "react";

type VantaEffect = {
  destroy?: () => void;
  resize?: () => void;
};

type VantaWindow = Window & {
  THREE?: unknown;
  VANTA?: {
    NET?: (options: Record<string, unknown>) => VantaEffect;
  };
};

export function VantaHeroBackground() {
  const effectRef = useRef<VantaEffect | null>(null);

  useEffect(() => {
    const win = window as VantaWindow;
    const element = document.querySelector("#vanta-hero") as HTMLElement | null;

    if (!element || !win.THREE || !win.VANTA?.NET) return;

    effectRef.current?.destroy?.();
    effectRef.current = win.VANTA.NET({
      el: "#vanta-hero",
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 1.0,
      color: 0x4f8ef7,
      backgroundColor: 0x0a0f1e,
      points: 12.0,
      maxDistance: 20.0,
      spacing: 17.0,
    });

    const handleResize = () => effectRef.current?.resize?.();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      effectRef.current?.destroy?.();
      effectRef.current = null;
    };
  }, []);

  return <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0" />;
}