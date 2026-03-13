"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  hasCredentials,
  sendReady,
  waitForToken,
  getToken,
  getStoreId,
  requestSessionToken,
} from "../lib/app-bridge";

type AppBridgeContextValue = {
  ready: boolean;
  token: string;
  storeId: string;
  refreshToken: () => Promise<string>;
};

const AppBridgeContext = createContext<AppBridgeContextValue>({
  ready: false,
  token: "",
  storeId: "",
  refreshToken: async () => "",
});

export function AppBridgeProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState("");
  const [storeId, setStoreId] = useState("");

  const refreshToken = useCallback(async () => {
    try {
      const newToken = await requestSessionToken();
      setToken(newToken);
      return newToken;
    } catch (err) {
      console.error("[AppBridge] Failed to refresh session token:", (err as Error).message);
      return "";
    }
  }, []);

  useEffect(() => {
    // Already have credentials from a previous page navigation within the iframe
    if (hasCredentials()) {
      setToken(getToken());
      setStoreId(getStoreId());
      setReady(true);
      return;
    }

    // Initiate postMessage handshake with parent dashboard
    sendReady();
    waitForToken().then(({ token: t, store_id: s }) => {
      setToken(t);
      setStoreId(s);
      setReady(true);
    });
  }, []);

  // Auto-refresh token before expiry (refresh every 9 minutes for 10min TTL)
  useEffect(() => {
    if (!ready) return;

    const interval = setInterval(() => {
      refreshToken();
    }, 540_000);

    return () => clearInterval(interval);
  }, [ready, refreshToken]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-sm text-gray-500">Connecting…</p>
        </div>
      </div>
    );
  }

  return (
    <AppBridgeContext.Provider value={{ ready, token, storeId, refreshToken }}>
      {children}
    </AppBridgeContext.Provider>
  );
}

export function useAppBridge() {
  return useContext(AppBridgeContext);
}
