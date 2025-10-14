-- NYC Taxi Trip Database Schema

CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY,
    pickup_datetime TEXT NOT NULL,
    dropoff_datetime TEXT NOT NULL,
    pickup_latitude REAL NOT NULL,
    pickup_longitude REAL NOT NULL,
    dropoff_latitude REAL NOT NULL,
    dropoff_longitude REAL NOT NULL,
    passenger_count INTEGER NOT NULL,
    trip_duration INTEGER NOT NULL,
    trip_distance_km REAL NOT NULL,
    avg_speed_kph REAL,
    pickup_hour INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pickup_datetime ON trips (pickup_datetime);

CREATE INDEX IF NOT EXISTS idx_trip_duration ON trips (trip_duration);

CREATE INDEX IF NOT EXISTS idx_trip_distance ON trips (trip_distance_km);

CREATE INDEX IF NOT EXISTS idx_pickup_hour ON trips (pickup_hour);

CREATE INDEX IF NOT EXISTS idx_pickup_coords ON trips (
    pickup_latitude,
    pickup_longitude
);

CREATE VIEW IF NOT EXISTS trip_stats AS
SELECT
    COUNT(*) as total_trips,
    AVG(trip_duration) as avg_duration_sec,
    AVG(trip_distance_km) as avg_distance_km,
    AVG(avg_speed_kph) as avg_speed_kph,
    AVG(passenger_count) as avg_passengers,
    MIN(pickup_datetime) as earliest_trip,
    MAX(pickup_datetime) as latest_trip
FROM trips;