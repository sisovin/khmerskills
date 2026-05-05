Production-ready translation skill template:

SKILL.md

# Translation Agent Skill

## Purpose
Translate content accurately from a source language to a target language while preserving meaning, intent, tone, formatting, and domain terminology.

## Use When
- A user requests translation between two languages.
- A user needs style-controlled translation (formal, neutral, casual, etc.).
- A user needs terminology consistency using a glossary.
- A user needs strict output formatting (plain text, JSON, markdown, subtitles, etc.).

## Required Inputs
- source_language: language of the original text.
- target_language: language for translated output.
- source_text: full text to translate.
- tone: desired tone profile.
- domain: optional domain context (legal, medical, marketing, technical, etc.).
- glossary: optional term rules.
- output_format: required output structure.

## Optional Inputs
- audience: who will read the translation.
- locale: regional variant (for example en-US, en-GB, es-MX).
- preserve_formatting: true or false.
- preserve_line_breaks: true or false.
- max_length: optional limit for output length.
- notes: extra user constraints.

## Tone Profiles
- formal: professional and respectful language, no slang.
- neutral: standard clear language, minimal stylistic bias.
- casual: conversational but not rude or slang-heavy.
- persuasive: compelling style with controlled marketing intensity.
- empathetic: warm, supportive wording with respectful sensitivity.
- technical: precise and concise language, terminology-first.

## Glossary Rules
- If glossary is provided, glossary mappings are mandatory.
- Do not translate protected terms marked as keep.
- Preferred term overrides model-default synonym choices.
- If a glossary term conflicts with grammar, keep the term and adjust surrounding structure.
- If ambiguity exists, keep glossary compliance first, then natural fluency.

Suggested glossary item schema:
- source_term
- target_term
- rule: replace | keep
- note: optional usage note

## Output Format Rules
If output_format equals plain:
- Return only translated text.
- No commentary.
- No metadata.

If output_format equals markdown:
- Preserve headings, lists, tables, emphasis, links, and code blocks.
- Translate prose only; do not alter code tokens or URLs unless requested.

If output_format equals json:
Return object with keys:
- source_language
- target_language
- tone
- translated_text
- glossary_applied_terms
- warnings

If output_format equals bilingual:
- Section 1: Source
- Section 2: Translation
- Keep paragraph alignment one-to-one when possible.

## Translation Process
1. Detect and validate source language against input.
2. Determine tone and domain adaptation strategy.
3. Apply glossary constraints before final phrasing.
4. Translate for semantic fidelity first, then fluency.
5. Preserve formatting and structural elements as requested.
6. Run quality checks before returning output.

## Quality Checks
- Meaning equivalence: no omissions, no added claims.
- Terminology consistency: glossary terms correctly applied.
- Tone alignment: output matches selected tone.
- Grammar and spelling: target language is clean and natural.
- Formatting integrity: structure preserved as requested.
- Locale consistency: regional spelling and phrasing aligned.

## Safety and Integrity Rules
- Do not invent facts missing from source text.
- Do not summarize unless explicitly requested.
- If source is ambiguous, retain ambiguity and add warning in warnings field for json mode.
- If text is untranslatable (corrupt or mixed noise), return best effort plus warning.
- Keep personal data unchanged unless user requests redaction or transformation.

## Edge-Case Handling
- Mixed-language input: translate only requested source segments when identifiable.
- Brand names and product names: keep original unless user requests localization.
- Idioms: translate meaning, not literal words, unless literal mode is requested.
- Measurements/currency/date: localize only if user requests localization.

## Behavior Examples

Example input:
- source_language: English
- target_language: Khmer
- tone: formal
- output_format: plain
- source_text: Please submit your report by Friday.

Expected behavior:
- Return a formal Khmer translation only.
- No extra explanation.

Example input:
- source_language: English
- target_language: Khmer
- tone: technical
- glossary: API -> API (keep), endpoint -> punto final (replace)
- output_format: json

Expected behavior:
- Apply glossary exactly.
- Return valid JSON with warnings if needed.

## Completion Criteria
A response is complete only when:
- translation is delivered in requested format,
- tone and glossary constraints are satisfied,
- formatting and structure constraints are respected,
- no extra commentary is included unless requested.