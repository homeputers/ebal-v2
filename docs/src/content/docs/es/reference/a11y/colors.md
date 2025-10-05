---
title: "Guardia de contraste de color"
description: "Verifica que las combinaciones de tokens del tema cumplan con los requisitos de contraste WCAG durante el desarrollo."
sidebar:
  label: "Contraste de color"
---

# Guardia de contraste de color

Nuestros tokens de diseño dependen de pares de colores de primer plano y fondo. Durante el desarrollo verificamos automáticamente que las combinaciones satisfagan el contraste WCAG 2.1 AA para texto normal.

## Verificación automática de tokens del tema

1. Inicia el cliente web en modo desarrollo: `cd apps/web && yarn dev`.
2. Carga la aplicación en tu navegador y abre la consola de desarrollador.
3. Busca entradas de log con el prefijo `[theme-contrast]`. Actualmente validamos:
   - `--foreground` sobre `--background`
   - `--card-foreground` sobre `--card`
   - `--popover-foreground` sobre `--popover`
   - `--primary-foreground` sobre `--primary`
   - `--secondary-foreground` sobre `--secondary`
   - `--muted-foreground` sobre `--muted`
   - `--accent-foreground` sobre `--accent`
   - `--destructive-foreground` sobre `--destructive`
4. Si aparece alguna advertencia, ajusta las variables CSS en `apps/web/src/index.css` hasta que la consola no informe fallos (relación de contraste ≥ 4.5:1).

## Revisiones manuales puntuales

Cuando iteres en componentes individuales puedes comprobar el contraste adicionalmente:

- Inspecciona el elemento en las herramientas de desarrollo, copia el valor resuelto `hsl(var(--token))` y pégalo en un verificador de contraste como [WebAIM](https://webaim.org/resources/contrastchecker/).
- Para utilidades de Tailwind que combinan tokens (por ejemplo, `bg-primary text-primary-foreground`), verifica el par con la misma herramienta para confirmar el cumplimiento AA a nivel de componente.

Documenta en esta carpeta cualquier excepción intencional o relación que no pueda cumplir AA para que las personas revisoras comprendan la compensación.
