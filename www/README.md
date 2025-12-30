# Sleep Test scoring notes

## New domains (v1.3.0)

The test now includes two additional Likert-based domains:

- **Mental calm & stress** (`category_id: mental`)
- **Circadian rhythm & shift work** (`category_id: chronotype`)

These domains are scored on the same 0–100 scale as other categories (higher raw score = worse). Result cards show a positive score (100 - raw).

## Total score weighting

The total raw score is computed as:

- Base categories (pattern, insomnia, quality, daytime, hygiene, environment, breathing, blood pressure): average
- **Mental** contributes **7%** *only when at least one mental question is answered*
- **Chronotype** contributes **0%** directly

This keeps historical totals stable while allowing mental stress to have a small influence.

## Chronotype modifier

If the **shift-work** item (q36) is high (Likert 4–5), the negative penalty from **pattern.irregular_times** (q2) is reduced by 50%.

## Severity thresholds (result cards)

Severity badges use the **display score** (0–100, higher is better):

- **Red:** 0–30
- **Yellow:** 31–70
- **Green:** 71–100
