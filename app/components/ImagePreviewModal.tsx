"use client";

import { useEffect, useCallback, useState } from "react";
import { useBackgroundRemoval } from "../hooks/useBackgroundRemoval";
import { useAppBridge } from "../contexts/AppBridgeContext";

type Props = {
  imageUrl: string;
  alt: string;
  productId: number;
  skuId: number;
  images: string;
  imageIndex: number;
  onClose: () => void;
};

export default function ImagePreviewModal({
  imageUrl,
  alt,
  productId,
  skuId,
  images,
  imageIndex,
  onClose,
}: Props) {
  const { storeId, token } = useAppBridge();
  const { getState, removeBackground, reset } = useBackgroundRemoval();

  const bgKey = imageUrl;
  const state = getState(bgKey);
  const isProcessing = state.status === "loading";
  const isDone = state.status === "done";
  const isError = state.status === "error";
  const displayUrl = isDone && state.resultUrl ? state.resultUrl : imageUrl;

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  const handleSave = useCallback(async () => {
    if (!state.resultUrl) return;

    setSaving(true);
    setSaveError(null);

    try {
      // 1. Convert blob URL to File
      const blobRes = await fetch(state.resultUrl);
      const blob = await blobRes.blob();
      const file = new File([blob], `${alt}-nobg.png`, { type: "image/png" });

      // 2. Upload to SeloraX
      const formData = new FormData();
      formData.append("files", file);

      const uploadRes = await fetch(
        `/api/products/${productId}/images?store_id=${storeId}`,
        {
          method: "POST",
          headers: { "x-session-token": token },
          body: formData,
        }
      );

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.message || "Upload failed");
      }

      const newStoredKey = uploadData.data[0].stored_key;

      // 3. Replace the old image key in the variant's images string
      const imageKeys = images
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
      imageKeys[imageIndex] = newStoredKey;
      const updatedImages = imageKeys.join(",");

      // 4. Update the variant's images (replace old image with bg-removed one)
      const updateRes = await fetch(
        `/api/products/${productId}/variants/${skuId}?store_id=${storeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-session-token": token,
          },
          body: JSON.stringify({ images: updatedImages }),
        }
      );

      const updateData = await updateRes.json();
      if (!updateRes.ok) {
        throw new Error(updateData.message || "Failed to update variant");
      }

      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [state.resultUrl, productId, skuId, storeId, token, images, imageIndex, alt]);

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

          {/* Saving overlay */}
          {saving && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-sm">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-zinc-200 border-t-emerald-600" />
              <p className="text-sm font-medium text-zinc-700">
                Saving to store…
              </p>
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
            {saveError && (
              <span className="text-red-500">{saveError}</span>
            )}
            {saved && (
              <span className="text-emerald-600">
                Saved to store successfully
              </span>
            )}
            {isDone && !saved && !saveError && (
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
                  onClick={() => {
                    reset(bgKey);
                    setSaved(false);
                    setSaveError(null);
                  }}
                  disabled={saving}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50"
                >
                  Reset
                </button>
                <button
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = state.resultUrl!;
                    a.download = `${alt}-nobg.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-200"
                >
                  Download
                </button>
                {!saved && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save to Store"}
                  </button>
                )}
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
