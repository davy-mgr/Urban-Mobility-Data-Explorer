# Urban Mobility Data Explorer

## Dataset Setup

Download the NYC Taxi Trip Duration dataset:

```bash
kaggle competitions download -c nyc-taxi-trip-duration
unzip nyc-taxi-trip-duration.zip -d backend/src/data/raw/
```

## Quick Start

```bash
git clone https://github.com/davy-mgr/Urban-Mobility-Data-Explorer.git
cd Urban-Mobility-Data-Explorer

# Build services
docker compose build
# Start services
docker compose up -d

# Load data
curl -X POST http://localhost:3001/api/data/load

# View trips
curl http://localhost:3001/api/trips
```

## API Endpoints

| Method | Endpoint          | Description            |
| ------ | ----------------- | ---------------------- |
| POST   | `/api/data/load`  | Load and process data  |
| DELETE | `/api/data/clear` | Clear all data         |
| GET    | `/api/trips`      | List trips (paginated) |
| GET    | `/api/trips/:id`  | Get single trip        |
| GET    | `/api/stats`      | Aggregate statistics   |
| GET    | `/health`         | Health check           |

## Features

- **Data Cleaning**: Validates coordinates, trip duration, passenger count
- **Feature Engineering**: Calculates distance, speed, pickup hour
- **Batch Processing**: Streams 1.4M+ records with batch inserts

## Development

Backend runs on port 3001 with hot reload enabled. Logs show progress every 10k records processed while loading data.
