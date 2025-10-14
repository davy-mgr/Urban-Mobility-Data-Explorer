import { getDatabase } from "../config/db.js";

/**
 * Trip Model - Database queries for NYC taxi trip data
 */

/**
 * Build WHERE clause from filters
 * @param {object} filters - Filter parameters
 * @returns {object} {where: string, params: array}
 */
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

/**
 * Find all trips with pagination and filters
 * @param {object} options - {filters, page, limit, sortBy, sortOrder}
 * @returns {array} Array of trip records
 */
export function findAll(options = {}) {
	const db = getDatabase();
	const { filters = {}, page = 1, limit = 100, sortBy = "pickup_datetime", sortOrder = "DESC" } = options;

	const { where, params } = buildWhereClause(filters);

	// Validate sort parameters
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

/**
 * Find single trip by ID
 * @param {string} id - Trip ID
 * @returns {object|null} Trip record or null
 */
export function findById(id) {
	const db = getDatabase();
	const stmt = db.prepare("SELECT * FROM trips WHERE id = ?");
	return stmt.get(id);
}

/**
 * Count trips matching filters
 * @param {object} filters - Filter parameters
 * @returns {number} Count of matching trips
 */
export function count(filters = {}) {
	const db = getDatabase();
	const { where, params } = buildWhereClause(filters);

	const query = `SELECT COUNT(*) as count FROM trips ${where}`;
	const stmt = db.prepare(query);
	const result = stmt.get(...params);

	return result.count;
}

/**
 * Get aggregate statistics
 * @param {object} filters - Filter parameters
 * @returns {object} Statistics object
 */
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

/**
 * Get trip distribution by hour
 * @returns {array} Array of {pickup_hour, count}
 */
export function getHourlyDistribution() {
	const db = getDatabase();
	const stmt = db.prepare(`
		SELECT pickup_hour, COUNT(*) as count
		FROM trips
		GROUP BY pickup_hour
		ORDER BY pickup_hour
	`);
	return stmt.all();
}

/**
 * Delete all trips from database
 * @returns {number} Number of deleted records
 */
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
	deleteAll,
};
