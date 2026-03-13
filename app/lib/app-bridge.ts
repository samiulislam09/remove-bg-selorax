/**
 * App Bridge — postMessage protocol for iframe ↔ dashboard communication
 *
 * Flow:
 * 1. Iframe loads with ?store_id=X&host=base64url(origin)&timestamp=T&hmac=H
 * 2. Iframe sends "app-bridge:ready" to parent
 * 3. Parent responds with "selorax:session-token" containing session_token
 * 4. Iframe stores in sessionStorage for API calls
 * 5. On token expiry, iframe sends "selorax:request-session-token" to parent
 */

const STORAGE_KEY_TOKEN = "sx_session_token";
const STORAGE_KEY_STORE = "sx_app_store_id";

/** Get store_id from URL params */
export function getStoreIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("store_id") || null;
}

/** Get parent dashboard origin from URL params (base64url encoded) */
export function getHostOrigin(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const host = params.get("host");
  if (!host) return null;
  try {
    const normalized = host.replace(/-/g, "+").replace(/_/g, "/");
    return atob(normalized);
  } catch {
    return null;
  }
}

/** Send "app-bridge:ready" to parent window */
export function sendReady(): void {
  const hostOrigin = getHostOrigin();
  if (!hostOrigin || !window.parent || window.parent === window) return;
  window.parent.postMessage({ type: "app-bridge:ready" }, hostOrigin);
}

/** Listen for "selorax:session-token" from parent and store credentials */
export function waitForToken(): Promise<{ token: string; store_id: string }> {
  return new Promise((resolve) => {
    const hostOrigin = getHostOrigin();

    const handler = (event: MessageEvent) => {
      if (hostOrigin && event.origin !== hostOrigin) return;
      if (event.data?.type !== "selorax:session-token") return;

      const { token } = event.data;
      const store_id = getStoreIdFromUrl() || "";

      if (token) {
        sessionStorage.setItem(STORAGE_KEY_TOKEN, token);
        sessionStorage.setItem(STORAGE_KEY_STORE, store_id);
      }

      window.removeEventListener("message", handler);
      resolve({ token, store_id });
    };

    window.addEventListener("message", handler);
  });
}

/** Request a fresh session token from the parent dashboard */
export function requestSessionToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const hostOrigin = getHostOrigin();
    if (!hostOrigin || !window.parent || window.parent === window) {
      return reject(new Error("Not in iframe"));
    }

    const timeout = setTimeout(() => {
      window.removeEventListener("message", handler);
      reject(new Error("Session token request timed out"));
    }, 10000);

    const handler = (event: MessageEvent) => {
      if (hostOrigin && event.origin !== hostOrigin) return;
      if (event.data?.type !== "selorax:session-token") return;

      clearTimeout(timeout);
      window.removeEventListener("message", handler);

      const { token } = event.data;
      if (token) {
        sessionStorage.setItem(STORAGE_KEY_TOKEN, token);
        resolve(token);
      } else {
        reject(new Error("No token received"));
      }
    };

    window.addEventListener("message", handler);
    window.parent.postMessage({ type: "selorax:request-session-token" }, hostOrigin);
  });
}

/** Get stored session token */
export function getToken(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(STORAGE_KEY_TOKEN) || "";
}

/** Get stored store_id */
export function getStoreId(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(STORAGE_KEY_STORE) || "";
}

/** Check if we already have credentials */
export function hasCredentials(): boolean {
  return !!(getToken() && getStoreId());
}
