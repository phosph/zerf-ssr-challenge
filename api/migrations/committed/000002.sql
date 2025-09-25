--! Previous: sha1:e2a7b88f28198c7ebceba12f3c0bba32f03d8543
--! Hash: sha1:919ccb7fc80fe95ed8f48827bc9497262926f1a3

-- Enter migration here
create table events (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    event_external_id TEXT UNIQUE,
    is_span Boolean DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    event_type TEXT,
    payload JSONB
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
