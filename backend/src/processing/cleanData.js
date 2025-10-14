import fs from "fs-extra";
import csv from "csv-parser";
import path from "path";
import chalk from "chalk";
import logger from "../utils/logger.js";
import { isValidCoordinate } from "../utils/geo.js";
import { normalizeTimestamp } from "../utils/time.js";
import { deriveFeatures } from "./featureEngineering.js";

export async function cleanData(inputPath, outputPath) {
	  const outputDir = path.dirname(outputPath);
	  await fs.ensureDir(outputDir);

	  const writeStream = fs.createWriteStream(outputPath);
	  const headersWritten = { value: false };
	  const cleanRows = [];

	  const invalidRecords = [];
	  let total = 0;
	  let kept = 0;

	  console.log(chalk.cyan("🚀 Starting data cleaning..."));

	  await new Promise((resolve, reject) => {
		      fs.createReadStream(inputPath)
		        .pipe(csv())
		        .on("data", (row) => {
				        total++;

				        const pickupDatetime = normalizeTimestamp(row.pickup_datetime);
				        const dropoffDatetime = normalizeTimestamp(row.dropoff_datetime);

				        const validCoords =
					          isValidCoordinate(parseFloat(row.pickup_latitude), parseFloat(row.pickup_longitude)) &&
					          isValidCoordinate(parseFloat(row.dropoff_latitude), parseFloat(row.dropoff_longitude));

				        const duration = parseFloat(row.trip_duration);

				        const validDuration = duration > 30 && duration < 3 * 3600; // between 30s and 3h
				        const validPassengers = row.passenger_count && parseInt(row.passenger_count) > 0;

				        if (!pickupDatetime || !dropoffDatetime || !validCoords || !validDuration || !validPassengers) {
						          invalidRecords.push(row);
						          logger.warn(`Excluded record id=${row.id}`);
						          return;
						        }

				        const enriched = deriveFeatures({ ...row, pickup_datetime: pickupDatetime, dropoff_datetime: dropoffDatetime });
				        cleanRows.push(enriched);
				        kept++;
				      })
		        .on("end", async () => {
				        console.log(chalk.green(`✅ Finished cleaning. ${kept}/${total} records kept.`));
				        // Write CSV
				//         if (cleanRows.length > 0) {
				//                   const headers = Object.keys(cleanRows[0]);
				//                             writeStream.write(headers.join(",") + "\n");
				//                                       cleanRows.forEach((row) => {
				//                                                   const line = headers.map((h) => row[h]).join(",");
				//                                                               writeStream.write(line + "\n");
				//                                                                         });
				//                                                                                 }
				//                                                                                         writeStream.end();
				//                                                                                                 logger.info(`Total=${total}, Kept=${kept}, Excluded=${invalidRecords.length}`);
				//                                                                                                         resolve();
				//                                                                                                               })
				//                                                                                                                     .on("error", reject);
				//                                                                                                                       });
				//
				//                                                                                                                         return { total, kept, excluded: invalidRecords.length };
				//                                                                                                                         }
				//
