"use client";

import { useEffect, useCallback } from "react";
import { useBackgroundRemoval } from "../hooks/useBackgroundRemoval";

type Props = {
  imageUrl: string;
  alt: string;
  onClose: () => void;
};

export default function ImagePreviewModal({ imageUrl, alt, onClose }: Props) {
  const { getState, removeBackground, reset } = useBackgroundRemoval();

  const bgKey = imageUrl;
  const state = getState(bgKey);
  const isProcessing = state.status === "loading";
  const isDone = state.status === "done";
  const isError = state.status === "error";
  const displayUrl = isDone && state.resultUrl ? state.resultUrl : imageUrl;

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
          <span className="truncate text-sm font-medium text-zinc-700">
            {alt}
          </span>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Image area */}
        <div className="relative flex flex-1 items-center justify-center overflow-auto bg-zinc-50 p-6">
          {/* Checkerboard for transparent images */}
          {isDone && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, #e4e4e7 25%, transparent 25%), linear-gradient(-45deg, #e4e4e7 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e4e4e7 75%), linear-gradient(-45deg, transparent 75%, #e4e4e7 75%)",
                backgroundSize: "16px 16px",
                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
              }}
            />
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayUrl}
            alt={alt}
            crossOrigin="anonymous"
            className="relative max-h-[60vh] max-w-full rounded-lg object-contain"
          />

          {/* Processing overlay */}
          {isProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-sm">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-zinc-200 border-t-zinc-700" />
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-700">
                  Removing background…
                </p>
                {state.progress > 0 && (
                  <p className="mt-1 text-xs text-zinc-400">
                    {state.progress}%
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom action bar */}
        <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3">
          <div className="text-xs text-zinc-400">
            {isError && (
              <span className="text-red-500">
                Failed to remove background. Try again.
              </span>
            )}
            {isDone && (
              <span className="text-emerald-600">
                Background removed successfully
              </span>
            )}
            {!isDone && !isError && !isProcessing && (
              <span>Click &quot;Remove Background&quot; to process</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isDone && (
              <>
                <button
                  onClick={() => reset(bgKey)}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
                >
                  Reset
                </button>
                <a
                  href={state.resultUrl!}
                  download={`${alt}-nobg.png`}
                  className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600"
                >
                  Download PNG
                </a>
              </>
            )}
            {!isDone && (
              <button
                onClick={() => removeBackground(imageUrl, bgKey)}
                disabled={isProcessing}
                className="rounded-lg bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? "Processing…" : isError ? "Retry" : "Remove Background"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
