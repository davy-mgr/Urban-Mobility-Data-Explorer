import dayjs from 'dayjs';

export function createFilters(container, onFilterChange) {
  const currentFilters = {
    startDate: '',
    endDate: '',
    minDuration: '',
    maxDuration: '',
    minDistance: '',
    maxDistance: '',
    pickupHour: '',
    passengerCount: ''
  };

  const html = `
    <div class="filters-container">
      <div class="filters-header">
        <h2 class="filters-title">Filters</h2>
        <button id="toggleFilters" class="btn btn-secondary btn-ghost filters-toggle" aria-expanded="false" type="button">
          Show Filters <span class="chevron"></span>
        </button>
      </div>

      <div class="filters-content" hidden>
        <div class="filters-grid">
          <div class="filter-group">
            <label for="startDate">Start Date</label>
            <input type="date" id="startDate" class="filter-input">
          </div>

        <div class="filter-group">
          <label for="endDate">End Date</label>
          <input type="date" id="endDate" class="filter-input">
        </div>

        <div class="filter-group">
          <label for="minDuration">Min Duration (seconds)</label>
          <input type="number" id="minDuration" class="filter-input" placeholder="30" min="0">
        </div>

        <div class="filter-group">
          <label for="maxDuration">Max Duration (seconds)</label>
          <input type="number" id="maxDuration" class="filter-input" placeholder="10800" min="0">
        </div>

        <div class="filter-group">
          <label for="minDistance">Min Distance (km)</label>
          <input type="number" id="minDistance" class="filter-input" placeholder="0" min="0" step="0.1">
        </div>

        <div class="filter-group">
          <label for="maxDistance">Max Distance (km)</label>
          <input type="number" id="maxDistance" class="filter-input" placeholder="100" min="0" step="0.1">
        </div>

        <div class="filter-group">
          <label for="pickupHour">Pickup Hour</label>
          <select id="pickupHour" class="filter-input">
            <option value="">All Hours</option>
            ${Array.from({length: 24}, (_, i) => `<option value="${i}">${i}:00 - ${i}:59</option>`).join('')}
          </select>
        </div>

        <div class="filter-group">
          <label for="passengerCount">Passenger Count</label>
          <input type="number" id="passengerCount" class="filter-input" placeholder="Any" min="1" max="10">
        </div>
        </div>

        <div class="filter-actions">
          <button id="applyFilters" class="btn btn-primary">Apply Filters</button>
          <button id="clearFilters" class="btn btn-secondary">Clear Filters</button>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  const startDateInput = container.querySelector('#startDate');
  const endDateInput = container.querySelector('#endDate');
  const minDurationInput = container.querySelector('#minDuration');
  const maxDurationInput = container.querySelector('#maxDuration');
  const minDistanceInput = container.querySelector('#minDistance');
  const maxDistanceInput = container.querySelector('#maxDistance');
  const pickupHourInput = container.querySelector('#pickupHour');
  const passengerCountInput = container.querySelector('#passengerCount');
  const applyButton = container.querySelector('#applyFilters');
  const clearButton = container.querySelector('#clearFilters');
  const toggleButton = container.querySelector('#toggleFilters');
  const contentEl = container.querySelector('.filters-content');

  function collectFilters() {
    return {
      startDate: startDateInput.value,
      endDate: endDateInput.value,
      minDuration: minDurationInput.value,
      maxDuration: maxDurationInput.value,
      minDistance: minDistanceInput.value,
      maxDistance: maxDistanceInput.value,
      pickupHour: pickupHourInput.value,
      passengerCount: passengerCountInput.value
    };
  }

  applyButton.addEventListener('click', () => {
    const filters = collectFilters();
    Object.assign(currentFilters, filters);
    onFilterChange(currentFilters);
  });

  clearButton.addEventListener('click', () => {
    startDateInput.value = '';
    endDateInput.value = '';
    minDurationInput.value = '';
    maxDurationInput.value = '';
    minDistanceInput.value = '';
    maxDistanceInput.value = '';
    pickupHourInput.value = '';
    passengerCountInput.value = '';

    Object.keys(currentFilters).forEach(key => currentFilters[key] = '');
    onFilterChange(currentFilters);
  });

  toggleButton.addEventListener('click', () => {
    const expanded = toggleButton.getAttribute('aria-expanded') === 'true';
    const next = !expanded;
    toggleButton.setAttribute('aria-expanded', String(next));
    contentEl.hidden = !next;
    toggleButton.innerHTML = `${next ? 'Hide Filters' : 'Show Filters'} <span class="chevron"></span>`;
  });

  return {
    getFilters: () => currentFilters
  };
}
