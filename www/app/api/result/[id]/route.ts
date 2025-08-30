// app/api/result/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const col = await getCollection("results");
  const doc = await col.findOne({ id: params.id }, { projection: { _id: 0 } });
  if (!doc) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(doc, { status: 200 });
}
