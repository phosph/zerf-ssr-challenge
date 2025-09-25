--! Previous: -
--! Hash: sha1:e2a7b88f28198c7ebceba12f3c0bba32f03d8543

-- Enter migration here

-- OLTP
create table charges (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    charge_external_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    amount INTEGER,
    payment_type TEXT,
    status TEXT
);
