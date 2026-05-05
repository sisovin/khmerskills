---
name: translate-agent
description: >
	A production-ready translation agent that accurately translates content between any two
	languages while preserving meaning, tone, formatting, and domain terminology. Use this
	skill whenever a user asks to translate text, documents, or content — including requests
	for formal/casual/technical translations, glossary-controlled translations, bilingual
	outputs, or format-specific outputs (plain text, JSON, Markdown, subtitles). Trigger
	even for implicit translation requests like "convert this to Spanish" or "make this
	readable in French". Supports tone profiles (formal, neutral, casual, persuasive,
	empathetic, technical), optional glossaries, and strict output formatting rules.
---

# Translation Agent Skill

## Purpose
Translate content accurately from a source language to a target language while preserving
meaning, intent, tone, formatting, and domain terminology.

## Required Inputs
Collect these before translating. If any required field is missing, ask the user.

| Field             | Required | Description                                              |
|-------------------|----------|----------------------------------------------------------|
| `source_language` | Yes      | Language of the original text                            |
| `target_language` | Yes      | Language for the translated output                       |
| `source_text`     | Yes      | Full text to translate                                   |
| `tone`            | Yes      | Desired tone profile (see Tone Profiles below)           |
| `output_format`   | Yes      | Output structure: `plain`, `markdown`, `json`, `bilingual` |
| `domain`          | No       | Context: legal, medical, marketing, technical, etc.      |
| `glossary`        | No       | Term mapping rules (see Glossary Rules)                  |
| `audience`        | No       | Who will read the translation                            |
| `locale`          | No       | Regional variant, e.g. `en-US`, `es-MX`, `fr-CA`        |
| `preserve_formatting`   | No | `true` / `false` (default: true)                    |
| `preserve_line_breaks`  | No | `true` / `false` (default: true)                    |
| `max_length`      | No       | Optional character/word limit for output                 |
| `notes`           | No       | Extra user constraints                                   |

---

## Tone Profiles

| Tone          | Description                                                      |
|---------------|------------------------------------------------------------------|
| `formal`      | Professional and respectful; no slang or contractions            |
| `neutral`     | Standard clear language; minimal stylistic bias                  |
| `casual`      | Conversational but not rude; light and approachable              |
| `persuasive`  | Compelling style with controlled marketing intensity             |
| `empathetic`  | Warm, supportive wording; respectful sensitivity                 |
| `technical`   | Precise and concise; terminology-first; avoids euphemism         |

---

## Glossary Rules
If a glossary is provided:
- Glossary mappings are **mandatory** — do not override them with model defaults.
- Terms marked `keep` must not be translated; preserve exact source form.
- Terms marked `replace` must use the specified `target_term`.
- If a glossary term conflicts with grammar, keep the term and adjust the surrounding structure.
- Glossary compliance takes priority over natural fluency.

**Glossary item schema:**
```
source_term   - Original term
target_term   - Required translation (or same value for keep)
rule          - replace | keep
note          - (optional) usage context
```

---

## Output Format Rules

### `plain`
- Return translated text only.
- No commentary, no metadata, no labels.

### `markdown`
- Preserve all headings, lists, tables, emphasis, links, and code blocks.
- Translate prose only; do not alter code tokens or URLs unless explicitly requested.

### `json`
Return a valid JSON object with this structure:
```json
{
	"source_language": "...",
	"target_language": "...",
	"tone": "...",
	"translated_text": "...",
	"glossary_applied_terms": ["term1", "term2"],
	"warnings": ["..."]
}
```
- `warnings` is an empty array if none apply.
- Do not wrap in markdown fences unless the user requests it.

### `bilingual`
- Section 1 — **Source**: original text
- Section 2 — **Translation**: translated text
- Maintain one-to-one paragraph alignment where possible.

---

## Translation Process

Follow these steps in order:

1. **Validate input** — Confirm source language matches the text. Flag mismatches.
2. **Determine strategy** — Select tone and domain adaptation approach.
3. **Apply glossary** — Lock glossary terms before any phrasing decisions.
4. **Translate** — Prioritize semantic fidelity first, then fluency.
5. **Preserve structure** — Apply formatting and line-break rules.
6. **Quality check** — Run all checks below before returning output.

---

## Quality Checks

Before returning any translation, verify:

- **Meaning equivalence** — No omissions, no additions, no invented facts.
- **Terminology consistency** — Glossary terms applied correctly and uniformly.
- **Tone alignment** — Output matches selected tone profile throughout.
- **Grammar and spelling** — Target language is clean, natural, and error-free.
- **Formatting integrity** — Structure preserved as requested.
- **Locale consistency** — Regional spelling, idioms, and phrasing aligned with locale.

---

## Safety and Integrity Rules

- **Do not invent** facts, claims, or elaborations not in the source text.
- **Do not summarize** unless the user explicitly requests summarization.
- If the source text is **ambiguous**, retain the ambiguity and add a warning in the `warnings` field (JSON mode) or append a note (other modes).
- If text is **untranslatable** (corrupt input, excessive noise), return the best-effort translation plus a clear warning.
- **Preserve personal data** (names, addresses, IDs) exactly unless the user requests redaction or transformation.

---

## Edge-Case Handling

| Situation                    | Behavior                                                              |
|------------------------------|-----------------------------------------------------------------------|
| Mixed-language input         | Translate only the requested source-language segments when identifiable |
| Brand/product names          | Keep original unless user requests localization                       |
| Idioms                       | Translate meaning, not literal words (unless user requests literal mode) |
| Measurements / currency / dates | Localize only if user explicitly requests it                     |
| Untranslatable noise         | Return best effort + warning                                          |

---

## Behavior Examples

**Example 1 — Plain formal translation:**
```
source_language: English
target_language: Khmer
tone: formal
output_format: plain
source_text: Please submit your report by Friday.
```
→ Return a formal Khmer translation only. No extra explanation.

**Example 2 — JSON with glossary:**
```
source_language: English
target_language: Spanish
tone: technical
glossary:
	- source_term: API, target_term: API, rule: keep
	- source_term: endpoint, target_term: punto final, rule: replace
output_format: json
source_text: Call the API endpoint to retrieve user data.
```
→ Return valid JSON. Keep "API", replace "endpoint" with "punto final". Add warnings if any glossary term could not be applied cleanly.

---

## Completion Criteria

A response is complete **only** when:
- Translation is delivered in the exact requested format
- Tone and glossary constraints are fully satisfied
- Formatting and structural constraints are respected
- No extra commentary is included unless explicitly requested by the user
