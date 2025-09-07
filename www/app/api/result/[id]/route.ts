// app/api/result/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { computeAllServer } from "../../submit/util"; // samme util som ved submit
import { AnswerMap } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const col = await getCollection("results");

    // Hent dokumentet – men ikke send hele videre (vi gjør egen retur under)
    const doc = await col.findOne({ id: params.id }, { projection: { _id: 0 } });
    if (!doc) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    // Hvis dokumentet allerede har ferdigregnede felt, returner en “slank” respons
    if (
      typeof doc.totalRaw === "number" &&
      typeof doc.sleepScore === "number" &&
      doc.categoryScores &&
      typeof doc.categoryScores === "object"
    ) {
      return NextResponse.json(
        {
          id: doc.id,
          totalRaw: doc.totalRaw,
          sleepScore: doc.sleepScore,
          categoryScores: doc.categoryScores,
          flags: doc.flags ?? { osaSignal: false, excessiveSleepiness: false },
          suggestedTips: doc.suggestedTips ?? {},
        },
        { status: 200 }
      );
    }

    // Eldre/ufullstendige dokumenter: forsøk å recomputere fra answers
    if (doc.answers && typeof doc.answers === "object") {
      const answers = doc.answers as AnswerMap;
      const computed = await computeAllServer(answers);

      // Valgfritt: oppdatér dokumentet i databasen slik at det er “fremtidssikkert”
      await col.updateOne(
        { id: doc.id },
        {
          $set: {
            totalRaw: computed.totalRaw,
            sleepScore: computed.sleepScore,
            categoryScores: computed.categoryScores,
            flags: computed.flags,
            suggestedTips: computed.suggestedTips,
          },
        }
      );

      return NextResponse.json(
        {
          id: doc.id,
          totalRaw: computed.totalRaw,
          sleepScore: computed.sleepScore,
          categoryScores: computed.categoryScores,
          flags: computed.flags,
          suggestedTips: computed.suggestedTips,
        },
        { status: 200 }
      );
    }

    // Hvis vi kommer hit har dokumentet verken ferdigregnede felt eller svar
    return NextResponse.json({ error: "incomplete_result" }, { status: 422 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
