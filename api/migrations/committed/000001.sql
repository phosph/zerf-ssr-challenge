--! Previous: -
--! Hash: sha1:2707b03cc02092f04afa5dddafb23643fdbb7dcd

-- Enter migration here

-- OLTP
create table charges (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    charge_external_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    amount INTEGER,
    -- currency TEXT,
    status TEXT
);

-- OLAP
CREATE VIEW stats AS
SELECT
    COALESCE(SUM(amount), 0)::INTEGER AS total_tips,
    COALESCE(AVG(amount), 0)::INTEGER AS average_tips,
    COUNT(*)::INTEGER AS charges_count
FROM
    charges
WHERE
    status = 'successful';
