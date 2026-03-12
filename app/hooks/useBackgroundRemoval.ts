"use client";

import { useState, useCallback, useRef } from "react";

type Status = "idle" | "loading" | "done" | "error";

type RemovalState = {
  status: Status;
  resultUrl: string | null;
  error: string | null;
  progress: number;
};

const initialState: RemovalState = {
  status: "idle",
  resultUrl: null,
  error: null,
  progress: 0,
};

export function useBackgroundRemoval() {
  const [states, setStates] = useState<Record<string, RemovalState>>({});
  const abortRefs = useRef<Record<string, AbortController>>({});

  const getState = useCallback(
    (key: string): RemovalState => states[key] ?? initialState,
    [states]
  );

  const removeBackground = useCallback(async (imageUrl: string, key: string) => {
    // Abort any in-flight request for this key
    abortRefs.current[key]?.abort();
    const controller = new AbortController();
    abortRefs.current[key] = controller;

    setStates((prev) => ({
      ...prev,
      [key]: { status: "loading", resultUrl: null, error: null, progress: 0 },
    }));

    try {
      // Dynamic import — the library is large, only load when needed
      const { removeBackground: removeBg } = await import(
        "@imgly/background-removal"
      );

      const blob = await removeBg(imageUrl, {
        model: "isnet_fp16",
        device: "gpu",
        output: { format: "image/png", quality: 0.9 },
        progress: (_step: string, current: number, total: number) => {
          if (controller.signal.aborted) return;
          const pct = total > 0 ? Math.round((current / total) * 100) : 0;
          setStates((prev) => ({
            ...prev,
            [key]: { ...prev[key], progress: pct },
          }));
        },
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(blob);
      setStates((prev) => ({
        ...prev,
        [key]: { status: "done", resultUrl: url, error: null, progress: 100 },
      }));
    } catch (err) {
      if (controller.signal.aborted) return;
      setStates((prev) => ({
        ...prev,
        [key]: {
          status: "error",
          resultUrl: null,
          error: err instanceof Error ? err.message : "Processing failed",
          progress: 0,
        },
      }));
    }
  }, []);

  const reset = useCallback((key: string) => {
    abortRefs.current[key]?.abort();
    setStates((prev) => {
      // Revoke the object URL to free memory
      if (prev[key]?.resultUrl) URL.revokeObjectURL(prev[key].resultUrl!);
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  return { getState, removeBackground, reset };
}
