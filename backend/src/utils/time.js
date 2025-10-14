import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export function normalizeTimestamp(ts) {
	  const date = dayjs(ts);
	  if (!date.isValid()) return null;
	  return date.utc().toISOString();
}

export function extractPickupHour(ts) {
	  const date = dayjs(ts);
	  return date.isValid() ? date.hour() : null;
}

