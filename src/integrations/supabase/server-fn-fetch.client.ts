// Injects the current Supabase access token into all server function calls
// (TanStack Start fetches /_serverFn/* from the browser without auth by default).
import { supabase } from "./client";

declare global {
  interface Window {
    __serverFnFetchPatched?: boolean;
  }
}

if (typeof window !== "undefined" && !window.__serverFnFetchPatched) {
  window.__serverFnFetchPatched = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      if (url && url.includes("/_serverFn/")) {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (token) {
          const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
          if (!headers.has("authorization")) {
            headers.set("authorization", `Bearer ${token}`);
          }
          return originalFetch(input, { ...init, headers });
        }
      }
    } catch {
      // fall through to plain fetch
    }
    return originalFetch(input, init);
  };
}

export {};
