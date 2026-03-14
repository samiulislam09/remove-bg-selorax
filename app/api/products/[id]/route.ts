import { NextRequest, NextResponse } from "next/server";
import { resolveProductImages } from "@/app/lib/image";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const storeId = req.nextUrl.searchParams.get("store_id");
  if (!storeId) {
    return NextResponse.json({ message: "store_id is required" }, { status: 400 });
  }

  const { id } = await params;

  try {
    const res = await fetch(`${process.env.BASE_URL}/api/apps/v1/products/${id}`, {
      headers: {
        "X-Client-Id": process.env.SELORAX_CLIENT_ID!,
        "X-Client-Secret": process.env.SELORAX_CLIENT_SECRET!,
        "X-Store-Id": storeId,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    console.log("Raw variant images:", data.data?.variants?.map((v: { sku_id: number; images: string }) => ({ sku_id: v.sku_id, images: v.images })));
    data.data = resolveProductImages(data.data);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      { message: error.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}
