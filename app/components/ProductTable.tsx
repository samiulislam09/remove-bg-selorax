import StatusBadge from "./StatusBadge";
import TimeCell from "./TimeCell";

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
};

type ProductTableProps = {
  products: Product[];
  onProductClick: (productId: number) => void;
};

const columns = [
  "ID",
  "Name",
  "Slug",
  "Status",
  "Visibility",
  "Category",
  "Brand",
  "Created",
  "Updated",
] as const;

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
      <table className="w-full min-w-[900px] text-left text-sm">
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
              <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                {p.product_id}
              </td>
              <td className="px-4 py-3 font-medium text-zinc-900 max-w-[220px] truncate">
                {p.name}
              </td>
              <td className="px-4 py-3 max-w-[180px] truncate font-mono text-xs text-zinc-400">
                {p.slug}
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
              <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                {p.brand_id ?? "—"}
              </td>
              <td className="px-4 py-3">
                <TimeCell date={p.created_at} />
              </td>
              <td className="px-4 py-3">
                <TimeCell date={p.updated_at} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
