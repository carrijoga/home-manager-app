# DESIGN.md

Design rationale for Ninho. This file records **why** the UI looks the way it does.
Implementation rules — exact class names, which component to import — live in
[`src/components/CLAUDE.md`](../src/components/CLAUDE.md); this file explains the
reasoning behind them so future decisions can extend the system instead of guessing.

UI text is Brazilian Portuguese. Code identifiers are English.

## Reference implementation

The new-transaction sheet (`src/components/modals/transaction-sheet/`) is the canonical
form. When a new sheet or modal needs a decision this document doesn't cover, copy what
the transaction sheet does rather than inventing a per-screen answer.

The reason for having one reference at all: the app is a set of loosely related modules
(tasks, shopping, finances, calendar) built at different times. Without a designated
source of truth, each module drifts into its own dialect and the app stops feeling like
one product.

## Forms

### Labels are quiet, values are loud

Field labels are small, uppercase, letter-spaced, and muted
(`text-xs text-muted-foreground uppercase tracking-wide`). Inputs sit on a faint tinted
surface (`bg-muted/30 border-border/40`) rather than a hard-bordered box.

The intent is that a form reads as a list of *values the user is entering*, with the
labels receding into structure. Uppercase micro-labels are legible at small sizes
without competing with the content, which lets forms stay dense without feeling loud.
Ninho's forms are mostly short and repetitive — a label style that shouts would make
every sheet feel heavier than the task it represents.

### Picker choice follows the data, not the option count

Closed enums use Radix `Select`. User-authored lists use a searchable combobox.

The tempting rule is "few options → dropdown, many options → search". It was rejected
because it makes the control unstable: a category picker would silently change shape as
the user adds their fifth category. Binding the control to the *nature* of the data
keeps a given field looking the same for every family using the app, and makes the
choice mechanical for whoever builds the next form.

A consequence worth stating: search is a promise that the list is open-ended. Putting a
search box on a fixed enum tells the user there might be more options if they type —
there aren't. The unit picker in the Shopping dialogs currently does this and is a known
inconsistency, not a pattern to copy.

### Native `<select>` is out

It can't be themed to match the tinted-surface treatment, renders as an OS widget that
looks foreign on mobile, and gives no hook for shared styling. Two legacy usages remain
(`BankAccountSheet`, `FutureItems`); they are migration debt, not precedent.

## Explaining the non-obvious

When a field is required for a reason the user cannot infer from the form itself, it
gets a `HelpCircle` tooltip next to the label.

The rule is deliberately narrow. A tooltip on an obvious field is noise, and noise
trains people to ignore tooltips on the fields that actually need them. The bar is:
*would a reasonable user be confused about why this is required, or what to put here?*

Example: a Credit/Debit card must be linked to a bank account. Nothing on the card form
explains why, so the linked-account field carries a tooltip. The card's name field does
not.

## Never strand the user

A form must never reach a state where the user can see what's wrong but cannot fix it.
This shows up in three ways, all of which have bitten this codebase:

- **Validation requires data the form never loaded.** If a field is required, the sheet
  loads its options before it can enforce the requirement.
- **The control is hidden when its list is empty.** Gating a field on `list.length > 0`
  turns a visible requirement into an invisible blocker — the user sees a failing submit
  with no corresponding field.
- **Submit is disabled with no explanation.** A disabled button communicates nothing. If
  the user must create something else first, say so where the field would be.

The underlying principle: an error message the user cannot act on is worse than no error
message, because it implies the user did something wrong when the UI did.

## Accessibility floor

Every `Sheet`/`Dialog` has a real `SheetTitle`/`DialogTitle`. Radix warns about this and
an untitled dialog is genuinely unusable with a screen reader — the user gets no
announcement of what just opened. Visually hidden titles (`VisuallyHidden.Root`) are
fine when the design has no room for a visible heading; omitting the title is not.

Interactive icon-only controls carry an `aria-label`.

## Motion

Shared Framer Motion variants live in `src/lib/animations.ts`. All motion is gated on
`usePrefersReducedMotion`.

Motion in Ninho is for continuity — showing where a sheet came from, keeping a list
stable as items enter and leave — not for decoration. Animated icons are used on
controls the user acts on (buttons, triggers, nav items), where movement is feedback.
Static icons are used for anything decorative or informational, where movement would be
a distraction competing with the content it sits next to.

## Updating this file

Add to it when a design decision is made that the next person would otherwise have to
re-derive or would plausibly get wrong. Prefer recording the reasoning and the rejected
alternative — a rule with no stated "why" gets overridden the first time it's
inconvenient. Concrete class names and component names belong in
`src/components/CLAUDE.md`, so they stay next to the code they govern.
