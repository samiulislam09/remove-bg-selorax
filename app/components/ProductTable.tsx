"use client";

import { useState } from "react";
import StatusBadge from "./StatusBadge";

export type Product = {
  product_id: number;
  store_id: number;
  name: string;
  slug: string;
  category_id: number | null;
  brand_id: number | null;
  is_active: number;
  is_visible: number;
  created_at: string;
  updated_at: string;
  thumbnail: string | null;
};

type ProductTableProps = {
  products: Product[];
  onProductClick: (productId: number) => void;
};

const columns = [
  "",
  "ID",
  "Name",
  "Status",
  "Visibility",
  "Category",
] as const;

function Thumbnail({ src, alt }: { src: string | null; alt: string }) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-zinc-300">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
          <path d="M6 16l3.5-4.5L12 15l2.5-3L18 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      crossOrigin="anonymous"
      className="h-10 w-10 shrink-0 rounded-lg bg-zinc-100 object-cover"
      onError={() => setErrored(true)}
    />
  );
}

export default function ProductTable({ products, onProductClick }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-zinc-200 text-sm text-zinc-400">
        No products found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-100 bg-zinc-50/60">
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {products.map((p) => (
            <tr
              key={p.product_id}
              onClick={() => onProductClick(p.product_id)}
              className="cursor-pointer transition-colors hover:bg-zinc-50/50"
            >
              <td className="px-4 py-2 w-14">
                <Thumbnail src={p.thumbnail} alt={p.name} />
              </td>
              <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                {p.product_id}
              </td>
              <td className="px-4 py-3 font-medium text-zinc-900 max-w-[220px] truncate">
                {p.name}
              </td>
              <td className="px-4 py-3">
                <StatusBadge active={p.is_active === 1} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge
                  active={p.is_visible === 1}
                  label={["Visible", "Hidden"]}
                />
              </td>
              <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                {p.category_id ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
