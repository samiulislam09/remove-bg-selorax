import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { seloraxApi } = require("@selorax/app-sdk");

const storeId = process.env.SELORAX_STORE_ID!;

export async function GET() {
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
