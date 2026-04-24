-- Reference schema for tekkitutka database.
-- Actual schema is managed by Kysely migrations in src/db/migrations/.

CREATE TABLE quadrant (
    id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE ring (
    id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE tech (
    id SERIAL NOT NULL,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NULL,
    url VARCHAR(255) NULL,
    quadrant INTEGER NOT NULL REFERENCES quadrant(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
);

CREATE TABLE radar (
    id SERIAL NOT NULL,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
);

CREATE TABLE blip (
    id SERIAL NOT NULL,
    tech_id INTEGER NOT NULL REFERENCES tech(id),
    radar_id INTEGER NOT NULL REFERENCES radar(id),
    ring INTEGER NOT NULL REFERENCES ring(id),
    UNIQUE(tech_id, radar_id),
    PRIMARY KEY(id)
);

