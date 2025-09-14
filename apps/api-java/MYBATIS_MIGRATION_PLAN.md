# MyBatis Migration Plan
<!-- Option A chosen: map Postgres `uuid` and `text[]` columns via custom MyBatis TypeHandlers living under `com.homeputers.ebal2.api.mybatis.typehandler`; services paginate with `OFFSET`/`LIMIT` and compute `totalElements`/`totalPages` from companion count queries. -->

## Goal
Replace Spring Data JPA/Hibernate with MyBatis while preserving the existing REST API contract (OpenAPI), Flyway migrations, and domain models.

## Current JPA Usage
- **Dependencies**: `spring-boot-starter-data-jpa` brings in Hibernate and Spring Data JPA. `application.yaml` sets `spring.jpa.hibernate.ddl-auto` and `open-in-view`.
- **Entities (@Entity)**: `Arrangement`, `Group`, `GroupMember`, `Member`, `Service`, `ServicePlanItem`, `Song`, `SongSet`, `SongSetItem`, `User`.
- **Repositories (JpaRepository)**: `ArrangementRepository`, `GroupRepository`, `GroupMemberRepository`, `MemberRepository`, `ServiceRepository`, `ServicePlanItemRepository`, `SongRepository`, `SongSetRepository`, `SongSetItemRepository`, `UserRepository`.
- **Lazy loading risks**: `Group.members`, `GroupMember.group/member`, `SongSetItem.songSet/arrangement`, `Arrangement.song`, `ServicePlanItem.service` rely on JPA-managed relationships and may trigger `LazyInitializationException` when mapped to DTOs.
- **Hibernate-specific features**: `@JdbcTypeCode(SqlTypes.ARRAY)` for Postgres array columns in `Member` and `Song`; `Song` implements `Persistable` with lifecycle callbacks.

## Migration Approach
1. **Dependencies & Config**
   - Remove `spring-boot-starter-data-jpa` and related Hibernate artifacts from `pom.xml`.
   - Add `mybatis-spring-boot-starter` and `mybatis-spring-boot-starter-test` (for future tests).
   - Drop `spring.jpa.*` entries in `application.yaml`; optionally add `mybatis.configuration.map-underscore-to-camel-case=true`.
   - Retain Flyway dependency and existing migrations.

2. **Domain Models**
   - Remove JPA annotations (`@Entity`, `@Table`, `@Id`, relationship annotations, `@JdbcTypeCode`, lifecycle methods) from domain records.
   - Keep the record structure and constructors; `UUID` and array (`List<String>`) fields use custom MyBatis `TypeHandler`s for `uuid` and `text[]` columns.

3. **MyBatis Mappers**
   - For each former `*Repository`, create a MyBatis mapper interface in `com.homeputers.ebal2.api.domain.<entity>` annotated with `@Mapper`.
   - Supply SQL via XML mapper files under `src/main/resources/mappers/` (one `<entity>Mapper.xml` per table).
   - Example structure:
     - `MemberMapper.java` / `MemberMapper.xml`
     - `GroupMapper.java` / `GroupMapper.xml`
     - ... (repeat for all repositories)
   - Queries will cover CRUD operations and any custom lookups (e.g., `Member` search uses `ILIKE` on `display_name`).
   - Pagination: methods accept `limit`/`offset` parameters with companion `count` queries so services can compute `totalElements` and `totalPages`.
   - Relationship loading: explicit joins or dedicated queries. For example, `GroupMapper` includes a query to fetch member IDs by group; `SongSetItemMapper` joins `arrangements` and `song_sets` as needed.

4. **Services**
   - Replace injected `JpaRepository` dependencies with the new mapper interfaces.
   - Adjust service methods to handle manual `UUID` generation and pagination using mapper queries.
   - Where controllers currently rely on lazily loaded collections (e.g., `group.members()`), call mapper methods to fetch child records eagerly.

5. **Controllers & DTOs**
   - No changes to controller signatures or DTO classes. Mappers continue to convert between domain records and generated OpenAPI models.

6. **Bootstrapping & Tests**
   - Flyway continues to run on startup; no schema changes in this phase.
   - Update integration tests (when added) to use MyBatis and verify mapper SQL.

## Files/Classes to Touch
- `apps/api-java/pom.xml`
- `apps/api-java/src/main/resources/application.yaml`
- All domain model files under `apps/api-java/src/main/java/com/homeputers/ebal2/api/domain/**`
- Replace each `*Repository.java` with corresponding `*Mapper.java` and add matching XML mapper files under `src/main/resources/mappers/`
- Service classes under `apps/api-java/src/main/java/com/homeputers/ebal2/api/*/` to swap repository usage for mapper usage.

## Open Questions / Notes
- Determine whether to keep domain records or convert to classes for easier MyBatis mapping (records are supported but may need explicit result mappings).
- Decide on using XML vs. annotation-based SQL; plan assumes XML for flexibility.
- Evaluate a `Page` utility to mirror Spring Data's `Page` object without pulling in Spring Data JPA.
