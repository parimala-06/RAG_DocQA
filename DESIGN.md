---
name: Waypoint
description: Bold, warm-dark document Q&A — a teal citation badge marks the exact waypoint back to the source, on a confident travel-app-inspired surface.
colors:
  night: "#0E1524"
  night-elevated: "#182035"
  night-rule: "#2A3348"
  cream: "#F2F3F6"
  paper: "#FFFFFF"
  ink: "#16182B"
  mist: "#F3F6FB"
  muted: "#6B7280"
  muted-dark: "#93A0B8"
  teal: "#2FD9A8"
  teal-deep: "#0E7C5F"
  teal-tint: "#E4FAF2"
  coral: "#FF6B4A"
  coral-deep: "#C23F24"
  coral-tint: "#FFE9E2"
  alert: "#DC2626"
  alert-tint: "#FDE7E7"
typography:
  display:
    fontFamily: "'Bricolage Grotesque', system-ui, sans-serif"
    fontWeight: 800
  heading:
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif"
    fontWeight: 700
  body:
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif"
    fontWeight: 400
  numeric:
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif"
    fontVariantNumeric: tabular-nums
rounded:
  card: "16px"
  chip: "12px"
  pill: "9999px"
spacing:
  rail-width: "20rem"
components:
  button-primary:
    backgroundColor: "{colors.teal-deep}"
    textColor: "{colors.mist}"
    rounded: "{rounded.pill}"
    padding: "0.625rem 1.25rem"
  button-primary-hover:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.night}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.muted-dark}"
    border: "1px solid night-rule"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.625rem"
  button-secondary-hover:
    border: "1px solid {colors.teal}"
    textColor: "{colors.teal}"
  button-danger-armed:
    backgroundColor: "{colors.alert}"
    textColor: "{colors.mist}"
    rounded: "{rounded.pill}"
  citation-marker:
    backgroundColor: "{colors.teal-deep}"
    textColor: "{colors.mist}"
    rounded: "{rounded.pill}"
    glyph: "✓"
  excerpt-panel:
    backgroundColor: "{colors.teal-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.chip}"
---

# Design System: Waypoint

## Overview

**North star: a confident, warm-dark surface where a teal badge marks the exact waypoint back to the source.**

This replaces the "Tie-Out Ledger" system (quiet olive/paper accounting world) by
explicit user direction: the ledger read as flat and lifeless, and the brief
asked for a theme inspired by a bold consumer travel brand — deep navy surfaces,
one vivid teal CTA color, warm complementary accents, confident bold type,
generous rounding, soft glow instead of hairline rules. Waypoint keeps the
product's real mechanism (retrieval-augmented answers with checkable citations)
but dresses it the way a travel app dresses a trip: dark hero surfaces, a
teal "go" color, and warmth instead of restraint.

**Key characteristics:**

- Warm-dark rail (`night`) holding the document index, paired with a bright
  `cream` reading column — high contrast between the two regions, not tonal
  sameness.
- One cool accent (`teal`) drives every primary action and the citation
  badge; one warm accent (`coral`) marks the guided tour and small warmth
  moments — a deliberate complementary pair, not a single muted hue.
- Generous rounding (12–16px on cards, full pill on buttons and badges) and
  soft glow shadows replace the ledger's zero-radius, zero-shadow doctrine.
- Bold type does real hierarchy work: Bricolage Grotesque at 800 weight for
  headline moments (wordmark, empty-state line, modal/dialog titles), IBM
  Plex Sans for everything else, including counts — set in tabular figures
  rather than switching typeface. Exactly two font families run the whole
  UI; a third face for numerals alone read as one typeface too many.
- No side-tab borders. Cards get their identity from fill color, radius, and
  shadow — never a thick colored border on one edge.

## Colors

### Primary — teal, the "go" color

- **Teal** (`#2FD9A8`): Icons, borders, hover fills, the guided tour is the
  only place it yields to coral. 6.5:1 against `night`. Focus rings use it at
  50% opacity (`teal/50`) — full-strength teal as a glow ring read as a
  generic "AI product" neon-cyan halo; diluted, it still signals focus
  clearly without that tell.
- **Teal Deep** (`#0E7C5F`): Solid fills carrying `mist` text — the citation
  badge's resting state and the guided tour's primary button. 5.16:1 with
  white/mist text.
- **Teal Tint** (`#E4FAF2`): The excerpt panel's background — the "you found
  it" surface a citation badge opens onto.

### Secondary — coral, the warmth accent

- **Coral** (`#FF6B4A`): Non-text accents only — the guided tour's spotlight
  border, small warmth touches. Never used for text at small sizes (fails
  contrast as text).
- **Coral Deep** (`#C23F24`): The text-safe coral — used where coral needs to
  carry a small bold label (the tour's step counter). 5.21:1 on white.

### Neutral

- **Night** (`#0E1524`) / **Night Elevated** (`#182035`) / **Night Rule**
  (`#2A3348`): The rail's base, card, and hairline — three steps of one dark
  neutral, not a flat single tone. `Night` fill also carries the Ask button
  and the user's own question bubbles in the reading column, echoing the
  rail's color into the light column so the user's voice and the app's
  primary action both read as an extension of the same dark surface, distinct
  from Archive's teal-badged answers.
- **Cream** (`#F2F3F6`, a neutral light grey despite the name): The reading
  column's canvas and the elevated card surface within it.
- **Ink** (`#16182B`): Body text on light surfaces.
- **Mist** (`#F3F6FB`): Text on dark/filled surfaces.
- **Muted** (`#6B7280`) / **Muted Dark** (`#93A0B8`): Secondary text on light
  and dark surfaces respectively — never gray-on-gray; each is picked for its
  own background's contrast.

### Alert

- **Alert** (`#DC2626`): Errors and the armed delete state only. 4.83:1 on
  white. Kept a full hue away from coral so "warmth" and "danger" never read
  as the same signal.

### Named Rule

**The Complementary-Pair Rule.** Exactly two accents exist — teal (cool,
primary/action/citation) and coral (warm, tour/highlight only) — chosen as a
deliberate complementary pair, never a single muted hue doing all the work.

## Typography

**Display Font:** Bricolage Grotesque (800) — headline moments only: the
wordmark, the empty-state line, modal and dialog titles, the guided tour's
step heading. Replaced Syne mid-build: Syne's letterforms read as unusually
wide/quirky at headline sizes, closer to a type-specimen curiosity than a
confident travel-brand voice; Bricolage Grotesque keeps the bold, geometric
character without that tell.
**Body Font:** IBM Plex Sans — everything else: paragraphs, buttons, labels,
the chat thread itself, and all numerals (chunk counts, citation indices,
status readouts) set in tabular figures rather than a separate monospace
face. Exactly two typefaces run the system; a third for numerals alone was
dropped as unnecessary variety. This includes filenames wherever they
appear (document list, summary modal title) — arbitrary, variable-length
user content set in the display face read as stretched/expanded at
extrabold weight, the same tell the Syne→Bricolage swap was meant to fix;
filenames are data, not a curated headline, so they stay in Plex Sans bold
like the rest of the document list.

### Named Rule

**The Headline-Moment Rule.** Bricolage Grotesque is reserved for the handful of places a
visitor's eye should land first. It never sets a paragraph, a button label,
or the chat thread — using it there would dilute the one place it earns its
keep.

## Layout

Unchanged in structure: a fixed rail (20rem, `night`) holding the document
index, and a flexible reading column (`cream`) holding the question thread.
Rail and column separate by color contrast, not a rule line. Both regions
scroll independently on desktop and stack on mobile.

## Elevation & Depth

Soft, colored glow shadows replace the ledger's flat hairlines: `shadow-glow`
(teal-tinted) under primary actions and question bubbles, `shadow-card`
(neutral, soft) under paper surfaces on the cream column, `shadow-card-dark`
available for elevated dark surfaces. Depth is real now, not just tonal
difference — this system earns shadows the ledger deliberately refused.

## Shapes

Generous rounding: 16px (`rounded-2xl`) on cards and modals, 12px
(`rounded-xl`) on document-list items and the excerpt panel, full pill
(`rounded-full`) on every button, badge, and the ask-input container. The one
deliberate exception: the thread's question and answer bubbles drop rounding
to a sharp 0px on the corner nearest their sender (`rounded-br-none` on the
user's bubble, `rounded-bl-none` on Archive's) — a comic-panel speech-bubble
silhouette that points at who's speaking, rather than the soft symmetric
`rounded-2xl` used everywhere else. The answer bubble also carries a 1px
`teal` border, giving Archive's replies the same accent treatment the
citation badge and focus states use. No other surface in this system takes a
sharp corner.

## Components

### Buttons

- **Primary — night** (Ask, guided-tour Next/Got it): `night` fill, `mist`
  text, full pill — echoes the rail's own color into the light surfaces it
  sits on, so the app's primary actions read as an extension of the document
  index rather than a third accent. Hover fills bright `teal` with `night`
  text. The tour's Next/Got it button is styled identically to Ask, not a
  separate variant — one primary-action style everywhere it appears.
  Disabled state fills `night-elevated` with `muted-dark` text instead of
  fading `night` via opacity — opacity-dimming a near-black fill against the
  light `cream` column read as a flat, off-theme grey; stepping to the
  neutral system's own next-lighter tone keeps it recognizably part of the
  dark palette.
- **Secondary** (Guide): transparent fill, `muted-dark` text, `night-rule`
  border, full pill. Hover: border and text turn `teal`.
- **Danger** (Delete): a secondary variant; hover turns `alert`. Armed: solid
  `alert` fill, `mist` text — same 4-second confirm window as before.

### The citation badge

The signature element, carried over from the ledger world in spirit but
redrawn: a solid `teal-deep` pill (not a bracketed number, not a tick-mark
underline) holding a checkmark and the source index. Hover brightens to
`teal` with `night` text and lifts 1px. Opens an `excerpt-panel` — a
`teal-tint`, rounded, shadow-free card holding the exact retrieved passage.

### Guided tour

A first-visit spotlight walkthrough (`components/GuidedTour.jsx`): a dark
scrim, a `coral-deep`-bordered rounded cutout highlighting the live upload
control, then the live ask control, each with a plain-language callout
(`paper`, `shadow-card`, Bricolage Grotesque heading, `night`-fill Next
button matching Ask). Shown once via `localStorage` (`archive-tour-seen`),
replayable from the rail's
"Guide" pill. Read-only over the real UI — never intercepts an actual
upload/ask/document action.

## Do's and Don'ts

### Do:

- **Do** keep exactly two accents — teal for action/citation, coral for the
  tour/highlight only — as a complementary pair.
- **Do** round every card and button; this system has no sharp corners.
- **Do** let question bubbles and the Ask button carry `shadow-glow` — glow
  is this system's signature depth cue.
- **Do** reserve Bricolage Grotesque for headline moments; body and buttons
  stay in Plex Sans.
- **Do** guard every animation behind `prefers-reduced-motion`.

### Don't:

- **Don't** add a thick colored border on one edge of a card (a side-tab) —
  this system gets its identity from fill, radius, and glow instead.
- **Don't** set body copy, chat text, or button labels in Bricolage
  Grotesque.
- **Don't** use `coral` as small text — it fails contrast; use `coral-deep`.
- **Don't** let the guided tour block or alter any real upload/ask/document
  action — it only explains, never intercepts.
- **Don't** imply private accounts or per-user scoping; the corpus stays
  shared and unauthenticated (unchanged product constraint).
