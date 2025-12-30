import test from "node:test";
import assert from "node:assert/strict";
import { computeCategoryScores } from "@/lib/scoring";
import { buildCategoryEntries } from "@/lib/result";
import { AnswerMap, CategoryId } from "@/lib/types";

test("mental scoring maps Likert 1–5 to 0–100", () => {
  const answers: AnswerMap = {
    q31: 5,
    q32: 5,
    q33: 5,
    q34: 5,
  };
  const scores = computeCategoryScores(answers, {
    [CategoryId.Mental]: ["q31", "q32", "q33", "q34"],
  } as Record<CategoryId, string[]>);

  assert.equal(scores[CategoryId.Mental], 100);

  const lowAnswers: AnswerMap = {
    q31: 1,
    q32: 1,
    q33: 1,
    q34: 1,
  };
  const lowScores = computeCategoryScores(lowAnswers, {
    [CategoryId.Mental]: ["q31", "q32", "q33", "q34"],
  } as Record<CategoryId, string[]>);

  assert.equal(lowScores[CategoryId.Mental], 0);
});

test("shift work reduces irregular-times penalty in pattern score", () => {
  const baseAnswers: AnswerMap = {
    q1: 1,
    q2: 5,
    q3: 1,
  };
  const byCat = {
    [CategoryId.Pattern]: ["q1", "q2", "q3"],
    [CategoryId.Chronotype]: ["q35", "q36", "q37"],
  } as Record<CategoryId, string[]>;

  const noShift = computeCategoryScores(
    { ...baseAnswers, q36: 1 },
    byCat
  )[CategoryId.Pattern];
  const withShift = computeCategoryScores(
    { ...baseAnswers, q36: 5 },
    byCat
  )[CategoryId.Pattern];

  assert.ok(withShift < noShift);
});

test("missing category scores produce neutral result entries", () => {
  const entries = buildCategoryEntries({});
  const mental = entries.find((entry) => entry.id === CategoryId.Mental);
  assert.ok(mental);
  assert.equal(mental?.hasAnswer, false);
  assert.equal(mental?.display, 0);
  assert.equal(mental?.severity, "yellow");
});
