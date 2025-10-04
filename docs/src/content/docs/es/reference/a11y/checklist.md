---
title: "Listas de verificación de accesibilidad"
description: "Referencia rápida para revisar comportamientos críticos de accesibilidad antes de lanzar."
sidebar:
  label: "Listas"
---
> TODO: translate body

# Accessibility Checklists

Use these quick-reference checklists during reviews to cover critical accessibility behaviors before a feature ships.

## Definition of Done

- [ ] Keyboard: every interactive element is reachable and operable with a keyboard, including escape paths.
- [ ] Focus: focus order is logical, visible, and restored after transient UI closes.
- [ ] Labels: interactive controls expose accessible names that match visible intent.
- [ ] Errors: validation and runtime errors are announced and programmatically associated with inputs.
- [ ] Announcements: live updates use ARIA live regions or equivalent announcements when necessary.
- [ ] Contrast: text, icons, and focus indicators meet contrast requirements (WCAG AA or better).

## Pages

- [ ] Provide a unique page title and top-level heading describing the content.
- [ ] Ensure landmarks (header, navigation, main, footer) are present and not duplicated needlessly.
- [ ] Confirm skip navigation links land on the main content container.
- [ ] Verify responsive layouts do not hide content or controls when zoomed to 200%.

## Forms

- [ ] Associate each input with a visible label and accessible description for helper text.
- [ ] Surface validation errors inline, referencing the offending input and summary if needed.
- [ ] Preserve user input on failed submissions to avoid re-entry.
- [ ] Support keyboard-only submission and movement between fields.

## Dialogs

- [ ] Trap focus within the dialog while it is open and restore focus afterward.
- [ ] Provide a descriptive title announced on open and set `aria-modal="true"` when appropriate.
- [ ] Offer keyboard-accessible dismissal (Escape key, cancel buttons).
- [ ] Prevent background content from being read by screen readers while open.

## Tabs

- [ ] Implement manual tab activation with arrow keys per WAI-ARIA Authoring Practices.
- [ ] Mark the active tab with `aria-selected="true"` and manage `tabindex` appropriately.
- [ ] Ensure tab panel content is associated with its trigger via `aria-controls`/`id`.
- [ ] Maintain focus when switching tabs and announce tab changes when necessary.

## Menus

- [ ] Open and close menus with keyboard interactions (Enter, Space, Arrow keys, Escape).
- [ ] Cycle focus through menu items without trapping the user.
- [ ] Provide clear hover and focus states with sufficient contrast.
- [ ] Close menus when focus moves away or an action is taken.

## Data Tables

- [ ] Use semantic `<table>`, `<thead>`, `<tbody>`, `<th>` elements with scope or headers associations.
- [ ] Provide captions or summaries describing table purpose.
- [ ] Support keyboard navigation for sortable headers and announce sort state.
- [ ] Ensure responsive behaviors preserve readability and association between headers and cells.

## Toasts

- [ ] Announce toast content via polite or assertive live regions depending on severity.
- [ ] Keep toasts dismissible and prevent them from stealing focus automatically.
- [ ] Provide a keyboard-accessible control to dismiss persistent toasts.
- [ ] Maintain sufficient contrast and readable text at minimum sizes.
