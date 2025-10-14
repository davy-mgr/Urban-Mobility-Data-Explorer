import haversine from "haversine-distance";

export function computeDistanceKm(pickupLat, pickupLon, dropoffLat, dropoffLon) {
	  const from = { lat: pickupLat, lon: pickupLon };
	  const to = { lat: dropoffLat, lon: dropoffLon };
	  const meters = haversine(from, to);
	  return meters / 1000;
}

export function isValidCoordinate(lat, lon) {
	  return (
		      lat >= 40.477399 && lat <= 40.917577 && // approximate NYC bounds
		      lon >= -74.25909 && lon <= -73.700272
		    );
}

