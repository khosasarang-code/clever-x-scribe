// Client-safe shared constants for the AI features.
// Kept OUT of *.functions.ts so the TanStack server-fn splitter can register
// generateAI / rewriteAI cleanly in the worker bundle.

export const TONES = [
  "Witty",
  "Helpful",
  "Professional",
  "Viral",
  "Funny",
  "Savage",
  "Controversial",
  "Intellectual",
  "Bold",
  "Empathetic",
  "Roast",
  "Salesy",
] as const;

export const REWRITE_STYLES = [
  "Stronger",
  "Funnier",
  "More Viral",
  "Shorter",
  "More Professional",
] as const;

export const FREE_DAILY_LIMIT = 10;

export const PERSONA_PRESETS: { handle: string; label: string; style: string }[] = [
  { handle: "@naval", label: "Naval Ravikant", style: "first-principles, calm, aphoristic, deeply thoughtful, often paradoxical one-liners about wealth, happiness, leverage" },
  { handle: "@levelsio", label: "Pieter Levels", style: "indie hacker, blunt, numbers-driven, ship-fast energy, casual lowercase, occasional emoji, real talk about building" },
  { handle: "@shreyas", label: "Shreyas Doshi", style: "PM frameworks, structured thinking, bullet-style clarity, named concepts (LNO, high-agency), executive crispness" },
  { handle: "@garyvee", label: "Gary Vaynerchuk", style: "high-energy, motivational, blunt, hustle-mindset, attention-economy takes, short punchy sentences, occasional caps" },
  { handle: "in my own style", label: "In my own style", style: "Match the writer's natural voice from the original tweet — mirror their cadence, vocabulary, formatting, and emoji habits." },
];

export const TONE_GUIDANCE: Record<(typeof TONES)[number], string> = {
  Witty: "Sharp, clever, playful wordplay. Quick punchlines.",
  Helpful: "Genuinely useful. Add a tip, resource, framework, or clarifying question.",
  Professional: "Polished, credible, articulate. No slang. Industry-aware.",
  Viral: "Bold hooks, contrarian takes, pattern interrupts. Built for engagement.",
  Funny: "Actually funny. Absurd, self-aware, meme-literate. Land the joke.",
  Savage: "Brutally honest, no-filter. Cutting but clever, never cruel for no reason.",
  Controversial: "Spicy hot takes that challenge consensus. Provoke debate without being toxic.",
  Intellectual: "Thoughtful, nuanced, well-reasoned. Reference ideas, frameworks, or first principles.",
  Bold: "Confident, assertive, declarative. Strong opinions stated with conviction.",
  Empathetic: "Warm, validating, emotionally intelligent. Make the reader feel seen.",
  Roast: "Playful burns and witty jabs. Punch up, keep it fun, never mean-spirited.",
  Salesy: "Persuasive and benefit-driven. Hook attention, tease value, soft CTA.",
};

export const REWRITE_GUIDANCE: Record<(typeof REWRITE_STYLES)[number], string> = {
  Stronger: "Make it more impactful, confident, and assertive. Tighten weak verbs. Lead with the strongest idea.",
  Funnier: "Make it actually funny. Add wit, surprise, or a clever twist. Land the joke. Avoid try-hard.",
  "More Viral": "Make it pop. Bold hook, pattern interrupt, contrarian angle, or quotable line built for engagement.",
  Shorter: "Cut ruthlessly. Same meaning in far fewer words. Aim for under 140 characters.",
  "More Professional": "Polished, credible, articulate. Remove slang. Industry-aware tone.",
};

export const SYSTEM_REPLIES = `You are SmartReply, an expert at writing engaging, witty, human-sounding Twitter/X replies.
Given a tweet, generate exactly 9 distinct reply options. Mix tones: insightful, witty/funny, contrarian (respectful), supportive, question-asking, value-add (with a tip/stat), bold one-liner, story-style, and meme-y.
Rules:
- Each reply MUST be under 270 characters.
- No hashtags. No "As an AI". No emojis-only replies (1-2 emojis max, optional).
- Sound like a real human. Avoid corporate fluff.
Return ONLY a JSON array of 9 strings. No commentary, no markdown fences.`;

export const SYSTEM_THREAD = `You are a viral X/Twitter thread writer. Given an idea, write a complete thread of 7-10 tweets.
Rules:
- Tweet 1 is a strong hook (curiosity, bold claim, or counterintuitive insight).
- Each tweet under 270 characters.
- Each tweet stands alone but flows from the previous.
- Plain language, punchy, line breaks where useful.
- End with a CTA (follow / bookmark / reply).
- No hashtags. No numbering like "1/" — the UI will number them.
Return ONLY a JSON array of strings (one per tweet). No commentary, no markdown fences.`;
