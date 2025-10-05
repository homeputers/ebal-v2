---
title: "Administrar usuarios"
description: "Gestiona cuentas a través de los endpoints de la API de administración sin tocar la base de datos."
sidebar:
  label: "Usuarios admin"
---

# Administrar usuarios

Los endpoints `/api/v1/admin/users` permiten a los administradores gestionar cuentas sin tocar directamente la base de datos. Todas las solicitudes requieren un token bearer con el rol `ADMIN` y utilizan los modelos JSON generados desde `spec/openapi.yaml`.

## Capacidades

- **Buscar y paginar** con filtros opcionales de consulta (`q`), rol y estado de activación.
- **Crear usuarios** con nombre para mostrar, roles explícitos y una contraseña temporal opcional. Los correos se normalizan a minúsculas y deben ser únicos.
- **Leer usuarios individuales** para ver roles, estado de activación y marcas de tiempo.
- **Actualizar usuarios** para cambiar nombres para mostrar, alternar la activación o reemplazar roles.
- **Eliminar usuarios** (eliminación definitiva) cuando esté permitido.
- **Enviar restablecimientos de contraseña** a cuentas existentes, reutilizando el flujo de token de `/auth/forgot-password`.

## Medidas de protección

- La unicidad del correo se refuerza en la base de datos mediante `citext`, por lo que `User@example.com` y `user@example.com` se consideran iguales.
- El bloqueo optimista evita sobrescrituras silenciosas al requerir la versión existente al actualizar registros.
- Intentar eliminar, desactivar o degradar al último administrador devuelve `400 LAST_ADMIN_FORBIDDEN`.
- Desactivar o restablecer un usuario revoca todos los tokens de refresco inmediatamente.
- Los hashes de contraseña nunca salen del servidor; las invitaciones y restablecimientos pasan por la implementación configurada de `EmailSender`.

## Flujos de contraseñas

- Al crear un usuario sin `temporaryPassword`, el servicio genera un valor aleatorio seguro, almacena el hash y envía la contraseña al remitente de correo (la implementación de desarrollo registra el mensaje).
- `POST /admin/users/{id}/reset-password` emite un token nuevo con el mismo TTL que el flujo público de restablecimiento, luego envía un enlace mediante `EmailSender.sendPasswordResetEmail` y revoca los tokens de refresco activos.

## Consejos de recuperación

Si la última cuenta administradora queda bloqueada, puedes promover a un usuario existente directamente en SQL:

```sql
UPDATE users SET is_active = TRUE WHERE email = 'user@example.com';
INSERT INTO user_roles (user_id, role)
SELECT id, 'ADMIN' FROM users WHERE email = 'user@example.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

Después de promoverlo, inicia sesión con esa cuenta y gestiona el resto a través de la API.
