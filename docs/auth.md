# Authentication & Authorization

This document covers how authentication is configured, which roles can access specific APIs, and how to verify session flows end-to-end.

## Environment configuration

Backend and email settings are driven by the following environment variables (see `application.yaml`):

| Purpose | Variable(s) | Default |
| --- | --- | --- |
| Enable/disable the security filter chain | `EBAL_SECURITY_ENABLED` | `true` |
| Allowed web origins for CORS | `EBAL_WEB_ORIGIN_DEV`, `EBAL_WEB_ORIGIN_PROD` | `http://localhost:5173`, `https://app.ebal.church` |
| JWT signing secret (min 64 chars) | `EBAL_JWT_SECRET` | Development-only random string |
| Access token lifetime | `EBAL_JWT_ACCESS_TTL` | `PT15M` |
| Refresh token lifetime | `EBAL_JWT_REFRESH_TTL` | `P30D` |
| Password reset token lifetime | `EBAL_PASSWORD_RESET_TTL` | `PT1H` |
| Login rate limiting (max attempts / window) | `EBAL_SECURITY_LOGIN_RATE_LIMIT_MAX`, `EBAL_SECURITY_LOGIN_RATE_LIMIT_WINDOW` | `10`, `PT1M` |
| Forgot-password rate limiting | `EBAL_SECURITY_FORGOT_RATE_LIMIT_MAX`, `EBAL_SECURITY_FORGOT_RATE_LIMIT_WINDOW` | `5`, `PT15M` |
| Frontend base URL used in reset links | `FRONTEND_BASE_URL` | `http://localhost:5173` |
| SMTP enable flag and host credentials | `EBAL_MAIL_SMTP_ENABLED`, `EBAL_MAIL_SMTP_HOST`, `EBAL_MAIL_SMTP_PORT`, `EBAL_MAIL_SMTP_USERNAME`, `EBAL_MAIL_SMTP_PASSWORD`, `EBAL_MAIL_SMTP_STARTTLS`, `EBAL_MAIL_SMTP_AUTH`, `EBAL_MAIL_FROM` | Disabled with sensible defaults |

Set `EBAL_SECURITY_ENABLED=false` to bypass auth entirely in local experiments. When SMTP is disabled, forgot-password requests are accepted but no emails are sent.

## Default admin seeding

When `EBAL_SEED_ENABLED=true`, the application boots an admin seeder. It creates or reactivates an administrator using:

- Email: `EBAL_SEED_ADMIN_EMAIL` (default `admin@example.com`)
- Password: `EBAL_SEED_ADMIN_PASSWORD` (default `ChangeMe123!`)

If the user already exists, the seeder ensures the account is active and grants the `ADMIN` role.

## Role capabilities

Access control is enforced in `SecurityConfig`. The matrix below summarizes which HTTP methods are permitted per role:

| Endpoint group | Admin | Planner | Musician | Viewer |
| --- | --- | --- | --- | --- |
| `/api/v1/admin/**` (all methods) | ✅ | ❌ | ❌ | ❌ |
| `/api/v1/auth/change-password` | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/me/**` (self-service) | ✅ | ✅ | ✅ | ✅ |
| Domain reads (`GET` on members, groups, songs, services, song sets, plan items, search) | ✅ | ✅ | ✅ | ✅ |
| Domain mutations (`POST`, `PUT`, `PATCH`, `DELETE` on the endpoints above) | ✅ | ✅ | ❌ | ❌ |
| Public unauthenticated endpoints (`/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/auth/forgot-password`, `/api/v1/auth/reset-password`, `/api/v1/health`, `/api/v1/services/ical`, `/api/v1/storage/health`, Swagger) | Anyone |

Session behaviour highlights:

- Refresh tokens are rotated on every `/auth/refresh` call. A reused or revoked refresh token is rejected.
- Password changes and successful password resets revoke all outstanding refresh tokens for the user, forcing new logins on other sessions.
- Expired or malformed password-reset tokens are rejected before any password update occurs.

## Manual verification checklist

Use the following checklist when validating environments or releases:

- [ ] Start with a fresh database: default admin should seed, login succeeds with seeded credentials.
- [ ] Planner user can authenticate but receives HTTP 403 when visiting `/admin/*` routes.
- [ ] Musician user can sign in and view assigned plans (GET endpoints) but cannot mutate planning data.
- [ ] Viewer user only sees published plans (GET endpoints) and cannot create or edit planning data.
- [ ] Forgot/reset password flow invalidates existing sessions (refresh tokens no longer work).
- [ ] Changing a password via `/auth/change-password` invalidates other sessions for that user.
- [ ] Refresh tokens rotate while valid and stop working immediately after revocation.

## Promote a user to admin via SQL

If all admins are locked out, promote another account directly in PostgreSQL:

```sql
-- Replace with the email that should become admin
WITH target AS (
  SELECT id
  FROM users
  WHERE email = lower('user@example.com')
)
UPDATE users
SET is_active = TRUE,
    updated_at = now()
WHERE id IN (SELECT id FROM target);

INSERT INTO user_roles (user_id, role, created_at)
SELECT id, 'ADMIN', now()
FROM target
ON CONFLICT (user_id, role) DO NOTHING;
```

After running the statements, the promoted user can log in (or request a password reset) and access `/api/v1/admin/**` endpoints immediately.
