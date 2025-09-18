-- Share tokens for read-only access
CREATE TABLE share_tokens (
    token TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    label TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_share_tokens_type ON share_tokens(type);
