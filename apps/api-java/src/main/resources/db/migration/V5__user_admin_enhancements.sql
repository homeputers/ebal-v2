-- User administration enhancements

CREATE EXTENSION IF NOT EXISTS citext;

ALTER TABLE users
    ALTER COLUMN email TYPE citext USING email::citext,
    ALTER COLUMN email SET NOT NULL;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS display_name TEXT;

UPDATE users
SET display_name = COALESCE(NULLIF(trim(display_name), ''), email)
WHERE display_name IS NULL OR display_name = '' OR display_name <> trim(display_name);

ALTER TABLE users
    ALTER COLUMN display_name SET NOT NULL;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 0;

ALTER TABLE users
    ALTER COLUMN updated_at SET DEFAULT now();

DROP INDEX IF EXISTS idx_users_email_lower;
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_display_name_lower ON users (lower(display_name));
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users (is_active);
