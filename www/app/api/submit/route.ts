// app/api/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { generateId } from "@/lib/id";
import { BANK_VERSION, AnswerMap, FieldMap } from "@/lib/types";
import { QUESTION_BANK } from "@/data/questions";
import { computeAllServer } from "./util";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { answers = {}, fields = {}, lang = "nb" } = (await req.json()) as { answers: AnswerMap; fields: FieldMap; lang: string };

    // whitelist: kun kjente likert-id-er
    const known = new Set(QUESTION_BANK.filter((q) => q.kind === "likert").map((q) => q.id));
    Object.keys(answers).forEach((k) => { if (!known.has(k)) delete (answers as any)[k]; });

    const computed = await computeAllServer(answers, fields);
    const id = generateId(11);

    const doc = { id, createdAt: new Date().toISOString(), v: BANK_VERSION, lang, answers, fields, ...computed };
    const col = await getCollection("results");
    await col.insertOne(doc);

    return NextResponse.json({ id, ...computed }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "submit_failed" }, { status: 500 });
  }
}
