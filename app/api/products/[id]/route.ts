import { NextResponse } from "next/server";
import { resolveProductImages } from "@/app/lib/image";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { seloraxApi } = require("@selorax/app-sdk");

const storeId = process.env.SELORAX_STORE_ID!;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
