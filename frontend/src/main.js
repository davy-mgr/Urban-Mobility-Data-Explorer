import './style.css';
import { fetchStats, fetchDurationDistribution, fetchDistanceDistribution, fetchSpeedDistribution } from './api.js';
import { createFilters } from './components/filters.js';
import { createStats } from './components/stats.js';
import { createCharts } from './components/charts.js';

const app = document.querySelector('#app');

app.innerHTML = `
  <div class="dashboard">
    <header class="dashboard-header">
      <h1>NYC Taxi Trip Explorer</h1>
    </header>

    <div id="filters-section"></div>

    <div id="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading data...</p>
    </div>

    <div id="error" class="error hidden"></div>

    <div id="stats-section"></div>

    <div id="charts-section"></div>
  </div>
`;

const filtersSection = document.querySelector('#filters-section');
const statsSection = document.querySelector('#stats-section');
const chartsSection = document.querySelector('#charts-section');
const loadingEl = document.querySelector('#loading');
const errorEl = document.querySelector('#error');

let statsComponent;
let chartsComponent;

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

async function loadData(filters = {}) {
  let loadingTimeout;

  try {
    errorEl.classList.add('hidden');

    loadingTimeout = setTimeout(() => {
      loadingEl.classList.remove('hidden');
    }, 200);

    const [statsData, durationDist, distanceDist, speedDist] = await Promise.all([
      fetchStats(filters),
      fetchDurationDistribution(filters, 300),
      fetchDistanceDistribution(filters, 2),
      fetchSpeedDistribution(filters, 5)
    ]);

    clearTimeout(loadingTimeout);

    console.log('Loaded data:', { statsData, durationDist, distanceDist, speedDist });

    if (!statsComponent) {
      statsComponent = createStats(statsSection);
    }
    statsComponent.update(statsData.stats);

    if (!chartsComponent) {
      chartsComponent = createCharts(chartsSection);
    }

    const distributionData = {
      duration: durationDist,
      distance: distanceDist,
      speed: speedDist
    };

    chartsComponent.update(statsData, distributionData);

    loadingEl.classList.add('hidden');
  } catch (error) {
    clearTimeout(loadingTimeout);

    console.error('Error loading data:', error);
    console.error('Error stack:', error.stack);
    loadingEl.classList.add('hidden');
    errorEl.textContent = `Error: ${error.message}. Make sure the backend server is running on http://localhost:3001`;
    errorEl.classList.remove('hidden');
  }
}

const debouncedLoadData = debounce(loadData, 300);

createFilters(filtersSection, (filters) => {
  debouncedLoadData(filters);
});

loadData();
