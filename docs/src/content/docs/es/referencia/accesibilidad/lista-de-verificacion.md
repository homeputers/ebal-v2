---
title: "Listas de verificación de accesibilidad"
description: "Referencia rápida para revisar comportamientos críticos de accesibilidad antes de lanzar."
sidebar:
  label: "Listas"
---

# Listas de verificación de accesibilidad

Utiliza estas listas de referencia rápida durante las revisiones para cubrir comportamientos críticos de accesibilidad antes de publicar una funcionalidad.

## Definición de terminado

- [ ] Teclado: cada elemento interactivo es alcanzable y operable con teclado, incluidas rutas de escape.
- [ ] Enfoque: el orden de enfoque es lógico, visible y se restaura después de cerrar UI transitoria.
- [ ] Etiquetas: los controles interactivos exponen nombres accesibles que coinciden con la intención visible.
- [ ] Errores: los errores de validación y de ejecución se anuncian y están asociados programáticamente a sus campos.
- [ ] Anuncios: las actualizaciones en vivo usan regiones ARIA o anuncios equivalentes cuando es necesario.
- [ ] Contraste: texto, íconos e indicadores de enfoque cumplen los requisitos de contraste (WCAG AA o mejor).

## Páginas

- [ ] Proporciona un título de página único y un encabezado de primer nivel que describa el contenido.
- [ ] Asegura que existan landmarks (header, navigation, main, footer) sin duplicados innecesarios.
- [ ] Confirma que los enlaces de salto de navegación aterricen en el contenedor principal de contenido.
- [ ] Verifica que los diseños responsivos no oculten contenido ni controles al hacer zoom al 200%.

## Formularios

- [ ] Asocia cada input con una etiqueta visible y una descripción accesible para el texto de ayuda.
- [ ] Muestra los errores de validación en línea, haciendo referencia al campo afectado y un resumen si es necesario.
- [ ] Conserva la entrada del usuario en envíos fallidos para evitar reescritura.
- [ ] Soporta envío y navegación entre campos solo con teclado.

## Diálogos

- [ ] Encierra el enfoque dentro del diálogo mientras esté abierto y restáuralo al cerrar.
- [ ] Proporciona un título descriptivo anunciado al abrir y establece `aria-modal="true"` cuando corresponda.
- [ ] Ofrece cierre accesible con teclado (tecla Escape, botones de cancelar).
- [ ] Impide que lectores de pantalla lean el contenido de fondo mientras el diálogo esté abierto.

## Pestañas

- [ ] Implementa activación manual con teclas de flecha según las prácticas de autoría WAI-ARIA.
- [ ] Marca la pestaña activa con `aria-selected="true"` y gestiona `tabindex` adecuadamente.
- [ ] Asegura que el contenido del panel esté asociado con su disparador mediante `aria-controls`/`id`.
- [ ] Mantén el enfoque al cambiar de pestaña y anuncia los cambios cuando sea necesario.

## Menús

- [ ] Abre y cierra menús con interacciones de teclado (Enter, Space, flechas, Escape).
- [ ] Permite ciclar el enfoque por los elementos del menú sin atrapar al usuario.
- [ ] Proporciona estados claros de hover y enfoque con contraste suficiente.
- [ ] Cierra los menús cuando el enfoque se mueve o se ejecuta una acción.

## Tablas de datos

- [ ] Usa elementos semánticos `<table>`, `<thead>`, `<tbody>`, `<th>` con `scope` o asociaciones de encabezados.
- [ ] Ofrece leyendas o resúmenes que describan el propósito de la tabla.
- [ ] Soporta navegación con teclado para encabezados ordenables y anuncia el estado de orden.
- [ ] Asegura que los comportamientos responsivos preserven legibilidad y asociación entre encabezados y celdas.

## Toasts

- [ ] Anuncia el contenido del toast mediante regiones en vivo de tipo polite o assertive según la severidad.
- [ ] Mantén los toasts descartables y evita que tomen el foco automáticamente.
- [ ] Ofrece un control accesible por teclado para descartar toasts persistentes.
- [ ] Conserva contraste suficiente y texto legible en tamaños mínimos.
