const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export function apiUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<{ ok: true; data: T } | { ok: false; error: string; status: number }> {
  try {
    const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
    const res = await fetch(apiUrl(path), {
      ...init,
      credentials: "include",
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(init?.headers ?? {}),
      },
    });
    const text = await res.text();
    const json = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    if (!res.ok) {
      const errMsg =
        typeof json.error === "string" ? json.error : `Permintaan gagal (${res.status})`;
      return { ok: false, error: errMsg, status: res.status };
    }
    return { ok: true, data: json as T };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Gagal menghubungi server API.",
      status: 0,
    };
  }
}
