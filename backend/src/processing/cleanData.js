import fs from "fs-extra";
import csv from "csv-parser";
import chalk from "chalk";
import logger from "../utils/logger.js";
import { isValidCoordinate } from "../utils/geo.js";
import { normalizeTimestamp } from "../utils/time.js";
import { deriveFeatures } from "./featureEngineering.js";

/**
 * Clean and validate NYC taxi trip data with streaming callback pattern
 * @param {string} inputPath - Path to raw CSV file
 * @param {function} onValidRecord - Callback invoked for each valid record
 * @returns {Promise<{total: number, kept: number, excluded: number}>}
 */
export async function cleanData(inputPath, onValidRecord) {
	let total = 0;
	let kept = 0;
	let excluded = 0;

	console.log(chalk.cyan("🚀 Starting data cleaning..."));

	await new Promise((resolve, reject) => {
		fs.createReadStream(inputPath)
			.pipe(csv())
			.on("data", (row) => {
				total++;

				// Log progress every 10,000 records
				if (total % 10000 === 0) {
					console.log(chalk.gray(`📊 Processed ${total} records...`));
				}

				const pickupDatetime = normalizeTimestamp(row.pickup_datetime);
				const dropoffDatetime = normalizeTimestamp(row.dropoff_datetime);

				const validCoords =
					isValidCoordinate(parseFloat(row.pickup_latitude), parseFloat(row.pickup_longitude)) &&
					isValidCoordinate(parseFloat(row.dropoff_latitude), parseFloat(row.dropoff_longitude));

				const duration = parseFloat(row.trip_duration);

				const validDuration = duration > 30 && duration < 3 * 3600; // between 30s and 3h
				const validPassengers = row.passenger_count && parseInt(row.passenger_count) > 0;

				if (!pickupDatetime || !dropoffDatetime || !validCoords || !validDuration || !validPassengers) {
					excluded++;
					logger.warn(`Excluded record id=${row.id} - Invalid data`);
					return;
				}

				const enriched = deriveFeatures({ ...row, pickup_datetime: pickupDatetime, dropoff_datetime: dropoffDatetime });
				kept++;

				onValidRecord(enriched);
			})
			.on("end", () => {
				console.log(chalk.green(`✅ Finished cleaning. ${kept}/${total} records kept (${((kept / total) * 100).toFixed(2)}%)`));
				logger.info(`Total=${total}, Kept=${kept}, Excluded=${excluded}`);
				resolve();
			})
			.on("error", reject);
	});

	return { total, kept, excluded };
}
