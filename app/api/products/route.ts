import { NextRequest, NextResponse } from "next/server";
import { getImageUrl } from "@/app/lib/image";

export async function GET(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get("store_id");
  if (!storeId) {
    return NextResponse.json({ message: "store_id is required" }, { status: 400 });
  }

  const headers = {
    "X-Client-Id": process.env.SELORAX_CLIENT_ID!,
    "X-Client-Secret": process.env.SELORAX_CLIENT_SECRET!,
    "X-Store-Id": storeId,
  };

  try {
    const res = await fetch(`${process.env.BASE_URL}/api/apps/v1/products`, {
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    // Fetch each product's details in parallel to get the first image
    const products = data.data ?? [];
    const enriched = await Promise.all(
      products.map(async (p: { product_id: number }) => {
        try {
          const detailRes = await fetch(
            `${process.env.BASE_URL}/api/apps/v1/products/${p.product_id}`,
            { headers }
          );
          if (!detailRes.ok) return { ...p, thumbnail: null };
          const detail = await detailRes.json();
          const variants = detail.data?.variants ?? [];
          const firstImage = variants
            .map((v: { images?: string | null }) => v.images)
            .filter(Boolean)
            .flatMap((img: string) => img.split(",").map((s: string) => s.trim()))
            .find(Boolean);
          return { ...p, thumbnail: firstImage ? getImageUrl(firstImage) : null };
        } catch {
          return { ...p, thumbnail: null };
        }
      })
    );

    return NextResponse.json({ ...data, data: enriched });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      { message: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
