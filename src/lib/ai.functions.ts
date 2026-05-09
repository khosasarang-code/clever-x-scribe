import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  prompt: z.string().min(1).max(8000),
  mode: z.enum(["replies", "thread"]),
});

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
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const system = data.mode === "replies" ? SYSTEM_REPLIES : SYSTEM_THREAD;
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
