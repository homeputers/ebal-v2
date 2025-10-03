---
title: "Administrar usuarios"
description: "Gestiona cuentas a través de los endpoints de la API de administración sin tocar la base de datos."
sidebar:
  label: "Usuarios admin"
---
> TODO: Traducir el contenido restante al español.

# Administering Users

The `/api/v1/admin/users` endpoints allow administrators to manage accounts without touching the database directly. All requests require a bearer token with the `ADMIN` role and use the JSON models generated from `spec/openapi.yaml`.

## Capabilities

- **Search and paginate** with optional query (`q`), role, and activation filters.
- **Create users** with a display name, explicit roles, and an optional temporary password. Emails are normalized to lowercase and must be unique.
- **Read single users** to view roles, activation state, and timestamps.
- **Update users** to change display names, toggle activation, or replace roles.
- **Delete users** (hard delete) when allowed.
- **Send password resets** to existing accounts, reusing the same reset token workflow as `/auth/forgot-password`.

## Safeguards

- Email uniqueness is enforced in the database using `citext`, so `User@example.com` and `user@example.com` are considered the same.
- Optimistic locking prevents silent overwrites by requiring the existing version when updating records.
- Attempts to delete, deactivate, or demote the last administrator return `400 LAST_ADMIN_FORBIDDEN`.
- Deactivating or resetting a user revokes all refresh tokens immediately.
- Password hashes never leave the server; invitations and resets go through the configured `EmailSender` implementation.

## Password Workflows

- When creating a user without a `temporaryPassword`, the service generates a secure random value, stores the hash, and passes the password to the email sender (the dev implementation logs the message).
- `POST /admin/users/{id}/reset-password` issues a new token using the same TTL as the public reset flow, then sends a reset link via `EmailSender.sendPasswordResetEmail` and revokes active refresh tokens.

## Recovery Tips

If the last admin account becomes locked, you can promote an existing user directly in SQL:

```sql
UPDATE users SET is_active = TRUE WHERE email = 'user@example.com';
INSERT INTO user_roles (user_id, role)
SELECT id, 'ADMIN' FROM users WHERE email = 'user@example.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

After promoting, log in with that account and manage the rest through the API.
