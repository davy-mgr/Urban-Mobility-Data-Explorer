import { computeDistanceKm } from "../utils/geo.js";
import { extractPickupHour } from "../utils/time.js";

export function deriveFeatures(record) {
	  const pickupLat = parseFloat(record.pickup_latitude);
	  const pickupLon = parseFloat(record.pickup_longitude);
	  const dropoffLat = parseFloat(record.dropoff_latitude);
	  const dropoffLon = parseFloat(record.dropoff_longitude);
	  const durationSec = parseFloat(record.trip_duration);

	  const tripDistanceKm = computeDistanceKm(pickupLat, pickupLon, dropoffLat, dropoffLon);
	  const avgSpeedKph = durationSec > 0 ? (tripDistanceKm / (durationSec / 3600)) : null;
	  const pickupHour = extractPickupHour(record.pickup_datetime);

	  return { ...record, trip_distance_km: tripDistanceKm, avg_speed_kph: avgSpeedKph, pickup_hour: pickupHour };
}

