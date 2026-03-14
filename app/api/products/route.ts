import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get("store_id");
  if (!storeId) {
    return NextResponse.json({ message: "store_id is required" }, { status: 400 });
  }

  try {
    console.log("ENV CHECK:", {
      BASE_URL: process.env.BASE_URL,
      CLIENT_ID: process.env.SELORAX_CLIENT_ID ? "set" : "undefined",
      allKeys: Object.keys(process.env).filter(k => k.includes("BASE") || k.includes("SELORAX")),
    });
    const res = await fetch(`${process.env.BASE_URL}/api/apps/v1/products`, {
      headers: {
        "X-Client-Id": process.env.SELORAX_CLIENT_ID!,
        "X-Client-Secret": process.env.SELORAX_CLIENT_SECRET!,
        "X-Store-Id": storeId,
      },
    });

    const data = await res.json();
    console.log("SeloraX API response:", JSON.stringify(data, null, 2));
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      { message: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
