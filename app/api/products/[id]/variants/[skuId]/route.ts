import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; skuId: string }> }
) {
  const storeId = req.nextUrl.searchParams.get("store_id");
  if (!storeId) {
    return NextResponse.json({ message: "store_id is required" }, { status: 400 });
  }

  const { id, skuId } = await params;

  try {
    const body = await req.json();

    const res = await fetch(
      `${process.env.BASE_URL}/api/apps/v1/products/${id}/variants/${skuId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Client-Id": process.env.SELORAX_CLIENT_ID!,
          "X-Client-Secret": process.env.SELORAX_CLIENT_SECRET!,
          "X-Store-Id": storeId,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      { message: error.message || "Failed to update variant" },
      { status: 500 }
    );
  }
}
