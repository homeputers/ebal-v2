-- Self-service profile features

CREATE EXTENSION IF NOT EXISTS citext;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE TABLE IF NOT EXISTS email_change_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    new_email CITEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_email_change_tokens_token ON email_change_tokens (token);
CREATE UNIQUE INDEX IF NOT EXISTS ux_email_change_tokens_new_email ON email_change_tokens (lower(new_email));
CREATE INDEX IF NOT EXISTS idx_email_change_tokens_user_id ON email_change_tokens (user_id);
