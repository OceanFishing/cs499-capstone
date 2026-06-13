-- Travlr Getaways schema (Enhancement 3). Target: PostgreSQL 18.

-- Drop the child table first so the script can be re-run without FK errors.
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    email       TEXT        NOT NULL UNIQUE,
    name        TEXT        NOT NULL,
    hash        TEXT        NOT NULL,
    salt        TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE trips (
    id          SERIAL        PRIMARY KEY,
    code        TEXT          NOT NULL UNIQUE,   -- natural key; used for trip lookups
    name        TEXT          NOT NULL,
    length      TEXT          NOT NULL,
    start       DATE          NOT NULL,
    resort      TEXT          NOT NULL,
    per_person  NUMERIC(10,2) NOT NULL,          -- NUMERIC so currency values stay exact
    image       TEXT          NOT NULL,
    description TEXT          NOT NULL
);

-- No UNIQUE on (user_id, trip_id) so a trip can be booked more than once.
CREATE TABLE bookings (
    id            SERIAL  PRIMARY KEY,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trip_id       INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    num_travelers INTEGER NOT NULL DEFAULT 1 CHECK (num_travelers > 0),
    booking_date  DATE    NOT NULL DEFAULT CURRENT_DATE
);

-- FK columns are not auto-indexed; these back the booking joins.
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_trip_id ON bookings(trip_id);