"use client";

import { useEffect, useState, useCallback } from "react";
import StatusBadge from "./StatusBadge";
import TimeCell from "./TimeCell";
import ProductImage from "./ProductImage";
import ImagePreviewModal from "./ImagePreviewModal";
import { useAppBridge } from "../contexts/AppBridgeContext";

type Variant = {
  sku_id: number;
  product_id: number;
  variant_name: string;
  sku_code: string;
  price: number;
  compare_at_price: number | null;
  available: number;
  quantity: number;
  is_default: number;
  images: string | null;
  resolved_images: string[];
  weight: number | null;
  position: number;
  free_shipping: number;
};

type ProductDetail = {
  product_id: number;
  store_id: number;
  name: string;
  slug: string;
  category_id: number | null;
  brand_id: number | null;
  description: string | null;
  short_description: string | null;
  is_active: number;
  is_visible: number;
  is_featured: number;
  is_bestseller: number;
  created_at: string;
  updated_at: string;
  variants: Variant[];
};

type Props = {
  productId: number;
  onClose: () => void;
};

export default function ProductModal({ productId, onClose }: Props) {
  const { storeId, token } = useAppBridge();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; alt: string } | null>(null);

  useEffect(() => {
    fetch(`/api/products/${productId}?store_id=${storeId}`, {
      headers: { "x-session-token": token },
    })
      .then((res) => res.json())
      .then((res) => {
        setProduct(res.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
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

        {loading ? (
          <div className="flex h-64 items-center justify-center text-sm text-zinc-400">
            Loading product…
          </div>
        ) : error ? (
          <div className="flex h-64 items-center justify-center text-sm text-red-500">
            {error}
          </div>
        ) : product ? (
          <div className="p-6">
            {/* Header with image */}
            {(() => {
              const defaultVariant =
                product.variants.find((v) => v.is_default === 1) ??
                product.variants[0];
              const headerImages = defaultVariant?.resolved_images ?? [];

              return (
                <div className="mb-6 flex flex-col gap-4 pr-8">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold tracking-tight text-zinc-900">
                      {product.name}
                    </h2>
                    {product.short_description && (
                      <p className="mt-1 text-sm text-zinc-500">
                        {product.short_description}
                      </p>
                    )}
                  </div>
                  <ProductImage
                    images={headerImages}
                    alt={product.name}
                    size="lg"
                    onImageClick={(url) =>
                      setPreviewImage({ url, alt: product.name })
                    }
                  />
                </div>
              );
            })()}

            {/* Meta grid */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <MetaItem label="Product ID" value={String(product.product_id)} mono />
              <MetaItem label="Slug" value={product.slug} mono />
              <MetaItem label="Category" value={product.category_id ? String(product.category_id) : "—"} mono />
              <MetaItem label="Brand" value={product.brand_id ? String(product.brand_id) : "—"} mono />
            </div>

            {/* Status badges */}
            <div className="mb-6 flex flex-wrap gap-2">
              <StatusBadge active={product.is_active === 1} />
              <StatusBadge active={product.is_visible === 1} label={["Visible", "Hidden"]} />
              {product.is_featured === 1 && (
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-600/20">
                  Featured
                </span>
              )}
              {product.is_bestseller === 1 && (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-600/20">
                  Bestseller
                </span>
              )}
            </div>

            {/* Timestamps */}
            <div className="mb-6 flex gap-6">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Created</span>
                <div className="mt-1"><TimeCell date={product.created_at} /></div>
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Updated</span>
                <div className="mt-1"><TimeCell date={product.updated_at} /></div>
              </div>
            </div>

            {/* Description */}
            {/* {product.description && (
              <div className="mb-6">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Description
                </h3>
                <div
                  className="prose prose-sm max-w-none text-zinc-600"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )} */}

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Variants ({product.variants.length})
                </h3>
                <div className="space-y-3">
                  {product.variants.map((v) => {
                    return (
                      <div
                        key={v.sku_id}
                        className="rounded-lg border border-zinc-100 p-3 transition-colors hover:bg-zinc-50/50"
                      >
                        <div className="flex items-start gap-3">
                          {/* Variant images — click to open preview */}
                          <ProductImage
                            images={v.resolved_images}
                            alt={v.variant_name}
                            size="md"
                            onImageClick={(url) =>
                              setPreviewImage({ url, alt: v.variant_name })
                            }
                          />

                          {/* Variant details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-zinc-800">
                                {v.variant_name}
                              </span>
                              {v.is_default === 1 && (
                                <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-zinc-400">
                                  default
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                              <span className="font-mono text-xs text-zinc-400">
                                {v.sku_code}
                              </span>
                              <span className="tabular-nums text-zinc-800">
                                ৳{v.price.toLocaleString()}
                                {v.compare_at_price && v.compare_at_price > v.price && (
                                  <span className="ml-1.5 text-xs text-zinc-400 line-through">
                                    ৳{v.compare_at_price.toLocaleString()}
                                  </span>
                                )}
                              </span>
                              <span className="font-mono text-xs text-zinc-500">
                                Qty: {v.quantity}
                              </span>
                              <StatusBadge
                                active={v.available === 1}
                                label={["In Stock", "Out"]}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Image preview lightbox */}
      {previewImage && (
        <ImagePreviewModal
          imageUrl={previewImage.url}
          alt={previewImage.alt}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
}

function MetaItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">{label}</span>
      <p className={`mt-0.5 truncate text-sm text-zinc-700 ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </p>
    </div>
  );
}
