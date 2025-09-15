-- Indexes to improve search
CREATE INDEX IF NOT EXISTS idx_members_display_name ON members (display_name);
CREATE INDEX IF NOT EXISTS idx_songs_title ON songs (title);
CREATE INDEX IF NOT EXISTS idx_songs_tags ON songs USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_services_starts_at ON services (starts_at);
