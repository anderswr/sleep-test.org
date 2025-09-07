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
    const body = (await req.json()) as { answers?: AnswerMap; lang?: string } | null;

    // Robust henting av lang: godta hvilken som helst string, ellers fallback til "en"
    const langRaw = body?.lang;
    const lang = typeof langRaw === "string" && langRaw.trim() ? langRaw.trim() : "en";

    const incomingAnswers = (body?.answers ?? {}) as AnswerMap;

    // Whitelist: behold kun kjente likert-id'er og numeriske verdier
    const knownLikert = new Set(
      QUESTION_BANK.filter((q) => q.kind === "likert").map((q) => q.id)
    );
    const cleaned: AnswerMap = {};
    for (const [k, v] of Object.entries(incomingAnswers)) {
      if (knownLikert.has(k) && typeof v === "number") {
        cleaned[k] = v as any;
      }
    }

    const computed = await computeAllServer(cleaned);
    const id = generateId(11);

    // Persistér (kun likert-svar; ingen felt lenger)
    const doc = {
      id,
      createdAt: new Date().toISOString(),
      v: BANK_VERSION,
      lang,            // lagre det brukeren sendte (eller "en" hvis ikke oppgitt)
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
