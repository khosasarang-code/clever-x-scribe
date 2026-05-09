import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const TONES = ["Witty", "Helpful", "Professional", "Viral", "Funny"] as const;
export const FREE_DAILY_LIMIT = 10;

const inputSchema = z.object({
  prompt: z.string().min(1).max(8000),
  mode: z.enum(["replies", "thread"]),
  tone: z.enum(TONES).optional(),
  environment: z.enum(["sandbox", "live"]).optional(),
});

const TONE_GUIDANCE: Record<(typeof TONES)[number], string> = {
  Witty: "Sharp, clever, playful wordplay. Quick punchlines.",
  Helpful: "Genuinely useful. Add a tip, resource, framework, or clarifying question.",
  Professional: "Polished, credible, articulate. No slang. Industry-aware.",
  Viral: "Bold hooks, contrarian takes, pattern interrupts. Built for engagement.",
  Funny: "Actually funny. Absurd, self-aware, meme-literate. Land the joke.",
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

    // Check Pro status using the security-definer helper (defaults to live env;
    // pass sandbox when in test).
    const env =
      (process.env.PADDLE_ENVIRONMENT as "sandbox" | "live" | undefined) ?? "live";
    const { data: proRow } = await supabase.rpc("has_active_subscription", {
      user_uuid: userId,
      check_env: env,
    });
    // Also check sandbox so test-mode previews unlock unlimited.
    let isPro = Boolean(proRow);
    if (!isPro) {
      const { data: sandboxRow } = await supabase.rpc("has_active_subscription", {
        user_uuid: userId,
        check_env: "sandbox",
      });
      isPro = Boolean(sandboxRow);
    }

    // Atomically check + increment daily usage.
    const { data: usageRows, error: usageErr } = await supabase.rpc(
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

    let system = data.mode === "replies" ? SYSTEM_REPLIES : SYSTEM_THREAD;
    if (data.mode === "replies" && data.tone) {
      system += `\n\nPRIMARY TONE: ${data.tone}. ${TONE_GUIDANCE[data.tone]}\nAll 9 replies should lean into this tone while still varying in angle/length.`;
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

    // Parse a JSON array out of the response, tolerant of code fences.
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
      // Fallback: split by lines
      items = cleaned
        .split(/\n+/)
        .map((l) => l.replace(/^\s*[-*\d.)]+\s*/, "").trim())
        .filter(Boolean);
    }
    return { items: items.map(String) };
  });
