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
  "ID",
  "Image",
  "Name",
  "Status",
  "Visibility",
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
  const [search, setSearch] = useState("");

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Search bar */}
      <div className="mb-4">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-zinc-200 text-sm text-zinc-400">
          {products.length === 0 ? "No products found." : "No matching products."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
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
              {filtered.map((p) => (
                <tr
                  key={p.product_id}
                  onClick={() => onProductClick(p.product_id)}
                  className="cursor-pointer transition-colors hover:bg-zinc-50/50"
                >
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                    {p.product_id}
                  </td>
                  <td className="px-4 py-2 w-14">
                    <Thumbnail src={p.thumbnail} alt={p.name} />
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900 max-w-55 truncate">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
