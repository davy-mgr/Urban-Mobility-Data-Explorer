import { formatNumber, formatDuration, formatDistance, formatSpeed } from '../utils/formatters.js';

export function createStats(container) {
  const html = `
    <div class="stats-container">
      <div class="stat-card">
        <div class="stat-icon">🚕</div>
        <div class="stat-content">
          <div class="stat-label">Total Trips</div>
          <div class="stat-value" id="totalTrips">-</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-content">
          <div class="stat-label">Avg Duration</div>
          <div class="stat-value" id="avgDuration">-</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📏</div>
        <div class="stat-content">
          <div class="stat-label">Avg Distance</div>
          <div class="stat-value" id="avgDistance">-</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-content">
          <div class="stat-label">Avg Speed</div>
          <div class="stat-value" id="avgSpeed">-</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <div class="stat-label">Avg Passengers</div>
          <div class="stat-value" id="avgPassengers">-</div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  return {
    update: (stats) => {
      const totalTripsEl = container.querySelector('#totalTrips');
      const avgDurationEl = container.querySelector('#avgDuration');
      const avgDistanceEl = container.querySelector('#avgDistance');
      const avgSpeedEl = container.querySelector('#avgSpeed');
      const avgPassengersEl = container.querySelector('#avgPassengers');

      // Handle total trips (could be 0 or null/undefined)
      totalTripsEl.textContent = stats.total_trips != null ? formatNumber(stats.total_trips) : '0';

      // Handle averages (null/undefined when no data)
      avgDurationEl.textContent = stats.avg_duration_sec != null ? formatDuration(stats.avg_duration_sec) : '-';
      avgDistanceEl.textContent = stats.avg_distance_km != null ? formatDistance(stats.avg_distance_km) : '-';
      avgSpeedEl.textContent = stats.avg_speed_kph != null ? formatSpeed(stats.avg_speed_kph) : '-';
      avgPassengersEl.textContent = stats.avg_passengers != null ? formatNumber(stats.avg_passengers) : '-';
    }
  };
}
