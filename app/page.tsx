"use client";

import { useEffect, useState } from "react";
import ProductTable, { type Product } from "./components/ProductTable";
import ProductModal from "./components/ProductModal";
import { useAppBridge } from "./contexts/AppBridgeContext";

type ApiResponse = {
  data: Product[];
  pagination: { page: number; limit: number; total: number };
  status: number;
};

export default function Home() {
  const { storeId, token } = useAppBridge();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/products?store_id=${storeId}`, {
      headers: { "x-session-token": token },
    })
      .then((res) => res.json())
      .then((data: ApiResponse) => {
        console.log("Products:", data);
        setProducts(data.data);
        setTotal(data.pagination.total);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Products
            </h1>
            {!loading && !error && (
              <p className="mt-1 text-sm text-zinc-400">
                {total} product{total !== 1 && "s"} found
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-zinc-200 text-sm text-zinc-400">
            Loading products…
          </div>
        ) : error ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-red-200 bg-red-50 text-sm text-red-500">
            {error}
          </div>
        ) : (
          <ProductTable
            products={products}
            onProductClick={(id) => setSelectedProductId(id)}
          />
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProductId !== null && (
        <ProductModal
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
        />
      )}
    </div>
  );
}
