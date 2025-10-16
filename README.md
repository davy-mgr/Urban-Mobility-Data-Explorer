# Urban Mobility Data Explorer

Full‑stack application to explore NYC taxi trip patterns. The backend cleans and loads raw trip data into a SQLite database, serving analytics APIs; the frontend provides filters, summary statistics, and visualizations.

Frontend: Vite + vanilla JS + Chart.js. 
Backend: Node.js + Express + better‑sqlite3.

## Prerequisites

- Docker and Docker Compose (recommended), or Node.js 20+ for local dev.
- NYC Taxi Trip Duration dataset `train.csv` (from Kaggle competition `nyc-taxi-trip-duration`).

## Quick Start (Docker Compose)  

1) Place the dataset at `backend/src/data/raw/train.csv`

```bash
# Example using Kaggle CLI
kaggle competitions download -c nyc-taxi-trip-duration
unzip nyc-taxi-trip-duration.zip train.csv -d backend/src/data/raw/
```

2) Build and start services

```bash
docker compose build
docker compose up -d
```

Backend: http://localhost:3001

Frontend: http://localhost:5173

3) Load data into the database

```bash
# POST triggers data cleaning and batch inserts
curl -X POST http://localhost:3001/api/data/load
```

If your CSV is in a non‑default path, set `DATA_RAW_PATH` (see Environment below) before starting or when composing.

4) Verify

```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/stats
curl "http://localhost:3001/api/trips?limit=5"
```

Open the dashboard at http://localhost:5173 and use the filters to explore data.

## Local Development (without Docker)

Backend

```bash
cd backend
npm install

# Optional: set envs
export PORT=3001
export DB_PATH="$(pwd)/data/trips.db"
export DATA_RAW_PATH="$(pwd)/src/data/raw/train.csv"

npm run dev
```

Frontend (in a second terminal)

```bash
cd frontend
npm install
npm run dev
# Vite serves on http://localhost:5173
```

## Environment

- `PORT` (backend): default `3001`.
- `DB_PATH` (backend): path to SQLite DB; default `backend/src/data/trips.db` (in Docker: `/app/data/trips.db`).
- `DATA_RAW_PATH` (backend): path to raw `train.csv`; default `backend/src/data/raw/train.csv` (in Docker: `/app/src/data/raw/train.csv`).
- `NODE_ENV`: `development` for verbose logs.

Docker Compose sets these in `docker-compose.yml`.

## API Reference

Base URL: `http://localhost:3001/api`

- `POST /data/load`
  - Loads CSV from `DATA_RAW_PATH`,
  - Response: `{ success, message, stats: { total, kept, excluded, inserted } }`.

- `DELETE /data/clear`
  - Deletes all rows from `trips`.
  - Response: `{ success, message, deletedCount }`.

- `GET /trips`
  - Query params: `page`, `limit` (<=1000), `sortBy` (`pickup_datetime|trip_duration|trip_distance_km|avg_speed_kph|passenger_count`), `sortOrder` (`ASC|DESC`).
  - Filters (all optional): `startDate`, `endDate` (ISO date/time), `minDuration`, `maxDuration` (seconds), `minDistance`, `maxDistance` (km), `pickupHour` (0–23), `passengerCount` (int), `minPassengers` (int).
  - Response: `{ data: [...], pagination: { page, limit, total, totalPages }, filters }`.

- `GET /trips/:id`
  - Response: `{ data: {...} }` or 404 NOT FOUND.

- `GET /stats`
  - Same filters as `/trips`.
  - Response: `{ stats: { total_trips, avg_duration_sec, avg_distance_km, avg_speed_kph, avg_passengers, min_duration, max_duration, min_distance, max_distance, earliest_trip, latest_trip }, hourlyDistribution: [{ pickup_hour, count }], filters }`.

- `GET /stats/duration-distribution?bucketSize=300`
  - Filters + `bucketSize` seconds (default 300 = 5 min).
  - Response: `{ distribution: [{ bucket, count, bucket_min }], bucketSize, filters }`.

- `GET /stats/distance-distribution?bucketSize=2`
  - Filters + `bucketSize` km (default 2).
  - Response: `{ distribution: [{ bucket, count, bucket_min }], bucketSize, filters }`.

- `GET /stats/speed-distribution?bucketSize=5`
  - Filters + `bucketSize` km/h (default 5). Ignores null speeds.
  - Response: `{ distribution: [{ bucket, count, bucket_min }], bucketSize, filters }`.

- `GET /health`
  - Health check.

Examples

```bash
# Trips between 5–20 km, pickup hour = 8am, limit 10
curl "http://localhost:3001/api/trips?minDistance=5&maxDistance=20&pickupHour=8&limit=10"

# Aggregate stats for trips under 30 minutes
curl "http://localhost:3001/api/stats?maxDuration=1800"

# Speed histogram with 10 km/h buckets for 1–2 passengers
curl "http://localhost:3001/api/stats/speed-distribution?bucketSize=10&minPassengers=1&passengerCount=2"
```

## Data Pipeline (Cleaning + Features)

Cleaning (`backend/src/processing/cleanData.js`)

- Normalizes timestamps to UTC ISO (see `backend/src/utils/time.js`).
- Validates NYC bounding‑box coordinates (see `backend/src/utils/geo.js`).
- Keeps trips with duration between 30 seconds and 3 hours; passenger count > 0.
- Logs excluded/suspicious rows to `backend/src/data/logs/cleaning.log`.

Batch load (`backend/src/services/dataLoader.js`)

- Streams the CSV, buffers `BATCH_SIZE=1000`, inserts via transaction using better‑sqlite3.
- Schema and indexes are applied at startup from `database/schema.sql`.

## Database

- Engine: SQLite (file path via `DB_PATH`).
- Primary table: `trips` with indexes on datetime, duration, distance, hour, passengers.
- View: `trip_stats` for common aggregates.

Inspect DB with sqlite3

```bash
sqlite3 backend/data/trips.db 
sqlite> .schema trips
sqlite> SELECT COUNT(*) FROM trips;
```

## Frontend UI

- Filters: start/end date, min/max duration (sec), min/max distance (km), pickup hour, passenger count.
- Stats: total trips, average duration, distance, speed, passengers.
- Charts: trips by hour, duration histogram, distance histogram, speed histogram.
- Loading and error states are handled; API base is `http://localhost:3001/api`.

Run locally: `npm run dev` from `frontend` then open http://localhost:5173.

Video walkthrough:

## Notes

- Code references:
  - Backend routes: `backend/src/routes/trips.js` (endpoints and filters).
  - Server mount and health: `backend/src/index.js`.
  - Trip model queries: `backend/src/models/Trip.js`.
  - Schema and indexes: `database/schema.sql`.
## Contributors
- [Davy Mugire](https://github.com/davy-mgr)
- [Nazira Umucyo](https://github.com/Nazira-umucyo)
- [Queen Sheja Linda](https://github.com/Queenlinda12)
- [UWENAYO Alain Pacifique](https://github.com/uwenayoallain)
- [Allan Tumusime](https://github.com/0Allan1)
