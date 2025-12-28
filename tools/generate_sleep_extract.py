#!/usr/bin/env python3
import json
import os
import re
import glob
from zipfile import ZipFile, ZIP_DEFLATED
from xml.sax.saxutils import escape


REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BASE_DIR = os.path.join(REPO_ROOT, "www")


def parse_category_map(types_path):
    category_map = {}
    in_enum = False
    with open(types_path, encoding="utf-8") as handle:
        for line in handle:
            if "export enum CategoryId" in line:
                in_enum = True
                continue
            if in_enum:
                if line.strip().startswith("}"):
                    in_enum = False
                    continue
                match = re.search(r'^\s*([A-Za-z]+)\s*=\s*"([^"]+)"', line)
                if match:
                    category_map[match.group(1)] = match.group(2)
    return category_map


def parse_questions(question_path, category_map):
    questions = []
    with open(question_path, encoding="utf-8") as handle:
        for line_num, line in enumerate(handle, 1):
            match = re.search(
                r'\{\s*id:\s*"([^"]+)",\s*kind:\s*"([^"]+)",\s*category:\s*CategoryId\.([A-Za-z]+),\s*textKey:\s*"([^"]+)"\s*\}',
                line,
            )
            if match:
                qid, kind, cat_key, text_key = match.groups()
                questions.append(
                    {
                        "id": qid,
                        "kind": kind,
                        "category_enum": cat_key,
                        "category_id": category_map.get(cat_key, cat_key),
                        "textKey": text_key,
                        "line": line_num,
                    }
                )
    return questions


def parse_by_category(util_path, category_map):
    by_cat = {}
    with open(util_path, encoding="utf-8") as handle:
        for line_num, line in enumerate(handle, 1):
            match = re.search(r"\[CategoryId\.([A-Za-z]+)\]:\s*\[(.+)\]", line)
            if match:
                cat_enum = match.group(1)
                ids = re.findall(r'"(q\d+)"', match.group(2))
                by_cat[category_map.get(cat_enum, cat_enum)] = {
                    "ids": ids,
                    "line": line_num,
                }
    return by_cat


def parse_key_lines(path):
    key_lines = {}
    stack = []
    with open(path, encoding="utf-8") as handle:
        for line_num, line in enumerate(handle, 1):
            match = re.match(r'\s*"([^"]+)":\s*(.*)', line)
            if match:
                key = match.group(1)
                rest = match.group(2)
                path_key = ".".join(stack + [key]) if stack else key
                if path_key not in key_lines:
                    key_lines[path_key] = line_num
                if "{" in rest or "[" in rest:
                    stack.append(key)
            close_count = line.count("}") + line.count("]")
            for _ in range(close_count):
                if stack:
                    stack.pop()
    return key_lines


def flatten_json(data, prefix=""):
    items = {}
    if isinstance(data, dict):
        for key, value in data.items():
            new_prefix = f"{prefix}.{key}" if prefix else key
            items.update(flatten_json(value, new_prefix))
    elif isinstance(data, list):
        items[prefix] = json.dumps(data, ensure_ascii=False)
    else:
        items[prefix] = data
    return items


def col_letter(n):
    out = ""
    while n > 0:
        n, remainder = divmod(n - 1, 26)
        out = chr(65 + remainder) + out
    return out


def build_sheet_xml(headers, rows, shared_index, shared_strings):
    all_rows = [headers] + rows
    xml_rows = []
    for row_idx, row in enumerate(all_rows, 1):
        cells = []
        for col_idx, value in enumerate(row, 1):
            cell_ref = f"{col_letter(col_idx)}{row_idx}"
            if value is None:
                continue
            value_str = str(value)
            if value_str not in shared_index:
                shared_index[value_str] = len(shared_strings)
                shared_strings.append(value_str)
            s_idx = shared_index[value_str]
            cells.append(f'<c r="{cell_ref}" t="s"><v>{s_idx}</v></c>')
        xml_rows.append(f'<row r="{row_idx}">{"".join(cells)}</row>')
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        f"<sheetData>{''.join(xml_rows)}</sheetData></worksheet>"
    )


def main():
    types_path = os.path.join(BASE_DIR, "lib", "types.ts")
    question_path = os.path.join(BASE_DIR, "data", "questions.ts")
    util_path = os.path.join(BASE_DIR, "app", "api", "submit", "util.ts")

    category_map = parse_category_map(types_path)
    questions = parse_questions(question_path, category_map)
    by_cat = parse_by_category(util_path, category_map)

    locale_dir = os.path.join(BASE_DIR, "public", "locales")
    locale_files = sorted(glob.glob(os.path.join(locale_dir, "*.json")))
    locales = {}
    locale_lines = {}
    for path in locale_files:
        lang = os.path.splitext(os.path.basename(path))[0]
        with open(path, encoding="utf-8") as handle:
            data = json.load(handle)
        locales[lang] = flatten_json(data)
        locale_lines[lang] = parse_key_lines(path)

    all_keys = set()
    for mapping in locales.values():
        all_keys.update(mapping.keys())

    used_keys = set(q["textKey"] for q in questions)
    code_files = [
        os.path.join(BASE_DIR, "app", "test", "page.tsx"),
        os.path.join(BASE_DIR, "components", "SmileyLikert.tsx"),
        os.path.join(BASE_DIR, "app", "result", "[id]", "page.tsx"),
        os.path.join(BASE_DIR, "lib", "scoring.ts"),
    ]
    for path in code_files:
        with open(path, encoding="utf-8") as handle:
            text = handle.read()
        used_keys.update(re.findall(r't\([^,]+,\s*"([^"]+)"', text))
        used_keys.update(re.findall(r'labelKey:\s*"([^"]+)"', text))
        used_keys.update(re.findall(r'"(tips\.[^"]+)"', text))
    for cat in category_map.values():
        used_keys.add(f"category.{cat}.name")
        used_keys.add(f"category.{cat}.desc")
    for color in ["green", "orange", "red"]:
        used_keys.add(f"ui.result.lead.{color}")

    locales_sorted = sorted(locales.keys())
    missing_en = []

    questions_rows = []
    for q in questions:
        key = q["textKey"]
        en_val = locales.get("en", {}).get(key)
        if en_val is None:
            en_val = f"I don't know - English translation missing for key: {key}"
            missing_en.append(key)
        questions_rows.append(
            [
                q["id"],
                q["category_id"],
                q["kind"],
                q["textKey"],
                en_val,
                "",
                "",
                f"data/questions.ts:{q['line']}",
            ]
        )

    likert_keys = [f"likert.{i}" for i in range(1, 6)]
    likert_texts = {}
    for key in likert_keys:
        en_val = locales.get("en", {}).get(key)
        if en_val is None:
            en_val = f"I don't know - English translation missing for key: {key}"
            missing_en.append(key)
        likert_texts[key] = en_val

    answer_rows = []
    for q in questions:
        for i, key in enumerate(likert_keys, 1):
            answer_rows.append(
                [
                    q["id"],
                    i,
                    likert_texts[key],
                    key,
                    "app/test/page.tsx:128-137",
                ]
            )

    scoring_rows = [
        [
            "color_thresholds",
            "COLOR_THRESHOLDS",
            "{ green: { max: 39 }, yellow: { min: 40, max: 59 }, red: { min: 60 } }",
            "bucketColor/thresholds",
            "lib/scoring.ts:4-9",
        ],
        [
            "likert_label_keys",
            "LIKERT_LABEL_KEYS",
            '{ 1: "likert.1", 2: "likert.2", 3: "likert.3", 4: "likert.4", 5: "likert.5" }',
            "likert labels",
            "lib/scoring.ts:11-18",
        ],
        ["likert_to_100", "likertTo100", "((v - 1) / 4) * 100", "LikertValue 1–5", "lib/scoring.ts:20-21"],
        [
            "avg",
            "avg",
            "ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : 0",
            "number[]",
            "lib/scoring.ts:23-24",
        ],
        [
            "bucket_color",
            "bucketColor",
            's <= 39 ? "green" : s >= 60 ? "red" : "yellow"',
            "score bucket",
            "lib/scoring.ts:26-28",
        ],
        [
            "category_scores",
            "computeCategoryScores",
            "vals = byCatIds[cat].map(id => answers[id]).filter(number).map(likertTo100); out[cat] = Math.round(avg(vals))",
            "Category scores",
            "lib/scoring.ts:31-42",
        ],
        [
            "total_raw_helper",
            "computeTotalRaw",
            "Math.round(avg(Object.values(categoryScores).filter(number)))",
            "totalRaw",
            "lib/scoring.ts:46-49",
        ],
        [
            "bp_risk_helper",
            "computeHighBpRisk",
            'BP_IDS=["bp1","bp2","bp3","bp4","bp5"]; vals length >= minItems; mean >= threshold',
            "highBpRisk helper",
            "lib/scoring.ts:52-74",
        ],
        [
            "flags_osa",
            "computeFlags.osaSignal",
            "osaSignal = gte(q23,4) || gte(q24,3) || gte(q25,4)",
            "flags",
            "lib/flags.ts:22-27",
        ],
        [
            "flags_excessive_sleepiness",
            "computeFlags.excessiveSleepiness",
            "daytimeAvg = avg([q12,q13,q14]); excessiveSleepiness = daytimeAvg >= 4",
            "flags",
            "lib/flags.ts:29-34",
        ],
        [
            "flags_high_bp_risk",
            "computeFlags.highBpRisk",
            "bpAvg = avg([q26,q27,q28,q29,q30]); highBpRisk = bpVals.length > 0 && bpAvg >= 4",
            "flags",
            "lib/flags.ts:36-42",
        ],
        [
            "submit_whitelist",
            "submit.route whitelist",
            'knownLikert = QUESTION_BANK.filter(kind=="likert").map(id); keep entries where knownLikert.has(k) && typeof v === "number"',
            "validation",
            "app/api/submit/route.ts:21-30",
        ],
    ]

    total_rows = []
    for cat, data in by_cat.items():
        total_rows.append(
            [
                f"by_cat_{cat}",
                json.dumps(data["ids"]),
                f"CategoryId.{cat}",
                f"app/api/submit/util.ts:{data['line']}",
            ]
        )

    total_rows.extend(
        [
            [
                "total_raw_compute",
                "Math.round(catVals.reduce((a, b) => a + b, 0) / catVals.length) : 0",
                "totalRaw",
                "app/api/submit/util.ts:35-39",
            ],
            [
                "sleep_score_compute",
                "Math.max(0, 100 - totalRaw)",
                "sleepScore",
                "app/api/submit/util.ts:41-42",
            ],
            [
                "ring_color",
                'bucketColor(typeof data.totalRaw === "number" ? data.totalRaw : Math.max(0, 100 - Number(data.sleepScore))).replace("yellow", "orange")',
                "result ring color",
                "app/result/[id]/page.tsx:136-141",
            ],
            ["category_display", "display = 100 - raw", "result category display score", "app/result/[id]/page.tsx:247-249"],
            [
                "category_color",
                'color = bucketColor(raw).replace("yellow", "orange")',
                "result category color",
                "app/result/[id]/page.tsx:249-249",
            ],
            ["category_desc_key", "category.${cat}.desc", "category description key lookup", "app/result/[id]/page.tsx:250"],
            ["category_name_key", "category.${cat}.name", "category name key lookup", "app/result/[id]/page.tsx:271"],
            ["lead_key", "ui.result.lead.${color}", "lead text key lookup", "app/result/[id]/page.tsx:250-251"],
            [
                "tips_filter",
                'tipKeys = pickTipKeys(cat, color).filter((k) => t(dict, k, "") !== "")',
                "tip key filtering",
                "app/result/[id]/page.tsx:252",
            ],
        ]
    )

    flow_rows = [
        ["step_1", 'fetch("/api/submit")', "app/test/page.tsx:47-53"],
        ["step_2", "computeAllServer(cleaned)", "app/api/submit/route.ts:32"],
        ["step_3", "computeCategoryScores / computeFlags / sleepScore", "app/api/submit/util.ts:32-55"],
        ["step_4", "fetch(`/api/result/${params.id}`)", "app/result/[id]/page.tsx:100-106"],
        ["step_5", "return result JSON or recompute", "app/api/result/[id]/route.ts:19-67"],
    ]

    metadata_rows = [
        ["repo_root", REPO_ROOT, "filesystem"],
        ["tech_stack", "next, react, mongodb", "package.json:5-17"],
        ["primary_languages", "TypeScript/TSX", "app/test/page.tsx:1-176"],
        ["i18n_locale_files", ", ".join([os.path.basename(p) for p in locale_files]), "public/locales/en.json:1"],
        ["questionnaire_definition", "data/questions.ts", "data/questions.ts:1-60"],
        ["questionnaire_ui", "app/test/page.tsx", "app/test/page.tsx:1-176"],
        ["scoring_logic", "lib/scoring.ts; lib/flags.ts; app/api/submit/util.ts", "lib/scoring.ts:1-74"],
        ["validation_logic", "app/api/submit/route.ts", "app/api/submit/route.ts:21-30"],
        ["result_reporting_ui", "app/result/[id]/page.tsx", "app/result/[id]/page.tsx:136-345"],
        ["db_access", "lib/db.ts", "lib/db.ts:1-19"],
        ["result_api", "app/api/result/[id]/route.ts", "app/api/result/[id]/route.ts:1-76"],
    ]

    usage_rows = []
    for q in questions:
        usage_rows.append([q["textKey"], q["id"], f"data/questions.ts:{q['line']}"])
    for key in likert_keys:
        usage_rows.append([key, "answer option", "app/test/page.tsx:131-137"])
    for key in [
        "ui.test.title",
        "ui.test.progress",
        "ui.common.back",
        "ui.common.next",
        "ui.common.sending",
        "ui.test.submit",
        "ui.common.error_submit",
    ]:
        usage_rows.append([key, "questionnaire ui", "app/test/page.tsx:97-164"])
    for key in [
        "ui.result.title",
        "ui.result.sleep_score",
        "ui.result.copy_id",
        "ui.result.disclaimer",
        "ui.result.how_to_improve",
        "ui.common.read",
    ]:
        usage_rows.append([key, "report text", "app/result/[id]/page.tsx:192-320"])
    for color in ["green", "orange", "red"]:
        usage_rows.append([f"ui.result.lead.{color}", "report lead text", "app/result/[id]/page.tsx:250-251"])
    for cat in category_map.values():
        usage_rows.append([f"category.{cat}.name", f"category {cat} name", "app/result/[id]/page.tsx:271"])
        usage_rows.append([f"category.{cat}.desc", f"category {cat} desc", "app/result/[id]/page.tsx:250"])
    for key in sorted(k for k in used_keys if k.startswith("tips.")):
        usage_rows.append([key, "tip text", "app/result/[id]/page.tsx:36-72"])
    for key in ["flags.osa_signal", "flags.excessive_sleepiness", "flags.high_bp_risk"]:
        usage_rows.append([key, "flag text", "app/result/[id]/page.tsx:336-345"])

    translations_rows = []
    for key in sorted(all_keys):
        row = [key]
        for lang in locales_sorted:
            val = locales[lang].get(key)
            row.append("Missing" if val is None else val)
        translations_rows.append(row)

    translation_sources = []
    for key in sorted(all_keys):
        for lang in locales_sorted:
            line = locale_lines.get(lang, {}).get(key)
            if line:
                translation_sources.append([key, lang, f"public/locales/{lang}.json:{line}"])

    sheets = [
        (
            "Questions",
            [
                "question_id",
                "category_id",
                "question_kind",
                "question_text_i18n_key",
                "question_text_en",
                "info_text_i18n_key",
                "info_text_en",
                "source_reference",
            ],
            questions_rows,
        ),
        ("AnswerOptions", ["question_id", "option_value", "option_text_en", "option_i18n_key", "source_reference"], answer_rows),
        ("ScoringRules", ["rule_id", "rule_name", "rule_expression", "applies_to", "source_reference"], scoring_rows),
        ("TotalScore", ["item_id", "expression", "context", "source_reference"], total_rows),
        ("Metadata", ["key", "value", "source_reference"], metadata_rows),
        ("FlowDiagram", ["step_id", "step_description", "source_reference"], flow_rows),
        ("I18nKeys_Usage", ["i18n_key", "where_used", "source_reference"], usage_rows),
        ("I18n_All_Translations", ["i18n_key"] + [f"language_{lang}" for lang in locales_sorted], translations_rows),
        ("I18n_Translation_Sources", ["i18n_key", "language", "source_reference"], translation_sources),
    ]

    shared_strings = []
    shared_index = {}
    worksheet_xmls = []
    for _, headers, rows in sheets:
        worksheet_xmls.append(build_sheet_xml(headers, rows, shared_index, shared_strings))

    shared_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        '<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
        f'count="{len(shared_strings)}" uniqueCount="{len(shared_strings)}">'
        + "".join(f"<si><t>{escape(s)}</t></si>" for s in shared_strings)
        + "</sst>"
    )

    sheets_xml = "".join(
        f'<sheet name="{escape(sheet_name)}" sheetId="{idx + 1}" r:id="rId{idx + 1}"/>'
        for idx, (sheet_name, _, _) in enumerate(sheets)
    )
    workbook_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        f"<sheets>{sheets_xml}</sheets></workbook>"
    )

    workbook_rels = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        + "".join(
            f'<Relationship Id="rId{idx + 1}" '
            'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" '
            f'Target="worksheets/sheet{idx + 1}.xml"/>'
            for idx in range(len(sheets))
        )
        + f'<Relationship Id="rId{len(sheets) + 1}" '
        'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" '
        'Target="sharedStrings.xml"/>'
        + f'<Relationship Id="rId{len(sheets) + 2}" '
        'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" '
        'Target="styles.xml"/>'
        + "</Relationships>"
    )

    styles_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        '<fonts count="1"><font><sz val="11"/><color rgb="000000"/><name val="Calibri"/></font></fonts>'
        '<fills count="1"><fill><patternFill patternType="none"/></fill></fills>'
        "<borders count=\"1\"><border><left/><right/><top/><bottom/><diagonal/></border></borders>"
        '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
        '<cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>'
        "</styleSheet>"
    )

    content_types = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        + "".join(
            f'<Override PartName="/xl/worksheets/sheet{idx + 1}.xml" '
            'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            for idx in range(len(sheets))
        )
        + '<Override PartName="/xl/workbook.xml" '
        'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
        '<Override PartName="/xl/sharedStrings.xml" '
        'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>'
        '<Override PartName="/xl/styles.xml" '
        'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
        "</Types>"
    )

    rels_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" '
        'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" '
        'Target="xl/workbook.xml"/>'
        "</Relationships>"
    )

    output_path = os.path.join(REPO_ROOT, "sleep_questionnaire_scoring_extract.xlsx")
    with ZipFile(output_path, "w", ZIP_DEFLATED) as archive:
        archive.writestr("[Content_Types].xml", content_types)
        archive.writestr("_rels/.rels", rels_xml)
        archive.writestr("xl/workbook.xml", workbook_xml)
        archive.writestr("xl/_rels/workbook.xml.rels", workbook_rels)
        archive.writestr("xl/sharedStrings.xml", shared_xml)
        archive.writestr("xl/styles.xml", styles_xml)
        for idx, sheet_xml in enumerate(worksheet_xmls, 1):
            archive.writestr(f"xl/worksheets/sheet{idx}.xml", sheet_xml)

    readme_path = os.path.join(REPO_ROOT, "README_for_reviewers.md")
    with open(readme_path, "w", encoding="utf-8") as handle:
        handle.write("# Sleep questionnaire scoring extract\n\n")
        handle.write("This extract was generated from the repository source files listed in the Metadata sheet.\n\n")
        handle.write("Notes:\n")
        handle.write(
            "- The Excel file was generated using a minimal XLSX writer implemented with the Python standard library (no external XLSX packages were available in the environment).\n"
        )
        handle.write(
            "- All questionnaire and report text values in the workbook come from the English locale file (public/locales/en.json).\n"
        )
        handle.write("- I18n_All_Translations contains every key/value pair across all locale JSON files.\n")
        handle.write(
            "- I18n_Translation_Sources lists locale file locations (file path + line number) for each translation key.\n"
        )

    if missing_en:
        missing_path = os.path.join(REPO_ROOT, "missing_english_translations.txt")
        with open(missing_path, "w", encoding="utf-8") as handle:
            handle.write("\n".join(sorted(set(missing_en))))


if __name__ == "__main__":
    main()
