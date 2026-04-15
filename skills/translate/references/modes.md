# Translation Modes

Use one of these modes for every task. If the user does not specify a mode, use `faithful`.

## `literal`

Choose this when speed and surface fidelity matter more than style.

- Stay close to the source wording and sentence order.
- Preserve technical phrasing unless it becomes ungrammatical.
- Good for notes, drafts, or internal review.

## `faithful`

Use this by default.

- Preserve meaning, facts, and emphasis.
- Make the target text read naturally.
- Prefer established target-language terminology over word-for-word calques.
- Good for most product, business, and technical content.

## `localized`

Use this when the user asks for adaptation, polish, or audience fit.

- Keep facts unchanged.
- Adapt idioms, register, and rhythm for the target audience.
- Retain the original structure unless a small restructure clearly improves readability.
- Good for marketing copy, landing pages, creator content, and external docs.

## Selection Rules

- If the user says "直译", "literal", or "just translate", use `literal`.
- If the user says "润色", "本地化", "像母语者", or asks for a publishable result, use `localized`.
- Otherwise use `faithful`.

## Output Rules

- Default to translation only.
- Add notes, ambiguity warnings, or terminology comments only when requested.
- If a phrase is ambiguous and the user did not request alternatives, choose the best interpretation and keep moving.
