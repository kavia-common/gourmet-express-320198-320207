/**
 * API helper layer:
 * - Uses env-driven base URL (REACT_APP_API_BASE preferred, then REACT_APP_BACKEND_URL).
 * - Provides safe JSON fetch with timeout and graceful fallback.
 */

const DEFAULT_TIMEOUT_MS = 7000;

/**
 * PUBLIC_INTERFACE
 * Resolve the backend base URL from environment variables.
 * @returns {string} base URL (may be empty to indicate "no backend configured")
 */
export function getApiBaseUrl() {
  const raw = (process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || "").trim();
  // Avoid trailing slashes causing double slashes when joining paths.
  return raw.replace(/\/+$/, "");
}

/**
 * PUBLIC_INTERFACE
 * Fetch JSON with timeout and reasonable defaults.
 * If the request fails, returns { ok:false, error }.
 *
 * @param {string} path API path beginning with "/" (e.g. "/restaurants")
 * @param {RequestInit} [options]
 * @param {object} [config]
 * @param {number} [config.timeoutMs]
 * @returns {Promise<{ok: true, data: any} | {ok:false, error: string, status?: number}>}
 */
export async function safeFetchJson(path, options = {}, config = {}) {
  const base = getApiBaseUrl();
  if (!base) {
    return { ok: false, error: "No API base URL configured" };
  }

  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${base}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    let payload = null;
    if (isJson) {
      payload = await res.json();
    } else {
      const text = await res.text();
      payload = text ? { message: text } : null;
    }

    if (!res.ok) {
      return {
        ok: false,
        error: (payload && payload.message) || `Request failed (${res.status})`,
        status: res.status,
      };
    }

    return { ok: true, data: payload };
  } catch (e) {
    const msg =
      e && typeof e === "object" && "name" in e && e.name === "AbortError"
        ? "Request timeout"
        : "Network error";
    return { ok: false, error: msg };
  } finally {
    clearTimeout(timer);
  }
}
