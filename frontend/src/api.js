const API_BASE = "http://localhost:3001/api";

export async function fetchTrips(filters = {}) {
  const params = new URLSearchParams();

  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.minDuration) params.append('minDuration', filters.minDuration);
  if (filters.maxDuration) params.append('maxDuration', filters.maxDuration);
  if (filters.minDistance) params.append('minDistance', filters.minDistance);
  if (filters.maxDistance) params.append('maxDistance', filters.maxDistance);
  if (filters.pickupHour !== undefined && filters.pickupHour !== '') params.append('pickupHour', filters.pickupHour);
  if (filters.passengerCount) params.append('passengerCount', filters.passengerCount);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.offset) params.append('offset', filters.offset);

  const url = `${API_BASE}/trips${params.toString() ? '?' + params.toString() : ''}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch trips: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchStats(filters = {}) {
  const params = new URLSearchParams();

  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.minDuration) params.append('minDuration', filters.minDuration);
  if (filters.maxDuration) params.append('maxDuration', filters.maxDuration);
  if (filters.minDistance) params.append('minDistance', filters.minDistance);
  if (filters.maxDistance) params.append('maxDistance', filters.maxDistance);
  if (filters.pickupHour !== undefined && filters.pickupHour !== '') params.append('pickupHour', filters.pickupHour);
  if (filters.passengerCount) params.append('passengerCount', filters.passengerCount);

  const url = `${API_BASE}/stats${params.toString() ? '?' + params.toString() : ''}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchDurationDistribution(filters = {}, bucketSize = 300) {
  const params = new URLSearchParams();

  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.minDuration) params.append('minDuration', filters.minDuration);
  if (filters.maxDuration) params.append('maxDuration', filters.maxDuration);
  if (filters.minDistance) params.append('minDistance', filters.minDistance);
  if (filters.maxDistance) params.append('maxDistance', filters.maxDistance);
  if (filters.pickupHour !== undefined && filters.pickupHour !== '') params.append('pickupHour', filters.pickupHour);
  if (filters.passengerCount) params.append('passengerCount', filters.passengerCount);
  if (bucketSize) params.append('bucketSize', bucketSize);

  const url = `${API_BASE}/stats/duration-distribution${params.toString() ? '?' + params.toString() : ''}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch duration distribution: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchDistanceDistribution(filters = {}, bucketSize = 2) {
  const params = new URLSearchParams();

  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.minDuration) params.append('minDuration', filters.minDuration);
  if (filters.maxDuration) params.append('maxDuration', filters.maxDuration);
  if (filters.minDistance) params.append('minDistance', filters.minDistance);
  if (filters.maxDistance) params.append('maxDistance', filters.maxDistance);
  if (filters.pickupHour !== undefined && filters.pickupHour !== '') params.append('pickupHour', filters.pickupHour);
  if (filters.passengerCount) params.append('passengerCount', filters.passengerCount);
  if (bucketSize) params.append('bucketSize', bucketSize);

  const url = `${API_BASE}/stats/distance-distribution${params.toString() ? '?' + params.toString() : ''}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch distance distribution: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchSpeedDistribution(filters = {}, bucketSize = 5) {
  const params = new URLSearchParams();

  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.minDuration) params.append('minDuration', filters.minDuration);
  if (filters.maxDuration) params.append('maxDuration', filters.maxDuration);
  if (filters.minDistance) params.append('minDistance', filters.minDistance);
  if (filters.maxDistance) params.append('maxDistance', filters.maxDistance);
  if (filters.pickupHour !== undefined && filters.pickupHour !== '') params.append('pickupHour', filters.pickupHour);
  if (filters.passengerCount) params.append('passengerCount', filters.passengerCount);
  if (bucketSize) params.append('bucketSize', bucketSize);

  const url = `${API_BASE}/stats/speed-distribution${params.toString() ? '?' + params.toString() : ''}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch speed distribution: ${response.statusText}`);
  }

  return response.json();
}
