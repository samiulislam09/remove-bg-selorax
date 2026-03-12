import { NextResponse } from "next/server";

const SELORAX_API = "https://api-dev.selorax.io/api/apps/v1";

export async function GET() {
  const res = await fetch(`${SELORAX_API}/products`, {
    headers: {
      "X-Client-Id": process.env.SELORAX_CLIENT_ID!,
      "X-Client-Secret": process.env.SELORAX_CLIENT_SECRET!,
      "X-Store-Id": process.env.SELORAX_STORE_ID!,
    },
  });

  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}
