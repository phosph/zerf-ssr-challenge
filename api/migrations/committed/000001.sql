--! Previous: -
--! Hash: sha1:feda3ebb07309da74d9b17bae07cbde4796622c1

-- Enter migration here

-- OLTP
create table charges (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    charge_external_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    amount INTEGER,
    status TEXT
);
