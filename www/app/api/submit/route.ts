// app/api/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { generateId } from "@/lib/id";
import { BANK_VERSION, AnswerMap } from "@/lib/types";
import { QUESTION_BANK } from "@/data/questions";
import { computeAllServer } from "./util";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { answers = {}, lang = "nb" } = (await req.json()) as {
      answers: AnswerMap;
      lang: string;
    };

    // Whitelist: keep only known likert ids
    const knownLikert = new Set(
      QUESTION_BANK.filter((q) => q.kind === "likert").map((q) => q.id)
    );
    const cleaned: AnswerMap = {};
    for (const [k, v] of Object.entries(answers || {})) {
      if (knownLikert.has(k) && typeof v === "number") cleaned[k] = v as any;
    }

    const computed = await computeAllServer(cleaned);
    const id = generateId(11);

    // Persist (answers only; no fields anymore)
    const doc = {
      id,
      createdAt: new Date().toISOString(),
      v: BANK_VERSION,
      lang,
      answers: cleaned,
      ...computed,
    };

    const col = await getCollection("results");
    await col.insertOne(doc);

    return NextResponse.json({ id, ...computed }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "submit_failed" }, { status: 500 });
  }
}
