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

// Debounce utility function
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

    // Only show loading indicator if request takes longer than 200ms
    // This prevents flicker on fast responses
    loadingTimeout = setTimeout(() => {
      loadingEl.classList.remove('hidden');
    }, 200);

    // Fetch stats and all distribution data in parallel
    const [statsData, durationDist, distanceDist, speedDist] = await Promise.all([
      fetchStats(filters),
      fetchDurationDistribution(filters, 300),
      fetchDistanceDistribution(filters, 2),
      fetchSpeedDistribution(filters, 5)
    ]);

    // Clear the timeout since we got a response
    clearTimeout(loadingTimeout);

    console.log('Loaded data:', { statsData, durationDist, distanceDist, speedDist });

    if (!statsComponent) {
      statsComponent = createStats(statsSection);
    }
    statsComponent.update(statsData.stats);

    if (!chartsComponent) {
      chartsComponent = createCharts(chartsSection);
    }

    // Package distribution data for charts
    const distributionData = {
      duration: durationDist,
      distance: distanceDist,
      speed: speedDist
    };

    chartsComponent.update(statsData, distributionData);

    loadingEl.classList.add('hidden');
  } catch (error) {
    // Clear the timeout in case of error
    clearTimeout(loadingTimeout);

    console.error('Error loading data:', error);
    console.error('Error stack:', error.stack);
    loadingEl.classList.add('hidden');
    errorEl.textContent = `Error: ${error.message}. Make sure the backend server is running on http://localhost:3001`;
    errorEl.classList.remove('hidden');
  }
}

// Debounced version of loadData (300ms delay)
const debouncedLoadData = debounce(loadData, 300);

createFilters(filtersSection, (filters) => {
  debouncedLoadData(filters);
});

// Initial load (no debounce needed)
loadData();
