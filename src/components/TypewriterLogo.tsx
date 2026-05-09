import { useEffect, useState } from "react";

const PHRASES = ["SmartReply AI X"];

/**
 * Typewriter logo: types phrase, holds, deletes, loops.
 */
export function TypewriterLogo() {
  const [text, setText] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = PHRASES[phraseIdx];
    const atFull = !deleting && text === phrase;
    const atEmpty = deleting && text === "";

    let delay = deleting ? 60 : 110;
    if (atFull) delay = 2200;
    if (atEmpty) delay = 400;

    const t = setTimeout(() => {
      if (atFull) {
        setDeleting(true);
        return;
      }
      if (atEmpty) {
        setDeleting(false);
        setPhraseIdx((i) => (i + 1) % PHRASES.length);
        return;
      }
      if (deleting) {
        setText(phrase.slice(0, text.length - 1));
      } else {
        setText(phrase.slice(0, text.length + 1));
      }
    }, delay);

    return () => clearTimeout(t);
  }, [text, deleting, phraseIdx]);

  return (
    <span
      className="font-semibold tracking-tight text-sm sm:text-base leading-none tabular-nums"
      style={{ color: "#4f8ef7", minWidth: "10ch", display: "inline-block" }}
      aria-label="SmartReply AI X"
    >
      {text}
      <span
        aria-hidden="true"
        style={{
          display: "inline-block",
          width: "1px",
          marginLeft: "2px",
          background: "currentColor",
          animation: "tw-cursor-blink 1s steps(1) infinite",
        }}
      >
        &nbsp;
      </span>
    </span>
  );
}
