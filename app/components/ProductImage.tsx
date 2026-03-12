"use client";

import { useState } from "react";

type RemoveBgState = {
  status: "idle" | "loading" | "done" | "error";
  resultUrl: string | null;
  progress: number;
};

type Props = {
  images: string[];
  alt: string;
  size?: "sm" | "md" | "lg";
  /** Per-image removal state keyed by image index */
  removeBgStates?: Record<number, RemoveBgState>;
  /** Called when the user clicks "Remove BG" on an image */
  onRemoveBg?: (imageUrl: string, index: number) => void;
  /** Called when the user clicks "Reset" to restore original */
  onResetBg?: (index: number) => void;
};

const sizes = {
  sm: "h-10 w-10",
  md: "h-20 w-20",
  lg: "h-40 w-40",
};

const imgSizes = {
  sm: 40,
  md: 80,
  lg: 160,
};

export default function ProductImage({
  images,
  alt,
  size = "md",
  removeBgStates,
  onRemoveBg,
  onResetBg,
}: Props) {
  const [errored, setErrored] = useState<Set<number>>(new Set());

  const validImages = images.filter((_, i) => !errored.has(i));

  if (images.length === 0 || validImages.length === 0) {
    return <Placeholder size={size} />;
  }

  const showOverlay = size !== "sm" && (onRemoveBg || onResetBg);

  return (
    <div className="flex flex-wrap gap-2">
      {images.map((src, i) => {
        if (errored.has(i)) return null;
        const state = removeBgStates?.[i];
        const displayUrl = state?.status === "done" && state.resultUrl ? state.resultUrl : src;
        const isProcessing = state?.status === "loading";
        const isDone = state?.status === "done";
        const isError = state?.status === "error";

        return (
          <div
            key={i}
            className={`${sizes[size]} group relative shrink-0 overflow-hidden rounded-lg bg-zinc-100`}
          >
            {/* Checkerboard background for transparent images */}
            {isDone && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #e4e4e7 25%, transparent 25%), linear-gradient(-45deg, #e4e4e7 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e4e4e7 75%), linear-gradient(-45deg, transparent 75%, #e4e4e7 75%)",
                  backgroundSize: `${Math.max(imgSizes[size] / 8, 8)}px ${Math.max(imgSizes[size] / 8, 8)}px`,
                  backgroundPosition: `0 0, 0 ${Math.max(imgSizes[size] / 16, 4)}px, ${Math.max(imgSizes[size] / 16, 4)}px -${Math.max(imgSizes[size] / 16, 4)}px, -${Math.max(imgSizes[size] / 16, 4)}px 0px`,
                }}
              />
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayUrl}
              alt={`${alt} ${i + 1}`}
              crossOrigin="anonymous"
              className="relative h-full w-full object-cover"
              onError={() => setErrored((prev) => new Set(prev).add(i))}
            />

            {/* Processing overlay */}
            {isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 backdrop-blur-sm">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {state.progress > 0 && (
                  <span className="text-[10px] font-medium text-white">
                    {state.progress}%
                  </span>
                )}
              </div>
            )}

            {/* Error overlay */}
            {isError && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 backdrop-blur-sm">
                <span className="text-[10px] font-bold text-red-700">Failed</span>
              </div>
            )}

            {/* Hover action buttons */}
            {showOverlay && !isProcessing && (
              <div className="absolute inset-0 flex items-end justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex w-full gap-0.5 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-1.5 pt-6">
                  {!isDone ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveBg?.(src, i);
                      }}
                      className="flex-1 rounded-md bg-white/90 px-1.5 py-1 text-[10px] font-semibold text-zinc-800 shadow-sm transition-colors hover:bg-white"
                    >
                      Remove BG
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onResetBg?.(i);
                        }}
                        className="flex-1 rounded-md bg-white/90 px-1.5 py-1 text-[10px] font-semibold text-zinc-800 shadow-sm transition-colors hover:bg-white"
                      >
                        Reset
                      </button>
                      <a
                        href={state!.resultUrl!}
                        download={`${alt}-${i + 1}-nobg.png`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 rounded-md bg-emerald-500/90 px-1.5 py-1 text-center text-[10px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
                      >
                        Save
                      </a>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Placeholder({ size }: { size: "sm" | "md" | "lg" }) {
  return (
    <div
      className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-lg bg-zinc-100`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        className="text-zinc-300"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
        <path d="M6 16l3.5-4.5L12 15l2.5-3L18 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
