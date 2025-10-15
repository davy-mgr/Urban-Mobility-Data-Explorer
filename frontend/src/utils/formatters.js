import dayjs from 'dayjs';

export function formatNumber(num) {
  if (num === null || num === undefined) return '-';
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export function formatDuration(seconds) {
  if (seconds == null) return '-';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function formatDistance(km) {
  if (km == null) return '-';
  return `${km.toFixed(2)} km`;
}

export function formatSpeed(kph) {
  if (kph == null) return '-';
  return `${kph.toFixed(2)} km/h`;
}

export function formatDate(dateString) {
  if (!dateString) return '-';
  return dayjs(dateString).format('MMM D, YYYY');
}

export function formatDateTime(dateString) {
  if (!dateString) return '-';
  return dayjs(dateString).format('MMM D, YYYY h:mm A');
}

export function formatTime(dateString) {
  if (!dateString) return '-';
  return dayjs(dateString).format('h:mm A');
}
