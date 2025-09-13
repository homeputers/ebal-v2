# AGENTS.md

**Project:** Every Breath And Life (ebal) — worship planning tool  
**Monorepo:** mixed tech (React/Vite + Spring Boot 3)  
**Primary goals for agents:** keep v2 lean, parity with v1 features, future-proof for auth/attachments, API first design changes with OpenAPI 3.0 spec definition.

---

## 1) Repository Contract

**Directory layout**
```
/apps/web          # React 18 + Vite + TypeScript
/apps/api-java     # Spring Boot 3 (Maven), PostgreSQL, Flyway
/packages/config   # shared eslint/prettier/tsconfig for web
/packages/types    # shared TS types (generated or hand-written)
/infra             # docker-compose, Makefiles, ops scripts
/docs              # runbooks, architecture, ADRs (optional)
/.github           # CI workflows, PR templates
```

**Tech choices**
- **API:** Spring Boot 3, Java 21, Spring Data JPA, Flyway, PostgreSQL, OpenAPI 3.0 spec.
- **Web:** React 18, Vite, React Router, TanStack Query, Tailwind, RHF + Zod.
- **Auth:** disabled by default; prepared for OIDC later.
- **Attachments:** disabled by default; prepared for MinIO/S3 later.
- **Observability:** optional OpenTelemetry flag.

**Feature flags (application.yaml or env)**
- `ebal.security.enabled=false` (allow all)
- `ebal.storage.enabled=false` (attachments off)
- `ebal.otel.enabled=false` (tracing off)
- `ebal.seed.enabled=false` (DB seed off)

---

## 2) Agent Operating Procedure (AOP)

1. **Read context**
   - Inspect changed files + referenced modules.
   - Check flags and environment assumptions in `/apps/api-java/src/main/resources/application.yaml` and `/infra/docker-compose.yaml`.

2. **Plan**
   - Propose a short plan (bulleted) before edits: files to create/modify, endpoints, UI routes, tests.

3. **Implement small, vertical slices**
   - Prefer end-to-end vertical changes (DB → API → Web) behind feature flags or toggles.
   - Keep PRs under ~500 lines when possible.
   - Perform any API changes from the spec file in `/spec/openapi.yaml`, then run generator to get implementation classes for controllers, and any request/response DTO objects.

4. **Validate**
   - **API:** compile, run Flyway, pass tests, open `/v3/api-docs`.
   - **Web:** build passes, typecheck passes, basic manual navigation OK.

5. **Update docs**
   - If public endpoints or user flows change, update `/README.md` and/or `/docs/*`.

6. **Commit**
   - Conventional commits; see §7.

**Definition of Done (DoD)**
- Code compiles; lint/typecheck clean.
- DB migrations idempotent; reversible if feasible.
- API has validation, pagination where applicable, and OpenAPI spec changes.
- UI has loading/error states and basic a11y.
- Unit/E2E happy path exists for at least one representative path.
- Docs: minimal usage note added.

---

## 3) Local Dev Routines (agents should run as needed)

**Bring up infra**
```bash
cd infra && make up     # starts postgres (and optional api/web if configured)
make logs               # follow containers
make down               # stop
```

**Run API**
```bash
cd apps/api-java
./mvnw -q -DskipTests=false verify
./mvnw spring-boot:run
```

**Run Web**
```bash
cd apps/web
yarn install
yarn dev
# API base URL via VITE_API_URL; default http://localhost:8080
```

**Generate Web API types (if configured)**
```bash
cd apps/web
yarn generate:api   # pulls from http://localhost:8080/v3/api-docs to src/api/types.d.ts
```

---

## 4) Data & Domain Rules

**Core entities**
- `Member` (displayName, instruments[])
- `Group` (name) with `GroupMember(groupId, memberId)`
- `Song` (title, ccli?, author?, defaultKey?, tags[])
- `Arrangement` (songId, key, bpm?, meter?, lyricsChordPro)
- `SongSet` + `SongSetItem` (arrangementId, order, transpose?, capo?)
- `Service` (startsAt, location?) + `ServicePlanItem` (type: song|reading|note, refId?, order, notes?)

**DB**
- PostgreSQL via Flyway migrations in `/apps/api-java/src/main/resources/db/migration`.
- Prefer explicit FKs, unique constraints, and indexes for frequent lookup fields.
- Use `uuid` for ids. Use `ILIKE` for simple search. Trigram is allowed if needed.

**API style**
- REST, JSON, versioned under `/api/v1/*`.
- Pagination: `?page=0&size=20`.
- Validation: Bean Validation annotations; return RFC-7807 style errors.
- OpenAPI: spec definitions under `/spec/openapi.yaml`; Swagger UI should list all endpoints.

---

## 5) Web App Rules

- Keep routes under: `/members`, `/groups`, `/songs`, `/song-sets`, `/services`.
- State via TanStack Query; forms via RHF+Zod.
- Provide search (debounced) on list screens.
- Provide sensible empty states, loading spinners, and error toasts.
- Print views for chord sheets and service plans must be CSS-printable (A4/Letter).

---

## 6) Security, Attachments, and Seeds (paved paths)

**Security (off by default)**
- If enabled, secure `/api/**` with session or OIDC.
- Provide `/me` endpoint; anonymous when disabled.

**Attachments (off by default)**
- StorageService interface + MinIO impl behind `ebal.storage.enabled`.
- When off, endpoints must not be exposed.

**Seeds**
- When `ebal.seed.enabled=true`, create demo members, groups, songs, sets, and one service.

**Telemetry (optional)**
- If `ebal.otel.enabled=true`, export OTLP; otherwise keep a no-op.

---

## 7) Conventions

**Conventional commits**
- `feat(api): add arrangements search by key`
- `feat(web): song set drag/drop reorder`
- `fix(api): validate bpm range`
- `chore(infra): add backup script`
- `docs: update plan print view`

**Naming**
- Java packages: `com.homeputers.ebal2.api.<module>`
- Controllers end with `Controller`, services with `Service`, repos with `Repository`.
- React components: `PascalCase.tsx`; hooks: `useThing.ts`.

**Testing**
- **API:** Spring Boot tests; prefer Testcontainers for Postgres.
- **Web:** component tests where logic is non-trivial; at least smoke tests for pages.

**Lint/format**
- Web uses shared configs from `/packages/config`.
- API uses default Maven plugins; keep spotless/formatter if configured.

---

## 8) Safe Change Patterns

Agents MUST:
- **Add Flyway migrations** for DB changes instead of altering existing ones (except before first release).
- **Guard new features** behind flags when incomplete.
- **Keep endpoints backwards-compatible** within `v1` once published.
- **Avoid** committing `.env`, secrets, `node_modules`, `target`, or build artifacts.

Agents SHOULD:
- Prefer small PRs with clear DoD.
- Add minimal docs for new endpoints/routes.
- Update OpenAPI and regenerate web types when API changes.

---

## 9) Task Taxonomy & Acceptance Criteria

**API: new resource**
- Migration created and applied.
- Spec changes performed in `/spec/openapi.yaml`
- Entity + Repository + Service + Controller.
- DTOs + validation.
- Happy-path test passes; `/v3/api-docs` updated.

**Web: new screen**
- Route registered; lazy loaded if large.
- Data fetching via typed client; loading/error states.
- Form validation (Zod) and optimistic updates when safe.
- a11y checks (labels, focus trap in dialogs).
- Print view updated if relevant.

**Infra: compose/k8s**
- Compose services build locally.
- Clear env var documentation in `/README.md`.
- Scripts/Make targets added/updated.

---

## 10) Ready-to-Use Prompts for Agents

> Use these as “system tasks” to guide Codex on common changes.

**Add a new endpoint (API)**
```
Goal: Add GET /api/v1/songs/search?query=...&tag=...
Steps:
0) Perform appropriate modifications in `/spec/openapi.yaml` OpenAPI 3.0 spec file
1) Run `mvnw generate-sources`
2) Create a Spring MVC handler in SongsController.
3) Validate inputs, default page/size.
4) Service method uses repository with ILIKE on title and tag filter.
5) Add a Spring Boot test covering query + tag.
Acceptance:
- mvn verify passes.
- /v3/api-docs shows the new endpoint.
```

**Wire the endpoint to the web list**
```
Goal: Consume /api/v1/songs/search in /apps/web
Steps:
1) Add songs.search() wrapper in src/api/songs.ts (axios).
2) Create a controlled search input with debounce 300ms in /songs.
3) Show results in a table with title, defaultKey, tags.
4) Handle loading/error states.
5) Add a basic test for the search component if present.
Acceptance:
- yarn build/typecheck pass.
- Searching updates the list.
```

**Add a migration + entity**
```
Goal: Add 'tempo' (int, nullable) to arrangements.
Steps:
1) New Flyway migration VXX__arrangements_add_tempo.sql (ALTER TABLE).
2) Update Arrangement entity + DTOs + mapper.
3) Accept 'tempo' in create/update endpoints with range [30..300].
4) Add tests to validate min/max constraint.
Acceptance:
- mvn verify passes; API accepts tempo and returns it in responses.
```

**Create printable plan view**
```
Goal: Print-friendly plan page for /services/:id/print
Steps:
1) Add route + component; fetch service + plan items.
2) CSS @media print: hide nav/buttons; page breaks between sections.
3) Add 'Print' button calling window.print().
Acceptance:
- Print preview shows clean layout without UI chrome.
```

**Prepare (but disable) attachments**
```
Goal: Pave storage feature behind flag.
Steps:
1) Add StorageService and MinioStorageService with @ConditionalOnProperty ebal.storage.enabled=true.
2) Add properties placeholders in application.yaml; no controller yet.
3) Add unit test for bean conditional.
Acceptance:
- Default run has no storage beans; enabling flag wires MinIO.
```

---

## 11) Environment & Variables

**API (env or `application.yaml`)**
- `SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/ebal`
- `SPRING_DATASOURCE_USERNAME=ebal`
- `SPRING_DATASOURCE_PASSWORD=ebal`
- `SERVER_PORT=8080`
- `EBAL_*` flags listed above

**Web**
- `VITE_API_URL=http://localhost:8080`

**Compose (`/infra/docker-compose.yaml`)**
- Provides Postgres and optional api/web services.

---

## 12) PR Checklist (agents copy this into PR body)

- [ ] Lints & tests pass: API (`mvn verify`), Web (`yarn build && tsc -p .`)
- [ ] DB: New Flyway migration added (if schema changed)
- [ ] API: OpenAPI spec updated; generated new sources
- [ ] Web: Loading/error states; basic a11y; responsive layout
- [ ] Feature flags respected (`ebal.*`)
- [ ] Docs updated (`README.md` or `/docs/*`)

---

## 13) Non-Goals (for now)

- Multi-tenancy, heavy auth flows, external payment APIs.
- Binary attachments or media processing (behind flag only).
- Realtime presence/editing unless explicitly requested.

---

**Agents:** follow this guide to keep changes coherent, reversible, and easy to review. When unsure, propose a brief plan in the PR description before implementing.
