import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.BASE_URL!;
const CLIENT_ID = process.env.SELORAX_CLIENT_ID!;
const CLIENT_SECRET = process.env.SELORAX_CLIENT_SECRET!;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const storeId = req.nextUrl.searchParams.get("store_id");
  if (!storeId) {
    return NextResponse.json({ message: "store_id is required" }, { status: 400 });
  }

  const { id } = await params;

  try {
    const formData = await req.formData();

    const res = await fetch(`${BASE_URL}/api/apps/v1/products/${id}/images`, {
      method: "POST",
      headers: {
        "X-Client-Id": CLIENT_ID,
        "X-Client-Secret": CLIENT_SECRET,
        "X-Store-Id": storeId,
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      { message: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
