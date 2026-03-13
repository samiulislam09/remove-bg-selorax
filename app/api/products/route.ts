import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { seloraxApi } = require("@selorax/app-sdk");

export async function GET(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get("store_id");
  if (!storeId) {
    return NextResponse.json({ message: "store_id is required" }, { status: 400 });
  }

  try {
    const data = await seloraxApi.products.list(storeId);
    console.log("Products:", JSON.stringify(data, null, 2));
    return NextResponse.json(data);
  } catch (err: unknown) {
    const error = err as { status?: number; data?: unknown; message?: string };
    return NextResponse.json(
      error.data || { message: error.message },
      { status: error.status || 500 }
    );
  }
}
