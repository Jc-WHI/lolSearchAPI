-- SQLite
create table if not exists users(
    puuid TEXT PRIMARY KEY,
    riotid TEXT NOT NULL,
    tag TEXT NOT NULL,
    last_crawled_at TEXT
);