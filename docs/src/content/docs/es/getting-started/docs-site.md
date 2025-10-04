---
title: "Sitio de documentación de Ebal v2"
description: "Instala las dependencias y ejecuta la documentación de Astro + Starlight en local."
sidebar:
  label: "Sitio de docs"
  order: 10
---
> TODO: translate body

# Ebal v2 Documentation Site

This directory hosts the Astro + Starlight documentation site for Every Breath And Life (Ebal) v2. The site is file-system driven, so the sidebar automatically reflects the structure under `src/content/docs`.

## Prerequisites

- Node.js 18.14+ or 20+
- Yarn (recommended) or npm/pnpm. The commands below assume Yarn.

## Install dependencies

```bash
cd docs
yarn install
```

## Local development

Start the Starlight dev server with hot reload:

```bash
yarn dev
```

Then open the printed local URL in your browser.

## Build the static site

Create an optimized production build:

```bash
yarn build
```

You can preview the built site locally:

```bash
yarn preview
```

## Project layout

- `astro.config.mjs` – Astro configuration, including the Starlight integration.
- `starlight.config.mjs` – Starlight-specific settings such as title, sidebar groups, and custom styles.
- `src/content/docs` – Markdown/MDX content organized into sidebar sections.
- `src/styles` – Optional CSS overrides applied on top of the default Starlight theme.

Add or update `.md`/`.mdx` files under `src/content/docs` to grow the documentation. The sidebar will update automatically based on the folder you place a document in.
