---
title: "Línea base de linting de accesibilidad"
description: "Comprende las reglas compartidas de linting JSX a11y y cómo ejecutar las comprobaciones localmente."
sidebar:
  label: "Línea base de linting"
---

# Línea base de linting de accesibilidad

Usamos [`eslint-plugin-jsx-a11y`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y) para aplicar criterios de accesibilidad web en el código React. El preset compartido de ESLint (`packages/config/eslint.cjs`) ahora extiende `plugin:jsx-a11y/strict`, lo que identifica problemas de alto impacto sin requerir refactors drásticos.

## Reglas habilitadas

La línea base utiliza los valores predeterminados del plugin más un par de ajustes compatibles con TypeScript:

- **`jsx-a11y/no-autofocus`** → Prohíbe usar `autofocus` en elementos del DOM. Ignoramos componentes que no son DOM para que los wrappers con `forwardRef` puedan habilitarlo cuando gestionan el enfoque internamente.
- **`jsx-a11y/label-has-associated-control`** → Garantiza que las etiquetas de formulario referencien inputs ya sea anidándolos o con `htmlFor`, analizando hasta tres niveles de envoltorios para soportar componentes estilizados.
- **Preset `plugin:jsx-a11y/strict`** → Cubre problemas de landmarks, roles, teclado y uso de ARIA.

Ejecuta las comprobaciones localmente con:

```bash
yarn lint:a11y
```

El comando delega al workspace web (`apps/web`) y ejecuta ESLint sobre las fuentes TypeScript/JSX.
