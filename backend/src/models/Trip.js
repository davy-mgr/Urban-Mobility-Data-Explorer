import { getDatabase } from "../config/db.js";


function buildWhereClause(filters) {
	const conditions = [];
	const params = [];

	if (filters.minDuration) {
		conditions.push("trip_duration >= ?");
		params.push(parseInt(filters.minDuration));
	}
	if (filters.maxDuration) {
		conditions.push("trip_duration <= ?");
		params.push(parseInt(filters.maxDuration));
	}
	if (filters.minDistance) {
		conditions.push("trip_distance_km >= ?");
		params.push(parseFloat(filters.minDistance));
	}
	if (filters.maxDistance) {
		conditions.push("trip_distance_km <= ?");
		params.push(parseFloat(filters.maxDistance));
	}
	if (filters.pickupHour !== undefined) {
		conditions.push("pickup_hour = ?");
		params.push(parseInt(filters.pickupHour));
	}
	if (filters.minPassengers) {
		conditions.push("passenger_count >= ?");
		params.push(parseInt(filters.minPassengers));
	}
	if (filters.passengerCount) {
		conditions.push("passenger_count = ?");
		params.push(parseInt(filters.passengerCount));
	}
	if (filters.startDate) {
		conditions.push("pickup_datetime >= ?");
		params.push(filters.startDate);
	}
	if (filters.endDate) {
		conditions.push("pickup_datetime <= ?");
		params.push(filters.endDate);
	}

	const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
	return { where, params };
}

export function findAll(options = {}) {
	const db = getDatabase();
	const { filters = {}, page = 1, limit = 100, sortBy = "pickup_datetime", sortOrder = "DESC" } = options;

	const { where, params } = buildWhereClause(filters);

	const validSortFields = ["pickup_datetime", "trip_duration", "trip_distance_km", "avg_speed_kph", "passenger_count"];
	const validSortOrders = ["ASC", "DESC"];

	const safeSortBy = validSortFields.includes(sortBy) ? sortBy : "pickup_datetime";
	const safeSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : "DESC";

	const offset = (page - 1) * limit;

	const query = `
		SELECT * FROM trips
		${where}
		ORDER BY ${safeSortBy} ${safeSortOrder}
		LIMIT ? OFFSET ?
	`;

	const stmt = db.prepare(query);
	const trips = stmt.all(...params, limit, offset);

	return trips;
}

export function findById(id) {
	const db = getDatabase();
	const stmt = db.prepare("SELECT * FROM trips WHERE id = ?");
	return stmt.get(id);
}

export function count(filters = {}) {
	const db = getDatabase();
	const { where, params } = buildWhereClause(filters);

	const query = `SELECT COUNT(*) as count FROM trips ${where}`;
	const stmt = db.prepare(query);
	const result = stmt.get(...params);

	return result.count;
}


export function getStats(filters = {}) {
	const db = getDatabase();
	const { where, params } = buildWhereClause(filters);

	const query = `
		SELECT
			COUNT(*) as total_trips,
			AVG(trip_duration) as avg_duration_sec,
			AVG(trip_distance_km) as avg_distance_km,
			AVG(avg_speed_kph) as avg_speed_kph,
			AVG(passenger_count) as avg_passengers,
			MIN(trip_duration) as min_duration,
			MAX(trip_duration) as max_duration,
			MIN(trip_distance_km) as min_distance,
			MAX(trip_distance_km) as max_distance,
			MIN(pickup_datetime) as earliest_trip,
			MAX(pickup_datetime) as latest_trip
		FROM trips
		${where}
	`;

	const stmt = db.prepare(query);
	return stmt.get(...params);
}

export function getHourlyDistribution(filters = {}) {
	const db = getDatabase();
	const { where, params } = buildWhereClause(filters);

	const query = `
		SELECT pickup_hour, COUNT(*) as count
		FROM trips
		${where}
		GROUP BY pickup_hour
		ORDER BY pickup_hour
	`;

	const stmt = db.prepare(query);
	return stmt.all(...params);
}

export function getDurationDistribution(filters = {}, bucketSize = 300) {
	const db = getDatabase();
	const { where, params } = buildWhereClause(filters);

	const query = `
		SELECT
			(CAST(trip_duration / ? AS INTEGER) * ?) as bucket,
			COUNT(*) as count,
			(CAST(trip_duration / ? AS INTEGER) * ?) as bucket_min
		FROM trips
		${where}
		GROUP BY bucket
		ORDER BY bucket
	`;

	const stmt = db.prepare(query);
	return stmt.all(bucketSize, bucketSize, bucketSize, bucketSize, ...params);
}

export function getDistanceDistribution(filters = {}, bucketSize = 2) {
	const db = getDatabase();
	const { where, params } = buildWhereClause(filters);

	const query = `
		SELECT
			(CAST(trip_distance_km / ? AS INTEGER) * ?) as bucket,
			COUNT(*) as count,
			(CAST(trip_distance_km / ? AS INTEGER) * ?) as bucket_min
		FROM trips
		${where}
		GROUP BY bucket
		ORDER BY bucket
	`;

	const stmt = db.prepare(query);
	return stmt.all(bucketSize, bucketSize, bucketSize, bucketSize, ...params);
}

export function getSpeedDistribution(filters = {}, bucketSize = 5) {
	const db = getDatabase();
	const { where, params } = buildWhereClause(filters);

	const whereClause = where
		? `${where} AND avg_speed_kph IS NOT NULL`
		: 'WHERE avg_speed_kph IS NOT NULL';

	const query = `
		SELECT
			(CAST(avg_speed_kph / ? AS INTEGER) * ?) as bucket,
			COUNT(*) as count,
			(CAST(avg_speed_kph / ? AS INTEGER) * ?) as bucket_min
		FROM trips
		${whereClause}
		GROUP BY bucket
		ORDER BY bucket
	`;

	const stmt = db.prepare(query);
	return stmt.all(bucketSize, bucketSize, bucketSize, bucketSize, ...params);
}

export function deleteAll() {
	const db = getDatabase();
	const stmt = db.prepare("DELETE FROM trips");
	const result = stmt.run();
	return result.changes;
}

export default {
	findAll,
	findById,
	count,
	getStats,
	getHourlyDistribution,
	getDurationDistribution,
	getDistanceDistribution,
	getSpeedDistribution,
	deleteAll,
};
