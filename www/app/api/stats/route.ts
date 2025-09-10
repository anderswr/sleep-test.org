// app/api/stats/route.ts
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";

export const runtime = "nodejs";

// Viktig: slå av all caching for denne ruten
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const col = await getCollection("results");

    // Bruk countDocuments for ferskt og eksakt tall
    const total = await col.countDocuments({});

    return NextResponse.json(
      { total },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "CDN-Cache-Control": "no-store",
          "Vercel-CDN-Cache-Control": "no-store",
        },
      }
    );
  } catch (err) {
    console.error("GET /api/stats error", err);
    // Returnér 200 med 0 så UI ikke feiler hvis DB er nede
    return NextResponse.json(
      { total: 0 },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
