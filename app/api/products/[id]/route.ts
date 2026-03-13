import { NextRequest, NextResponse } from "next/server";
import { resolveProductImages } from "@/app/lib/image";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { seloraxApi } = require("@selorax/app-sdk");

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
    const data = await seloraxApi.products.get(storeId, id);
    data.data = resolveProductImages(data.data);
    console.log("Product Detail:", JSON.stringify(data, null, 2));
    return NextResponse.json(data);
  } catch (err: unknown) {
    const error = err as { status?: number; data?: unknown; message?: string };
    return NextResponse.json(
      error.data || { message: error.message },
      { status: error.status || 500 }
    );
  }
}
