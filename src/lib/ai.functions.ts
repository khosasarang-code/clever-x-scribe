import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const TONES = ["Witty", "Helpful", "Professional", "Viral", "Funny", "Savage", "Controversial", "Intellectual", "Bold", "Empathetic", "Roast", "Salesy"] as const;
export const REWRITE_STYLES = ["Stronger", "Funnier", "More Viral", "Shorter", "More Professional"] as const;
export const FREE_DAILY_LIMIT = 10;

const inputSchema = z.object({
  prompt: z.string().min(1).max(8000),
  mode: z.enum(["replies", "thread"]),
  tone: z.enum(TONES).optional(),
  persona: z.string().max(80).optional(),
  environment: z.enum(["sandbox", "live"]).optional(),
});

export const PERSONA_PRESETS: { handle: string; label: string; style: string }[] = [
  { handle: "@naval", label: "Naval Ravikant", style: "first-principles, calm, aphoristic, deeply thoughtful, often paradoxical one-liners about wealth, happiness, leverage" },
  { handle: "@levelsio", label: "Pieter Levels", style: "indie hacker, blunt, numbers-driven, ship-fast energy, casual lowercase, occasional emoji, real talk about building" },
  { handle: "@shreyas", label: "Shreyas Doshi", style: "PM frameworks, structured thinking, bullet-style clarity, named concepts (LNO, high-agency), executive crispness" },
  { handle: "@garyvee", label: "Gary Vaynerchuk", style: "high-energy, motivational, blunt, hustle-mindset, attention-economy takes, short punchy sentences, occasional caps" },
  { handle: "in my own style", label: "In my own style", style: "Match the writer's natural voice from the original tweet — mirror their cadence, vocabulary, formatting, and emoji habits." },
];

const TONE_GUIDANCE: Record<(typeof TONES)[number], string> = {
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

const SYSTEM_REPLIES = `You are SmartReply, an expert at writing engaging, witty, human-sounding Twitter/X replies.
Given a tweet, generate exactly 9 distinct reply options. Mix tones: insightful, witty/funny, contrarian (respectful), supportive, question-asking, value-add (with a tip/stat), bold one-liner, story-style, and meme-y.
Rules:
- Each reply MUST be under 270 characters.
- No hashtags. No "As an AI". No emojis-only replies (1-2 emojis max, optional).
- Sound like a real human. Avoid corporate fluff.
Return ONLY a JSON array of 9 strings. No commentary, no markdown fences.`;

const SYSTEM_THREAD = `You are a viral X/Twitter thread writer. Given an idea, write a complete thread of 7-10 tweets.
Rules:
- Tweet 1 is a strong hook (curiosity, bold claim, or counterintuitive insight).
- Each tweet under 270 characters.
- Each tweet stands alone but flows from the previous.
- Plain language, punchy, line breaks where useful.
- End with a CTA (follow / bookmark / reply).
- No hashtags. No numbering like "1/" — the UI will number them.
Return ONLY a JSON array of strings (one per tweet). No commentary, no markdown fences.`;

export const generateAI = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const { supabase, userId } = context;

    let isPro = false;
    {
      const env = data.environment ?? "live";
      const { data: proRow } = await supabaseAdmin.rpc("has_active_subscription", {
        user_uuid: userId,
        check_env: env,
      });
      isPro = Boolean(proRow);

      // Atomically check + increment daily usage (signed-in users only).
      const { data: usageRows, error: usageErr } = await supabaseAdmin.rpc(
        "increment_daily_usage",
        { _user_id: userId, _limit: FREE_DAILY_LIMIT, _is_pro: isPro },
      );
      if (usageErr) throw new Error(usageErr.message);
      const usage = Array.isArray(usageRows) ? usageRows[0] : usageRows;
      if (!usage?.allowed) {
        throw new Error(
          `Daily free limit of ${FREE_DAILY_LIMIT} reached. Upgrade to Pro for unlimited generations.`,
        );
      }
    }

    // Refund the credit if anything below fails (free signed-in users only).
    const refund = async () => {
      if (userId && !isPro) {
        await supabaseAdmin.rpc("decrement_daily_usage", { _user_id: userId });
      }
    };

    try {
      let system = data.mode === "replies" ? SYSTEM_REPLIES : SYSTEM_THREAD;
      if (data.mode === "replies" && data.tone) {
        const tone = data.tone as (typeof TONES)[number];
        system += `\n\nPRIMARY TONE: ${tone}. ${TONE_GUIDANCE[tone]}\nAll 9 replies should lean into this tone while still varying in angle/length.`;
      }
      if (data.mode === "replies" && data.persona && data.persona.trim()) {
        const p = data.persona.trim();
        const preset = PERSONA_PRESETS.find((x) => x.handle.toLowerCase() === p.toLowerCase());
        const styleNote = preset
          ? `Write in the voice of ${preset.label} (${preset.handle}): ${preset.style}.`
          : `Write in the voice/style of "${p}". Mirror their known cadence, vocabulary, and worldview if recognizable; otherwise interpret it as a stylistic instruction.`;
        system += `\n\nVOICE: ${styleNote}\nAll 9 replies should consistently sound like this voice while still varying in angle.`;
      }
      const userMsg =
        data.mode === "replies"
          ? `Tweet to reply to:\n\n${data.prompt}`
          : `Thread idea:\n\n${data.prompt}`;

      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: system },
            { role: "user", content: userMsg },
          ],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`AI gateway error ${res.status}: ${text}`);
      }
      const json = await res.json();
      const content: string = json.choices?.[0]?.message?.content ?? "";

      let cleaned = content.trim();
      cleaned = cleaned.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      const start = cleaned.indexOf("[");
      const end = cleaned.lastIndexOf("]");
      let items: string[] = [];
      if (start !== -1 && end !== -1) {
        try {
          items = JSON.parse(cleaned.slice(start, end + 1));
        } catch {
          items = [];
        }
      }
      if (!Array.isArray(items) || items.length === 0) {
        items = cleaned
          .split(/\n+/)
          .map((l) => l.replace(/^\s*[-*\d.)]+\s*/, "").trim())
          .filter(Boolean);
      }
      if (items.length === 0) {
        throw new Error("AI returned no usable content");
      }
      return { items: items.map(String) };
    } catch (err) {
      await refund();
      throw err;
    }
  });

const REWRITE_GUIDANCE: Record<(typeof REWRITE_STYLES)[number], string> = {
  Stronger: "Make it more impactful, confident, and assertive. Tighten weak verbs. Lead with the strongest idea.",
  Funnier: "Make it actually funny. Add wit, surprise, or a clever twist. Land the joke. Avoid try-hard.",
  "More Viral": "Make it pop. Bold hook, pattern interrupt, contrarian angle, or quotable line built for engagement.",
  Shorter: "Cut ruthlessly. Same meaning in far fewer words. Aim for under 140 characters.",
  "More Professional": "Polished, credible, articulate. Remove slang. Industry-aware tone.",
};

const rewriteSchema = z.object({
  text: z.string().min(1).max(2000),
  style: z.enum(REWRITE_STYLES),
  environment: z.enum(["sandbox", "live"]).optional(),
});

export const rewriteAI = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => rewriteSchema.parse(data))
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const { supabase, userId } = context;
    let isPro = false;
    {
      const env = data.environment ?? "live";
      const { data: proRow } = await supabaseAdmin.rpc("has_active_subscription", {
        user_uuid: userId,
        check_env: env,
      });
      isPro = Boolean(proRow);
      const { data: usageRows, error: usageErr } = await supabaseAdmin.rpc(
        "increment_daily_usage",
        { _user_id: userId, _limit: FREE_DAILY_LIMIT, _is_pro: isPro },
      );
      if (usageErr) throw new Error(usageErr.message);
      const usage = Array.isArray(usageRows) ? usageRows[0] : usageRows;
      if (!usage?.allowed) {
        throw new Error(
          `Daily free limit of ${FREE_DAILY_LIMIT} reached. Upgrade to Pro for unlimited generations.`,
        );
      }
    }

    const refund = async () => {
      if (userId && !isPro) {
        await supabaseAdmin.rpc("decrement_daily_usage", { _user_id: userId });
      }
    };

    try {
      const system = `You rewrite Twitter/X replies. Keep the original intent but transform the style.
STYLE: ${data.style}. ${REWRITE_GUIDANCE[data.style]}
Rules:
- Keep under 270 characters.
- No hashtags. No "As an AI". No markdown. No quotes around the reply.
- Sound like a real human.
Return ONLY the rewritten reply text. No commentary, no preface.`;

      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: system },
            { role: "user", content: `Original reply:\n\n${data.text}` },
          ],
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`AI gateway error ${res.status}: ${text}`);
      }
      const json = await res.json();
      let content: string = json.choices?.[0]?.message?.content ?? "";
      content = content.trim().replace(/^```[a-z]*\n?/i, "").replace(/```$/, "").trim();
      content = content.replace(/^["'`]+|["'`]+$/g, "").trim();
      if (!content) throw new Error("AI returned no content");
      return { text: content };
    } catch (err) {
      await refund();
      throw err;
    }
  });
