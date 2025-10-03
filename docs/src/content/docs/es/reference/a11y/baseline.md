---
title: "Línea base de linting de accesibilidad"
description: "Comprende las reglas compartidas de linting JSX a11y y cómo ejecutar las comprobaciones localmente."
sidebar:
  label: "Línea base de linting"
---
> TODO: Traducir el contenido restante al español.

# Accessibility linting baseline

We use [`eslint-plugin-jsx-a11y`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y) to enforce web accessibility affordances in React code. The shared ESLint preset (`packages/config/eslint.cjs`) now extends `plugin:jsx-a11y/strict`, which surfaces high-impact issues without requiring component refactors.

## Rules enabled

The baseline relies on the plugin defaults plus a couple of TypeScript-friendly tweaks:

- **`jsx-a11y/no-autofocus`** &rarr; Disallows autofocus on DOM elements. We ignore non-DOM components so forwardRef wrappers can opt in when they manage focus internally.
- **`jsx-a11y/label-has-associated-control`** &rarr; Ensures form labels reference inputs either through nesting or `htmlFor`, scanning up to three wrapper levels to accommodate styled components.
- **`plugin:jsx-a11y/strict` preset** &rarr; Covers landmark, role, keyboard, and ARIA usage issues.

Run the checks locally with:

```bash
yarn lint:a11y
```

The command delegates to the web workspace (`apps/web`) and runs ESLint on the TypeScript/JSX sources.
