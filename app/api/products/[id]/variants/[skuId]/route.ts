import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; skuId: string }> }
) {
  const sessionToken = req.headers.get("x-session-token");
  if (!sessionToken) {
    return NextResponse.json({ message: "session token is required" }, { status: 401 });
  }

  const { skuId } = await params;

  try {
    const body = await req.json();

    const res = await fetch(
      `${process.env.BASE_URL}/api/product-variants/${skuId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": sessionToken,
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
