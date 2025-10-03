---
title: "Diseño de internacionalización web"
description: "Arquitectura y plan de migración para llevar i18n al front-end de React."
sidebar:
  label: "Diseño web i18n"
---
> TODO: Traducir el contenido restante al español.

# Web Internationalization Design Doc

## Overview
Introduce multilingual support to the React 18 + Vite front-end without touching backend services. The solution will integrate i18next for string localization, propagate user language preferences through routing and persisted storage, and standardize formatting via the browser `Intl` APIs while keeping domain data language-neutral.

## Goals & Non-Goals
- **Goals**
  - Support English (`en`) and Spanish (`es`) at launch with an easily extensible structure for additional locales.
  - Drive language selection from the URL (`/:lang/...`) with persistence to `localStorage` as a fallback.
  - Forward the active language to APIs through an Axios interceptor using the `Accept-Language` header.
  - Externalize all UI copy to i18next JSON resources split across required namespaces (`common`, `members`, `songs`, `arrangements`, `services`, `songSets`, `validation`).
  - Use `Intl` for date, number, and list formatting to match the active locale.
  - Provide migration guidance to replace hardcoded strings and validation messages.
  - Establish unit and Playwright smoke testing for the new i18n flow.
- **Non-Goals**
  - Backend schema or API changes.
  - Translating domain data returned from the API (remain language-neutral).
  - Handling right-to-left layouts (future enhancement).

## Current State Summary
- Routing: React Router v6 with nested routes under `/apps/web/src/routes` (exact structure TBD, assumption based on project standards).
- Data: TanStack Query handles server state; Axios used for HTTP client.
- Forms & validation: React Hook Form + Zod with inline English validation messages.
- UI copy: Hardcoded English strings inside components.
- Formatting: Custom utilities or implicit browser defaults.

## Proposed Architecture

### Folder Layout
```
apps/web/
  src/
    i18n/
      config.ts             # i18next initialization, resource registration, language detection
      index.ts               # export helpers/hooks (useI18n, changeLanguage, supportedLocales)
      constants.ts           # locale codes, storage keys
      formatters.ts          # Intl wrappers (date, number, relative time)
      resources/
        en/
          common.json
          members.json
          songs.json
          arrangements.json
          services.json
          songSets.json
          validation.json
        es/
          common.json
          members.json
          songs.json
          arrangements.json
          services.json
          songSets.json
          validation.json
    routes/
      [lang]/                # language-aware route segment wrapper
        layout.tsx           # reads :lang param, syncs to i18next + localStorage
        index.tsx            # child routes re-exported (no UI changes otherwise)
    providers/
      queryClient.tsx        # inject language into TanStack Query cache key scope if needed
    hooks/
      useLocaleRouter.ts     # helper for pushing translated URLs, reading lang param
    utils/
      axiosClient.ts         # Axios instance with Accept-Language interceptor
```

### Key Decisions
1. **Language as a URL Segment**
   - Use a top-level dynamic segment `/:lang` that wraps existing route configurations via React Router. Example: `/en/members`, `/es/songs`. Benefits: shareable links, crawlable by search engines, easy bookmarking.
   - Implement a language guard component that validates the `:lang` param against supported locales and redirects to default (`en`) when invalid. Store the resolved locale in `localStorage` (`ebal.lang`).
2. **Fallback Language Persistence**
   - On initial load, detect locale in this order: explicit route `:lang`, `localStorage`, browser navigator languages, default to `en`.
   - When the user toggles language (e.g., header dropdown), update the URL via `useNavigate`, update `localStorage`, and trigger i18next `changeLanguage`.
3. **i18next Integration**
   - Use `i18next`, `react-i18next`, and `i18next-browser-languagedetector` (configured to rely on custom detection logic described above). Initialization occurs before React render in `main.tsx`.
   - Split resources into namespaces matching domain feature slices. Use lazy loading via `resources` bundling or dynamic imports for additional languages.
   - Provide typed helper `useAppTranslation(namespace?: string | string[])` returning `t` and `i18n` objects to avoid scattering i18next imports.
4. **Axios Interceptor for Accept-Language**
   - Extend the shared Axios instance to set `Accept-Language` header to the active i18next language on each request. Subscribe to i18next `languageChanged` event to update interceptor state or modify the request interceptor to read from `i18next.language` at call time.
   - Ensure no backend change is required; header piggybacks on existing endpoints.
5. **TanStack Query Integration**
   - Maintain cache keys independent of language unless the API response is language-specific (not expected). Ensure query invalidation is not triggered by locale change by excluding locale from query keys. Only UI formatting uses i18n.
6. **React Hook Form + Zod Localization**
   - Centralize Zod error map using `zod-i18n-map` or custom map referencing `validation` namespace. Call `z.setErrorMap` during app bootstrap after i18next initialization.
   - Use `t` helper inside form components for field labels, placeholders, and inline helper text.
7. **Formatting via Intl**
   - Create wrapper utilities around `Intl.DateTimeFormat`, `Intl.NumberFormat`, and `Intl.ListFormat` within `formatters.ts`. Functions accept a locale (default to active i18next language) and formatting options.
   - Replace component-level formatting logic with these helpers while leaving raw domain data untouched.
8. **Extensibility**
   - Centralize supported locales and metadata (`displayName`, `flagIcon?`) in `constants.ts`. Document process to add new locale: add entry, provide JSON files, update translation pipeline (if any).
9. **Build & Performance Considerations**
   - Use Vite dynamic import for locale JSON to enable code splitting. Evaluate bundling both `en` and `es` eagerly to simplify initial release; revisit for more locales.
   - Configure TypeScript path aliases (`@i18n/*`) if helpful for developer ergonomics.

## Migration Guidelines
1. **Audit Hardcoded Strings**
   - Use `rg "\"[^"]+\"" apps/web/src` to find candidate strings. Prioritize shared layout, navigation, and form components.
2. **Create Translation Keys**
   - Group keys by namespace matching component domain (e.g., `members:list.title`).
   - Add keys to both `en` and `es` JSON files with identical structure. For new locales, copy `en` as the source of truth.
3. **Update Components**
   - Replace hardcoded text with `const { t } = useAppTranslation('members');` and use `t('list.title')`.
   - For dynamic strings, leverage interpolation (`t('greeting', { name })`).
   - Ensure component-level default text is removed to avoid drift.
4. **Forms & Validation**
   - Replace inline Zod error messages with translation keys in `validation` namespace (e.g., `z.string().min(1, { message: 'validation:members.name.required' })`).
   - Update React Hook Form error rendering to pass messages through `t`.
5. **Utilities & Toasts**
   - Externalize copy in utility functions, notifications, and query error handlers.
6. **Verification**
   - Manually toggle locale to confirm translations render and no keys are missing (i18next can log missing keys in development).

## Testing Strategy
- **Unit Tests**
  - Add tests for `i18n/config.ts` to verify supported locales, default language fallback, and storage integration (mock `localStorage`).
  - Test `axiosClient.ts` interceptor ensures `Accept-Language` header equals active language.
  - Test `formatters.ts` functions produce locale-specific outputs for dates and numbers.
  - Component-level tests for representative screens (e.g., Members list) verifying `t` renders localized text and that language route param triggers `changeLanguage`.
  - Zod error map test to ensure validation messages pull from translation keys.
- **Playwright Smoke Tests**
  - Scenario: navigate to `/en/members`, assert English labels; switch language via UI, confirm URL updates to `/es/members`, Accept-Language header is observed via mock API or network assertion, and UI text renders Spanish values.
  - Scenario: direct navigation to `/es/services` loads Spanish resources on initial load.
  - Scenario: invalid locale (e.g., `/fr/...`) redirects to default language while preserving path.

## Acceptance Criteria
- The application routes include a language segment with validation and redirection for unsupported locales.
- Language choice persists across reloads and new tabs (via URL or `localStorage`).
- i18next initializes before React renders; all UI strings reference translation keys across specified namespaces.
- Axios client attaches `Accept-Language` header derived from the active locale with no backend changes.
- Date and number formatting utilities utilize `Intl` with the active language.
- Migration checklist documented and adopted for updated components.
- Unit tests cover i18n utilities, and Playwright smoke suite validates end-to-end language switching.
- Adding a new locale requires only JSON resource creation and constants update—no code restructuring.
