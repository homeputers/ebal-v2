---
title: "Color Contrast Guard"
description: "Verify theme token pairings meet WCAG contrast requirements during development."
sidebar:
  label: "Color contrast"
---

# Color contrast guard

Our design tokens rely on paired foreground/background colors. During development we automatically verify that the pairings satisfy WCAG 2.1 AA contrast for normal text.

## Automatic theme token check

1. Start the web client in development mode: `cd apps/web && yarn dev`.
2. Load the app in your browser and open the developer console.
3. Look for log entries prefixed with `[theme-contrast]`. We currently verify:
   - `--foreground` on `--background`
   - `--card-foreground` on `--card`
   - `--popover-foreground` on `--popover`
   - `--primary-foreground` on `--primary`
   - `--secondary-foreground` on `--secondary`
   - `--muted-foreground` on `--muted`
   - `--accent-foreground` on `--accent`
   - `--destructive-foreground` on `--destructive`
4. If any warning appears, adjust the CSS variables in `apps/web/src/index.css` until the console reports no failures (contrast ratio ≥ 4.5:1).

## Manual spot checks

When iterating on individual components, you can double-check contrast by:

- Inspecting the element in devtools, copying the resolved `hsl(var(--token))` value, and pasting it into a contrast checker such as [WebAIM](https://webaim.org/resources/contrastchecker/).
- For Tailwind utilities that mix tokens (e.g., `bg-primary text-primary-foreground`), verify the pair using the same tool to confirm AA compliance at the component level.

Document any intentional exceptions or ratios that cannot meet AA in this folder so reviewers understand the tradeoff.
