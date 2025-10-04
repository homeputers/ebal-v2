# Internationalization Authoring Guidelines

These guidelines apply to localized documentation in this repository. Follow them whenever you add or modify translated docs.

## Folder structure
- Keep English documentation under `src/content/docs/en/**`.
- Keep Spanish documentation under `src/content/docs/es/**`.

## Frontmatter
- Localize both the `title` and `description` fields for each page.
- Avoid embedding locale codes (for example, "(EN)" or "(ES)") in titles.

## Links
- Use relative links when referencing other pages within the same locale tree.
- When cross-linking to a page that does not exist in the target locale, link to that locale's closest parent (for example, link to `/es/manuales/`).

## Media assets
- Reuse the same image files across locales to prevent duplication.
- Localize captions and alternative text for each locale.

## Glossary
- Maintain locale-specific glossaries at `/docs/i18n/glossary.en.md` and `/docs/i18n/glossary.es.md`.
- Document core domain terms such as Arrangement, ChordPro, Song Set, and Service Plan in each glossary.

## Review requirements
- Pull requests that introduce a new page in one locale must include the corresponding path for the other locale. A placeholder file is acceptable when a full translation is not yet available.

