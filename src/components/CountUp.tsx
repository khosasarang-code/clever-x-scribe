import { useEffect, useRef, useState } from "react";

type Props = {
  /** End value (number portion). Strings like "10,000+" are split into 10000 + "+". */
  value: string;
  /** Animation duration in ms. */
  duration?: number;
  className?: string;
};

/**
 * Animated count-up that triggers when scrolled into view.
 * Parses any leading number out of the value string, animates it,
 * then re-attaches the prefix/suffix (e.g. "$", "+", "M+", "/ 5").
 */
export function CountUp({ value, duration = 1600, className = "" }: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(value);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Parse: optional prefix (non-digit), number with possible decimals/commas, suffix.
    const match = value.match(/^([^\d-]*)([\d,.]+)(.*)$/);
    if (!match) return;
    const prefix = match[1] ?? "";
    const numStr = match[2].replace(/,/g, "");
    const suffix = match[3] ?? "";
    const target = parseFloat(numStr);
    if (Number.isNaN(target)) return;
    const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    // Start at 0 until visible
    setDisplay(`${prefix}0${decimals ? "." + "0".repeat(decimals) : ""}${suffix}`);

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - t, 3);
              const current = target * eased;
              const formatted =
                decimals > 0
                  ? current.toFixed(decimals)
                  : Math.round(current).toLocaleString("en-US");
              setDisplay(`${prefix}${formatted}${suffix}`);
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            io.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
