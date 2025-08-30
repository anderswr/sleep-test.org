// app/api/compare/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { idA, idB } = await req.json();
  if (!idA || !idB) return NextResponse.json({ error: "missing_ids" }, { status: 400 });

  const col = await getCollection("results");
  const [a, b] = await Promise.all([
    col.findOne({ id: idA }, { projection: { _id: 0 } }),
    col.findOne({ id: idB }, { projection: { _id: 0 } }),
  ]);
  if (!a || !b) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const diffs: Record<string, number> = {};
  Object.keys(a.categoryScores).forEach((k) => {
    diffs[k] = Math.round((a.categoryScores as any)[k] - (b.categoryScores as any)[k]);
  });

  return NextResponse.json({
    idA, idB,
    diffs,
    totalRawDiff: a.totalRaw - b.totalRaw,
    sleepScoreDiff: a.sleepScore - b.sleepScore
  }, { status: 200 });
}
