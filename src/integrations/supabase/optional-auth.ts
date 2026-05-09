import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Like requireSupabaseAuth, but never throws on missing/invalid auth.
 * Injects { supabase, userId } into context. userId is null for guests.
 * supabase is anon-keyed (RLS applies as anonymous if no token).
 */
export const optionalSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      throw new Response("Server misconfigured: Supabase env missing", { status: 500 });
    }

    let userId: string | null = null;
    let token: string | null = null;
    try {
      const request = getRequest();
      const authHeader = request?.headers?.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7) || null;
      }
    } catch {
      // no request context — treat as guest
    }

    const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      global: token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : undefined,
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    if (token) {
      try {
        const { data, error } = await supabase.auth.getClaims(token);
        if (!error && data?.claims?.sub) {
          userId = data.claims.sub as string;
        }
      } catch {
        userId = null;
      }
    }

    return next({ context: { supabase, userId } });
  },
);
