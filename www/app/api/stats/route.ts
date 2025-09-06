// app/api/stats/route.ts
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";

export const runtime = "nodejs"; // vi bruker DB-driver, så ikke edge

export async function GET() {
  try {
    const col = await getCollection("results");

    // Raskeste variant i Mongo er estimatedDocumentCount, med fallback:
    let total = 0;
    try {
      total = await col.estimatedDocumentCount();
    } catch {
      total = await col.countDocuments({});
    }

    return NextResponse.json({ total }, { status: 200 });
  } catch (err) {
    console.error("GET /api/stats error", err);
    // Returnér 200 med 0 så UI ikke feiler hvis DB er nede
    return NextResponse.json({ total: 0 }, { status: 200 });
  }
}
