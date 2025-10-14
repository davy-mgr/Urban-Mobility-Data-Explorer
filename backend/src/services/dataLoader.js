import chalk from "chalk";
import { cleanData } from "../processing/cleanData.js";
import { getDatabase } from "../config/db.js";
import logger from "../utils/logger.js";

const BATCH_SIZE = 1000; // Insert 1000 records per transaction

/**
 * Load cleaned data into database with batch inserts
 * @param {string} inputPath - Path to raw CSV file
 * @returns {Promise<{total: number, kept: number, excluded: number, inserted: number}>}
 */
export async function loadDataToDatabase(inputPath) {
	const db = getDatabase();
	let batch = [];
	let inserted = 0;

	console.log(chalk.cyan("📦 Preparing database for bulk insert..."));

	// Prepare insert statement (reuse for performance)
	const insertStmt = db.prepare(`
		INSERT OR REPLACE INTO trips (
			id, pickup_datetime, dropoff_datetime,
			pickup_latitude, pickup_longitude,
			dropoff_latitude, dropoff_longitude,
			passenger_count, trip_duration,
			trip_distance_km, avg_speed_kph, pickup_hour
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`);

	// Create transaction wrapper for batch inserts
	const insertBatch = db.transaction((records) => {
		for (const record of records) {
			insertStmt.run(
				record.id,
				record.pickup_datetime,
				record.dropoff_datetime,
				parseFloat(record.pickup_latitude),
				parseFloat(record.pickup_longitude),
				parseFloat(record.dropoff_latitude),
				parseFloat(record.dropoff_longitude),
				parseInt(record.passenger_count),
				parseInt(record.trip_duration),
				parseFloat(record.trip_distance_km),
				record.avg_speed_kph ? parseFloat(record.avg_speed_kph) : null,
				parseInt(record.pickup_hour)
			);
		}
	});

	// Callback for each valid record
	const handleValidRecord = (record) => {
		batch.push(record);

		if (batch.length >= BATCH_SIZE) {
			insertBatch(batch);
			inserted += batch.length;
			console.log(chalk.green(`💾 Inserted ${inserted} records...`));
			batch = [];
		}
	};

	// Stream and clean data
	const result = await cleanData(inputPath, handleValidRecord);

	// Insert remaining records
	if (batch.length > 0) {
		insertBatch(batch);
		inserted += batch.length;
		console.log(chalk.green(`💾 Inserted final batch: ${inserted} total records`));
	}

	logger.info(`Data loading complete: ${inserted} records inserted into database`);

	return {
		...result,
		inserted,
	};
}

/**
 * Get database statistics
 * @returns {object} Database statistics
 */
export function getDatabaseStats() {
	const db = getDatabase();
	const stats = db.prepare("SELECT * FROM trip_stats").get();
	return stats;
}

export default { loadDataToDatabase, getDatabaseStats };
