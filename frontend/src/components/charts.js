import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export function createCharts(container) {
  const html = `
    <div class="charts-container">
      <div class="chart-card">
        <h3 class="chart-title">Trips by Hour</h3>
        <p class="chart-subtitle" id="hourlySubtitle">All trips included</p>
        <canvas id="hourlyChart"></canvas>
      </div>

      <div class="chart-card">
        <h3 class="chart-title">Trip Duration Distribution</h3>
        <p class="chart-subtitle" id="durationSubtitle">Loading...</p>
        <canvas id="durationChart"></canvas>
      </div>

      <div class="chart-card">
        <h3 class="chart-title">Trip Distance Distribution</h3>
        <p class="chart-subtitle" id="distanceSubtitle">Loading...</p>
        <canvas id="distanceChart"></canvas>
      </div>

      <div class="chart-card">
        <h3 class="chart-title">Speed Distribution</h3>
        <p class="chart-subtitle" id="speedSubtitle">Loading...</p>
        <canvas id="speedChart"></canvas>
      </div>
    </div>
  `;

  container.innerHTML = html;

  const hourlySubtitle = container.querySelector('#hourlySubtitle');
  const durationSubtitle = container.querySelector('#durationSubtitle');
  const distanceSubtitle = container.querySelector('#distanceSubtitle');
  const speedSubtitle = container.querySelector('#speedSubtitle');

  const chartConfig = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  let hourlyChart = new Chart(
    container.querySelector('#hourlyChart'),
    {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Number of Trips',
          data: [],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1
        }]
      },
      options: {
        ...chartConfig,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Trips'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Hour of Day'
            }
          }
        }
      }
    }
  );

  let durationChart = new Chart(
    container.querySelector('#durationChart'),
    {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Number of Trips',
          data: [],
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1
        }]
      },
      options: {
        ...chartConfig,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Trips'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Duration'
            }
          }
        }
      }
    }
  );

  let distanceChart = new Chart(
    container.querySelector('#distanceChart'),
    {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Number of Trips',
          data: [],
          backgroundColor: 'rgba(245, 158, 11, 0.8)',
          borderColor: 'rgba(245, 158, 11, 1)',
          borderWidth: 1
        }]
      },
      options: {
        ...chartConfig,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Trips'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Distance'
            }
          }
        }
      }
    }
  );

  let speedChart = new Chart(
    container.querySelector('#speedChart'),
    {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Number of Trips',
          data: [],
          backgroundColor: 'rgba(139, 92, 246, 0.2)',
          borderColor: 'rgba(139, 92, 246, 1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        ...chartConfig,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Trips'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Speed'
            }
          }
        }
      }
    }
  );

  function formatDurationDistribution(distribution, bucketSize) {
    if (!distribution || distribution.length === 0) return { labels: [], data: [] };

    const labels = distribution
      .filter(item => item && item.bucket_min != null && item.count != null)
      .map(item => {
        const startMin = Math.floor(item.bucket_min / 60);
        const endMin = Math.floor((item.bucket_min + bucketSize) / 60);
        return `${startMin}-${endMin} min`;
      });

    const counts = distribution
      .filter(item => item && item.bucket_min != null && item.count != null)
      .map(item => item.count);

    return { labels, data: counts };
  }

  function formatDistanceDistribution(distribution, bucketSize) {
    if (!distribution || distribution.length === 0) return { labels: [], data: [] };

    const labels = distribution
      .filter(item => item && item.bucket_min != null && item.count != null)
      .map(item => {
        const start = item.bucket_min;
        const end = start + bucketSize;
        return `${start.toFixed(0)}-${end.toFixed(0)} km`;
      });

    const counts = distribution
      .filter(item => item && item.bucket_min != null && item.count != null)
      .map(item => item.count);

    return { labels, data: counts };
  }

  function formatSpeedDistribution(distribution, bucketSize) {
    if (!distribution || distribution.length === 0) return { labels: [], data: [] };

    const labels = distribution
      .filter(item => item && item.bucket_min != null && item.count != null)
      .map(item => {
        const start = item.bucket_min;
        const end = start + bucketSize;
        return `${start.toFixed(0)}-${end.toFixed(0)} km/h`;
      });

    const counts = distribution
      .filter(item => item && item.bucket_min != null && item.count != null)
      .map(item => item.count);

    return { labels, data: counts };
  }

  return {
    update: (statsData, distributionData) => {
      const totalTrips = statsData?.stats?.total_trips || 0;

      if (statsData && statsData.hourlyDistribution) {
        const hourlyDist = statsData.hourlyDistribution;
        if (hourlyDist.length > 0) {
          hourlyChart.data.labels = hourlyDist.map(h => `${h.pickup_hour}:00`);
          hourlyChart.data.datasets[0].data = hourlyDist.map(h => h.count);
          hourlySubtitle.textContent = `${totalTrips.toLocaleString()} trips included`;
        } else {
          hourlyChart.data.labels = [];
          hourlyChart.data.datasets[0].data = [];
          hourlySubtitle.textContent = totalTrips === 0 ? 'No data for selected filters' : 'Loading...';
        }
      }
      hourlyChart.update();

      if (distributionData?.duration?.distribution && Array.isArray(distributionData.duration.distribution)) {
        const durationData = formatDurationDistribution(
          distributionData.duration.distribution,
          distributionData.duration.bucketSize || 300
        );
        if (durationData.labels.length > 0) {
          durationChart.data.labels = durationData.labels;
          durationChart.data.datasets[0].data = durationData.data;
          const durationTotal = durationData.data.reduce((sum, count) => sum + count, 0);
          durationSubtitle.textContent = `${durationTotal.toLocaleString()} trips`;
        } else {
          durationChart.data.labels = [];
          durationChart.data.datasets[0].data = [];
          durationSubtitle.textContent = totalTrips === 0 ? 'No data for selected filters' : 'Loading...';
        }
      }
      durationChart.update();

      if (distributionData?.distance?.distribution && Array.isArray(distributionData.distance.distribution)) {
        const distanceData = formatDistanceDistribution(
          distributionData.distance.distribution,
          distributionData.distance.bucketSize || 2
        );
        if (distanceData.labels.length > 0) {
          distanceChart.data.labels = distanceData.labels;
          distanceChart.data.datasets[0].data = distanceData.data;
          const distanceTotal = distanceData.data.reduce((sum, count) => sum + count, 0);
          distanceSubtitle.textContent = `${distanceTotal.toLocaleString()} trips`;
        } else {
          distanceChart.data.labels = [];
          distanceChart.data.datasets[0].data = [];
          distanceSubtitle.textContent = totalTrips === 0 ? 'No data for selected filters' : 'Loading...';
        }
      }
      distanceChart.update();

      if (distributionData?.speed?.distribution && Array.isArray(distributionData.speed.distribution)) {
        const speedData = formatSpeedDistribution(
          distributionData.speed.distribution,
          distributionData.speed.bucketSize || 5
        );
        if (speedData.labels.length > 0) {
          speedChart.data.labels = speedData.labels;
          speedChart.data.datasets[0].data = speedData.data;
          const speedTotal = speedData.data.reduce((sum, count) => sum + count, 0);
          speedSubtitle.textContent = `${speedTotal.toLocaleString()} trips`;
        } else {
          speedChart.data.labels = [];
          speedChart.data.datasets[0].data = [];
          speedSubtitle.textContent = totalTrips === 0 ? 'No data for selected filters' : 'Loading...';
        }
      }
      speedChart.update();
    },

    destroy: () => {
      hourlyChart.destroy();
      durationChart.destroy();
      distanceChart.destroy();
      speedChart.destroy();
    }
  };
}
