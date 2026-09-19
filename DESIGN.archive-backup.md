---
name: Archive
description: Document Q&A with citations you can check — olive, sage, white, and one yellow reserved for evidence.
colors:
  ink: "#15170F"
  page: "#FFFFFF"
  rail: "#DCE6D2"
  panel: "#F1F5EC"
  graphite: "#565A4E"
  rule: "#BFCBAF"
  olive: "#46592E"
  olive-deep: "#313F1F"
  marker: "#F3E85C"
  marker-deep: "#E5D53F"
  alert: "#A32820"
typography:
  display:
    fontFamily: "'Bricolage Grotesque', system-ui, sans-serif"
    fontSize: "2.3rem"
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: "-0.015em"
    fontVariation: "'wdth' 88, 'opsz' 40"
  headline:
    fontFamily: "'Bricolage Grotesque', system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.1
    fontVariation: "'wdth' 92, 'opsz' 32"
  title:
    fontFamily: "'Bricolage Grotesque', system-ui, sans-serif"
    fontSize: "1.65rem"
    fontWeight: 700
    lineHeight: 1.2
    fontVariation: "'wdth' 92, 'opsz' 32"
  subtitle:
    fontFamily: "'Bricolage Grotesque', system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 600
    lineHeight: 1.35
    fontVariation: "'wdth' 92, 'opsz' 32"
  body:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "1.08rem"
    fontWeight: 400
    lineHeight: 1.75
  excerpt:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  caption:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.5
  label-strong:
    fontFamily: "'IBM Plex Mono', monospace"
    fontSize: "0.72rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.14em"
  label:
    fontFamily: "'IBM Plex Mono', monospace"
    fontSize: "0.65rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.18em"
rounded:
  none: "0"
  marker: "0.05em"
spacing:
  rail-x: "1.75rem"
  column-x: "3rem"
  measure: "64ch"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.page}"
    typography: "{typography.label-strong}"
    rounded: "{rounded.none}"
    padding: "0.75rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.olive-deep}"
    textColor: "{colors.page}"
  button-secondary:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.25rem 0.625rem"
  button-secondary-hover:
    backgroundColor: "{colors.rail}"
    textColor: "{colors.olive-deep}"
  button-danger-armed:
    backgroundColor: "{colors.alert}"
    textColor: "{colors.page}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.25rem 0.625rem"
  input-question:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.75rem 1rem"
  card-question:
    backgroundColor: "{colors.rail}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "1.25rem 1.5rem"
  card-answer:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "1.5rem 2rem"
  citation-marker:
    backgroundColor: "{colors.marker}"
    textColor: "{colors.ink}"
    rounded: "{rounded.marker}"
    padding: "0.14em 0.2em"
  citation-marker-hover:
    backgroundColor: "{colors.marker-deep}"
---

# Design System: Archive

## Overview

**North star: an olive-and-sage reading room, with one yellow reserved for evidence.**

This is a redesign, not a refinement — it replaces the prior palette (a
warm-paper world, then a brief sage-only pass) with a deliberate three-tier
system: **ink** for every word on the page, **olive and sage** as the one
living accent family, **white** as the canvas the answer sits on. Nothing
else. The whole point of the system is legibility and confidence: a document
tool should feel calm and precise, not decorative.

Two rules anchor everything else:

1. **Yellow means evidence, full stop.** It appears in exactly two places —
   the band behind a retrieved passage, and the tilted mark behind a citation
   number — and nowhere else in the interface. Not on hover, not on drag
   states, not on progress bars, not on banners. The moment yellow shows up
   anywhere else, it stops meaning anything.
2. **Every control is visibly a control.** Every button carries a 1px border
   at rest — there are no bare text links pretending to be buttons. Hover
   always does two things at once: the border deepens and a fill or accent
   color moves in, so nothing changes state ambiguously.

The product's core loop is a conversation, so the two sides of that
conversation get different colors on purpose: a **question is sage** — the
same sage as the document rail, tying "what you asked" to "your documents" —
and an **answer is pale panel white**, tying "what came back" to the neutral
canvas it's read on. You should be able to tell question from answer at a
glance, without reading either.

**Key Characteristics:**

- Three-tier palette: ink (text), olive/sage (the one accent family), white (canvas)
- Yellow (#F3E85C) appears only in the highlighted passage band and the citation marker — nowhere else
- Every button has a visible border at rest; hover always moves both border and fill/text together
- Questions render on sage (`rail`); answers render on pale panel white — the two are never the same color
- Zero border radius everywhere except the hand-cut citation mark
- No shadows; depth is tonal difference and 1px rules

## Colors

### Primary — the accent family

- **Olive** (#46592E): The one living accent. Appears as the hover state of
  every secondary button (border + text turn olive-deep) and as the resting
  fill of the primary button's *hover* state. Never a resting fill on its own
  except inside the primary button's hover — olive shows up on interaction,
  not as static decoration.
- **Olive Deep** (#313F1F): The primary button's hover fill, and the darker
  half of every hover pairing that uses olive. White text on it: 11.3:1.

### Secondary — sage, the "this is yours" tone

- **Sage / Rail** (#DCE6D2): The document rail's background, and the
  background of every **question** card in the thread. The repetition is
  deliberate — it visually files a question under the same "yours" heading as
  the document list beside it.
- **Panel** (#F1F5EC): A paler, whiter sage. The background of every
  **answer** card, the question input, and the summary dialog — anything that
  is the archive's own surface rather than the visitor's input.

### Neutral — ink, the only text color family

- **Ink** (#15170F): All text, every button border, the primary button's
  resting fill. Warm near-black, not a blue-black.
- **Graphite** (#565A4E): Secondary text only — meta lines, quiet labels,
  placeholder text. A lighter weight of the same ink family, not a separate
  hue. 7.1:1 on white, 5.5:1 on sage, 6.4:1 on panel.
- **Rule** (#BFCBAF): Structural hairlines only — list separators, card
  borders on read-only content. A soft, olive-tinted neutral; deliberately
  quieter than an interactive control's border so the eye can tell "this line
  is decorative structure" from "this line is a button edge."

### Tertiary

- **Alert** (#A32820): Error text, error-card borders, the armed state of a
  destructive confirm. Never used for anything that isn't a failure or a
  danger.

### Named Rules

**The Evidence-Only Rule.** Yellow marks evidence and nothing else: the
highlighted-passage band and the citation marker. If a yellow pixel is not
one of those two things, it is wrong — this rule has no exceptions, including
hover states, drag states, and progress indicators. Those all use olive.

**The You/Archive Rule.** Sage (`rail`) means "input from the visitor" —
the document rail and every question card. Panel means "output from the
archive" — every answer card, the input field, the dialog. A surface never
switches sides once assigned.

**The Bordered-Control Rule.** Every button has a 1px `ink` border at rest.
No exceptions, no borderless text-link buttons anywhere in the app.

## Typography

**Display Font:** Bricolage Grotesque (fallback system-ui, sans-serif).
**Body Font:** Newsreader (fallback Georgia, serif).
**Label/Mono Font:** IBM Plex Mono.

Unchanged from prior versions of this system — the redesign is a color and
component pass, not a typographic one. Grotesque announces, serif reads, mono
labels; see the Named Rules below for the invariants that still hold.

### Hierarchy

- **Display** (700, 2.3rem, `wdth` 88 / `opsz` 40): The Archive wordmark only.
- **Headline** (700, 2rem, `wdth` 92 / `opsz` 32): The empty state's opening
  line, and the summary dialog title (at 1.5rem).
- **Title** (700, 1.65rem, `wdth` 92 / `opsz` 32): The question text inside
  its sage card. Document filenames in the rail use the same settings at
  0.95rem (the `subtitle` step).
- **Body** (400, 1.08rem, Newsreader): The answer text.
- **Excerpt** (400, 1rem, Newsreader): A revealed source passage.
- **Caption** (400, 0.95rem, Newsreader): Supporting serif prose — the empty
  state's intro, the citation hint banner.
- **Label** (400, 0.65rem, uppercase, 0.18em, IBM Plex Mono): Region and
  status labels — "You asked", "Archive answered", "Sources (3)". A denser
  variant (0.68rem, 0.12em) sets every button label.
- **Label Strong** (400, 0.72rem, uppercase, 0.14em, IBM Plex Mono): The Ask
  button only.

### Named Rules

**The Three-Voice Rule.** Grotesque announces, serif reads, mono labels. A
typeface never crosses into another's job.

**The Set-Both-Axes Rule.** Bricolage is variable on width and optical size.
Any new display type sets `font-variation-settings` explicitly.

**The Measure Rule.** Reading text never exceeds 64ch.

## Layout

Unchanged: a two-region split — a fixed 19.5rem rail (sage, the document
list), and a flexible reading column (white, the conversation). Rail divides
from the column with a `rule` border; both regions scroll independently on
desktop and stack on mobile.

## Elevation & Depth

**No shadows.** Depth is tonal difference (sage rail vs. white column vs.
panel cards) and 1px rules. The summary dialog separates from the page with
an ink/45 scrim and a `rule` border, not a shadow.

## Shapes

**Radius is zero**, except the citation marker, which is deliberately
irregular — a chisel-tipped shape with a 0.05em radius, skewed −10°, meant to
read as a mark cut by a blade rather than a rounded chip. It is the one shape
exception in the system and must never be normalized into a rounded
rectangle.

## Components

### Buttons — the bordered system

Three classes, one shared contract: 1px `ink` border at rest, no exceptions.

- **`.btn-primary`** (Ask): ink fill, page text, ink border. Hover: fills
  olive-deep, border follows. This is the only button that starts filled —
  it is the one action that drives the whole product forward.
- **`.btn`** (Cancel, Summarize, Close, Ask again, Got it): page-white fill,
  ink text, ink border. Hover: fills sage (`rail`), border and text turn
  olive-deep. This is the default for every secondary action.
- **`.btn-danger`** (Delete): a `.btn` modifier. Same rest state. Hover turns
  border and text to alert red instead of olive — a warning, not an
  invitation. Once armed (`data-armed="true"`), it commits fully: solid alert
  fill, page text, and a 4-second countdown rule beneath the label so the
  confirm window stays visible without adding more chrome.

All three carry `.lift` (a 1px rise on hover) and `.focus-ring` (a 2px ink
outline on keyboard focus).

### Cards — question vs. answer

- **Question card** (`bg-rail`): sage background, `rule` border, a "You
  asked" label above the question text.
- **Answer card** (`bg-panel`): pale panel background, `rule` border (or
  `alert/40` when the answer failed), an "Archive answered" / "Couldn't
  answer" label above the response.

The two never share a background color. That distinction — not typography,
not position — is what lets a reader tell question from answer without
reading either one.

### Inputs

The question input sits on `bg-panel` with an `ink/25` border, strengthening
to `ink/60` on hover; focus is the shared 2px ink outline. The upload drop
zone stays dashed (the one place the border style itself, not just its
color, signals "different kind of control" from a button) — resting at
`ink/35`, hovering to `ink/60`, and turning solid olive-deep with a light
olive wash while a file is dragged over it.

### Progress

Indeterminate work is a sliding bar in `olive` (light surfaces) or
`olive-deep` (on cards), paired with a plain-words status line. Never a
spinner, never yellow — progress is not evidence.

### Signature: the highlighter

Unchanged in mechanism from prior versions — the passage band (`.hl`) and the
citation marker (`.citation-marker`) are still the system's one yellow
signature, still built from the same gradient-and-chisel-mark logic. What
changed is everything *around* them: they are now the only yellow on the
page, which makes them mean more, not less.

## Do's and Don'ts

### Do:

- **Do** keep yellow to exactly two places: the highlighted passage band and
  the citation marker.
- **Do** give every button a 1px ink border at rest, with a hover that moves
  border and fill/text together.
- **Do** render questions on `bg-rail` (sage) and answers on `bg-panel`
  (pale white) — never the same surface.
- **Do** use olive only on interaction (hover, active, armed-adjacent
  states) or as the primary button's hover fill — never as a resting
  decoration.
- **Do** keep the dropzone dashed, distinct in border *style* from every
  solid-bordered button.
- **Do** write status and error text as plain declarative sentences, no
  exclamation marks, no assistant persona.
- **Do** guard every animation behind `prefers-reduced-motion: reduce`.

### Don't:

- **Don't** use yellow for hover, drag states, progress bars, banners, or
  any decoration. It is evidence-only.
- **Don't** ship a borderless button. `.btn`, `.btn-primary`, and
  `.btn-danger` all start with a 1px ink border; there is no fourth,
  unbordered variant.
- **Don't** let a question and an answer share a background color.
- **Don't** add `box-shadow` to anything.
- **Don't** round corners, add pills, or normalize the citation marker's
  chisel shape into a rounded chip.
- **Don't** introduce a fourth typeface, or set prose in IBM Plex Mono.
- **Don't** imply private accounts, personal libraries, or per-user scoping;
  the corpus is shared and unauthenticated.
