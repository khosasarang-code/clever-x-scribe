import { useLocation } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Wraps route content with a smooth fade + slight slide on path change.
 * Pure CSS (no extra deps), respects prefers-reduced-motion via .reveal rules.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [key, setKey] = useState(location.pathname);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const pending = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname === key) return;
    pending.current = location.pathname;
    setPhase("out");
    const t = setTimeout(() => {
      setKey(pending.current);
      setPhase("in");
    }, 180);
    return () => clearTimeout(t);
  }, [location.pathname, key]);

  return (
    <div
      key={key}
      data-phase={phase}
      className="page-transition"
    >
      {children}
    </div>
  );
}
