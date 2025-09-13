-- Initial schema

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE,
    role TEXT
);

-- Members
CREATE TABLE members (
    id UUID PRIMARY KEY,
    display_name TEXT,
    instruments TEXT[]
);

-- Groups
CREATE TABLE groups (
    id UUID PRIMARY KEY,
    name TEXT UNIQUE
);

-- Group Members
CREATE TABLE group_members (
    group_id UUID,
    member_id UUID,
    PRIMARY KEY (group_id, member_id)
);

-- Songs
CREATE TABLE songs (
    id UUID PRIMARY KEY,
    title TEXT,
    ccli TEXT,
    author TEXT,
    default_key TEXT,
    tags TEXT[]
);

-- Arrangements
CREATE TABLE arrangements (
    id UUID PRIMARY KEY,
    song_id UUID,
    key TEXT,
    bpm INT,
    meter TEXT,
    lyrics_chordpro TEXT
);

-- Song Sets
CREATE TABLE song_sets (
    id UUID PRIMARY KEY,
    name TEXT
);

-- Song Set Items
CREATE TABLE song_set_items (
    id UUID PRIMARY KEY,
    song_set_id UUID,
    arrangement_id UUID,
    "order" INT,
    transpose INT,
    capo INT
);

-- Services
CREATE TABLE services (
    id UUID PRIMARY KEY,
    starts_at TIMESTAMPTZ,
    location TEXT
);

-- Service Plan Items
CREATE TABLE service_plan_items (
    id UUID PRIMARY KEY,
    service_id UUID,
    type TEXT,
    ref_id UUID,
    "order" INT,
    notes TEXT
);

-- Foreign keys
ALTER TABLE group_members
    ADD CONSTRAINT fk_group_members_group
    FOREIGN KEY (group_id) REFERENCES groups(id);

ALTER TABLE group_members
    ADD CONSTRAINT fk_group_members_member
    FOREIGN KEY (member_id) REFERENCES members(id);

ALTER TABLE arrangements
    ADD CONSTRAINT fk_arrangements_song
    FOREIGN KEY (song_id) REFERENCES songs(id);

ALTER TABLE song_set_items
    ADD CONSTRAINT fk_song_set_items_song_set
    FOREIGN KEY (song_set_id) REFERENCES song_sets(id);

ALTER TABLE song_set_items
    ADD CONSTRAINT fk_song_set_items_arrangement
    FOREIGN KEY (arrangement_id) REFERENCES arrangements(id);

ALTER TABLE service_plan_items
    ADD CONSTRAINT fk_service_plan_items_service
    FOREIGN KEY (service_id) REFERENCES services(id);
