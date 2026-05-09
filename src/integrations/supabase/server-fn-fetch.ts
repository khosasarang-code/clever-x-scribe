async function getSupabaseToken() {
  if (typeof window === "undefined") return null;

  const { supabase } = await import("./client");
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

function getRequestUrl(input: RequestInfo | URL) {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

export async function serverFnAuthFetch(input: RequestInfo | URL, init?: RequestInit) {
  const url = getRequestUrl(input);
  if (!url.includes("/_serverFn/")) {
    return fetch(input, init);
  }

  const headers = new Headers(
    init?.headers ?? (input instanceof Request ? input.headers : undefined),
  );

  try {
    const token = await getSupabaseToken();
    if (token && !headers.has("authorization")) {
      headers.set("authorization", `Bearer ${token}`);
    }
  } catch {
    // Fall back to the original request if session lookup fails.
  }

  return fetch(input, { ...init, headers });
}