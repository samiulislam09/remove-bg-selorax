"use client";

import { useState } from "react";

type Props = {
  images: string[];
  alt: string;
  size?: "sm" | "md" | "lg";
  onImageClick?: (imageUrl: string, index: number) => void;
};

const sizes = {
  sm: "h-10 w-10",
  md: "h-20 w-20",
  lg: "h-40 w-40",
};

export default function ProductImage({
  images,
  alt,
  size = "md",
  onImageClick,
}: Props) {
  const [errored, setErrored] = useState<Set<number>>(new Set());

  const validImages = images.filter((_, i) => !errored.has(i));

  if (images.length === 0 || validImages.length === 0) {
    return <Placeholder size={size} />;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {images.map((src, i) => {
        if (errored.has(i)) return null;
        return (
          <div
            key={i}
            onClick={() => onImageClick?.(src, i)}
            className={`${sizes[size]} shrink-0 overflow-hidden rounded-lg bg-zinc-100 ${onImageClick ? "cursor-pointer ring-zinc-200 transition-all hover:ring-2 hover:shadow-md" : ""}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${alt} ${i + 1}`}
              crossOrigin="anonymous"
              className="h-full w-full object-cover"
              onError={() => setErrored((prev) => new Set(prev).add(i))}
            />
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
