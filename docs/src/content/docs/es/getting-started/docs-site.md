---
title: "Sitio de documentación de Ebal v2"
description: "Instala las dependencias y ejecuta la documentación de Astro + Starlight en local."
sidebar:
  label: "Sitio de docs"
  order: 10
---

# Sitio de documentación de Ebal v2

Este directorio aloja el sitio de documentación de Every Breath And Life (Ebal) v2 construido con Astro + Starlight. El sitio se basa en la estructura del sistema de archivos, por lo que la barra lateral refleja automáticamente el contenido dentro de `src/content/docs`.

## Requisitos previos

- Node.js 18.14+ o 20+
- Yarn (recomendado) o npm/pnpm. Los comandos siguientes asumen Yarn.

## Instalar dependencias

```bash
cd docs
yarn install
```

## Desarrollo local

Inicia el servidor de desarrollo de Starlight con recarga en caliente:

```bash
yarn dev
```

Luego abre la URL local mostrada en tu navegador.

## Compilar el sitio estático

Crea una compilación optimizada para producción:

```bash
yarn build
```

Puedes previsualizar el sitio compilado en local:

```bash
yarn preview
```

## Estructura del proyecto

- `astro.config.mjs`: configuración de Astro, incluida la integración de Starlight.
- `starlight.config.mjs`: ajustes específicos de Starlight como título, grupos de la barra lateral y estilos personalizados.
- `src/content/docs`: contenido Markdown/MDX organizado en secciones de la barra lateral.
- `src/styles`: sobrescrituras CSS opcionales aplicadas sobre el tema predeterminado de Starlight.

Agrega o actualiza archivos `.md`/`.mdx` dentro de `src/content/docs` para ampliar la documentación. La barra lateral se actualizará automáticamente según la carpeta en la que ubiques cada documento.
