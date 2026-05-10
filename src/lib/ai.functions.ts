import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  TONES,
  REWRITE_STYLES,
  FREE_DAILY_LIMIT,
  PERSONA_PRESETS,
  TONE_GUIDANCE,
  REWRITE_GUIDANCE,
  SYSTEM_REPLIES,
  SYSTEM_THREAD,
} from "./ai.shared";

const inputSchema = z.object({
  prompt: z.string().min(1).max(8000),
  mode: z.enum(["replies", "thread"]),
  tone: z.enum(TONES).optional(),
  persona: z.string().max(80).optional(),
  environment: z.enum(["sandbox", "live"]).optional(),
});

export const generateAI = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const { userId } = context;

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

    const { userId } = context;
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
      const style = data.style as (typeof REWRITE_STYLES)[number];
      const system = `You rewrite Twitter/X replies. Keep the original intent but transform the style.
STYLE: ${style}. ${REWRITE_GUIDANCE[style]}
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
