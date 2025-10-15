// script.js (module)
const API_BASE = '' // set to backend base, e.g. 'http://localhost:5000'
const USE_MOCK_DEFAULT = true   // set false to prefer live backend
let useMock = USE_MOCK_DEFAULT;

const state = {
  filters: {},
  page: 1,
  pageSize: 25,
  trips: [], // cached data
  summary: {}
};

// ---- DOM refs ----
const startDateEl = document.getElementById('startDate');
const endDateEl = document.getElementById('endDate');
const hourFilterEl = document.getElementById('hourFilter');
const minDistanceEl = document.getElementById('minDistance');
const maxDistanceEl = document.getElementById('maxDistance');
const minFareEl = document.getElementById('minFare');
const maxFareEl = document.getElementById('maxFare');
const applyBtn = document.getElementById('applyFilters');
const resetBtn = document.getElementById('resetFilters');
const mockToggle = document.getElementById('mockToggle');
const refreshBtn = document.getElementById('refreshBtn');

const totalTripsEl = document.getElementById('totalTrips');
const avgFareEl = document.getElementById('avgFare');
const avgSpeedEl = document.getElementById('avgSpeed');
const avgTipPctEl = document.getElementById('avgTipPct');

const tripsTableBody = document.querySelector('#tripsTable tbody');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

// charts
let timeChart = null, distanceChart = null, zonesChart = null;

// init
function init(){
  mockToggle.checked = USE_MOCK_DEFAULT;
  useMock = mockToggle.checked;
  populateHourOptions();
  wireEvents();
  loadDataAndRender();
}

function populateHourOptions(){
  for(let h=0; h<24; h++){
    const opt = document.createElement('option');
    opt.value = h;
    opt.textContent = h.toString().padStart(2, '0') + ':00';
    hourFilterEl.appendChild(opt);
  }
}

function wireEvents(){
  applyBtn.addEventListener('click', () => { state.page = 1; collectFilters(); loadDataAndRender(); });
  resetBtn.addEventListener('click', () => { resetFilters(); state.page = 1; loadDataAndRender(); });
  mockToggle.addEventListener('change', e => { useMock = e.target.checked; loadDataAndRender(); });
  refreshBtn.addEventListener('click', () => loadDataAndRender());
  prevPageBtn.addEventListener('click', () => { if(state.page>1){ state.page--; renderTable(); } });
  nextPageBtn.addEventListener('click', () => { state.page++; renderTable(); });
}

function collectFilters(){
  state.filters = {
    startDate: startDateEl.value || null,
    endDate: endDateEl.value || null,
    hour: hourFilterEl.value !== '' ? Number(hourFilterEl.value) : null,
    minDistance: minDistanceEl.value ? Number(minDistanceEl.value) : null,
    maxDistance: maxDistanceEl.value ? Number(maxDistanceEl.value) : null,
    minFare: minFareEl.value ? Number(minFareEl.value) : null,
    maxFare: maxFareEl.value ? Number(maxFareEl.value) : null
  };
}

function resetFilters(){
  startDateEl.value = '';
  endDateEl.value = '';
  hourFilterEl.value = '';
  minDistanceEl.value = '';
  maxDistanceEl.value = '';
  minFareEl.value = '';
  maxFareEl.value = '';
  collectFilters();
}

// ------------------ Data Loading ------------------

async function loadDataAndRender(){
  showLoading(true);
  try{
    const [trips, summary] = useMock ? await loadMockData() : await Promise.all([fetchTripsFromAPI(), fetchSummaryFromAPI()]);
    state.trips = trips;
    state.summary = summary;
    renderAll();
  }catch(err){
    console.error(err);
    // fallback to mock if live fetch fails
    const [trips, summary] = await loadMockData();
    state.trips = trips;
    state.summary = summary;
    renderAll();
  }
  showLoading(false);
}

async function fetchTripsFromAPI(){
  // Example API: GET /api/trips?start=YYYY-MM-DD&end=...&hour=...&min_dist=...&page=1&page_size=25
  const params = new URLSearchParams();
  const f = state.filters;
  if(f.startDate) params.set('start', f.startDate);
  if(f.endDate) params.set('end', f.endDate);
  if(f.hour !== null) params.set('hour', f.hour);
  if(f.minDistance !== null) params.set('min_distance', f.minDistance);
  if(f.maxDistance !== null) params.set('max_distance', f.maxDistance);
  if(f.minFare !== null) params.set('min_fare', f.minFare);
  if(f.maxFare !== null) params.set('max_fare', f.maxFare);
  params.set('page', state.page);
  params.set('page_size', state.pageSize);
  const url = `${API_BASE}/api/trips?${params.toString()}`;

  const res = await fetch(url);
  if(!res.ok) throw new Error('Trips fetch failed: ' + res.status);
  const json = await res.json();
  // Expect format: { trips: [...], total: 123 }
  return json.trips || [];
}

async function fetchSummaryFromAPI(){
  // Example API: GET /api/trips/summary?start=...&end=...
  const params = new URLSearchParams();
  const f = state.filters;
  if(f.startDate) params.set('start', f.startDate);
  if(f.endDate) params.set('end', f.endDate);
  const url = `${API_BASE}/api/trips/summary?${params.toString()}`;
  const res = await fetch(url);
  if(!res.ok) throw new Error('Summary fetch failed');
  const json = await res.json();
  // Expect format { total_trips: 100, avg_fare: 12.3, avg_speed: 15.2, avg_tip_pct: 0.12 }
  return json;
}

// ------------------ Mock Data ------------------

async function loadMockData(){
  // lightweight synthetic dataset for development and demos
  const trips = [];
  const zones = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];
  const now = new Date();
  for(let i=0;i<500;i++){
    const dMinutes = Math.round(Math.random()*120);
    const pickup = new Date(now.getTime() - Math.random()*1000*60*60*24*30);
    const dropoff = new Date(pickup.getTime() + dMinutes*60*1000);
    const distance_km = Math.max(0.2, Math.random()*20);
    const fare = Math.max(3, distance_km*1.8 + Math.random()*5);
    const tip = fare * (Math.random()*0.4);
    const pickup_zone = zones[Math.floor(Math.random()*zones.length)];
    trips.push({
      pickup_datetime: pickup.toISOString(),
      dropoff_datetime: dropoff.toISOString(),
      pickup_zone,
      dropoff_zone: zones[Math.floor(Math.random()*zones.length)],
      distance_km: Number(distance_km.toFixed(2)),
      duration_minutes: dMinutes,
      fare_amount: Number(fare.toFixed(2)),
      tip_amount: Number(tip.toFixed(2)),
      tip_pct: Number((tip/fare).toFixed(2))
    });
  }
  // simple summary
  const summary = {
    total_trips: trips.length,
    avg_fare: Number((trips.reduce((s,t)=>s+t.fare_amount,0)/trips.length).toFixed(2)),
    avg_speed: Number((trips.reduce((s,t)=>s + (t.distance_km / Math.max(1e-6, t.duration_minutes/60)),0)/trips.length).toFixed(2)),
    avg_tip_pct: Number((trips.reduce((s,t)=>s + t.tip_pct,0)/trips.length).toFixed(2))
  };
  // Apply filter logic (same as server would)
  const filtered = applyLocalFilters(trips);
  return [filtered, summary];
}

function applyLocalFilters(trips){
  collectFilters();
  return trips.filter(t => {
    const f = state.filters;
    if(f.startDate && new Date(t.pickup_datetime) < new Date(f.startDate)) return false;
    if(f.endDate && new Date(t.pickup_datetime) > new Date(new Date(f.endDate).getTime() + 24*60*60*1000)) return false;
    if(f.hour !== null && new Date(t.pickup_datetime).getHours() !== f.hour) return false;
    if(f.minDistance !== null && t.distance_km < f.minDistance) return false;
    if(f.maxDistance !== null && t.distance_km > f.maxDistance) return false;
    if(f.minFare !== null && t.fare_amount < f.minFare) return false;
    if(f.maxFare !== null && t.fare_amount > f.maxFare) return false;
    return true;
  });
}

// ------------------ Render ------------------

function renderAll(){
  updateOverview();
  renderCharts();
  renderTable();
}

function updateOverview(){
  const sum = state.summary;
  totalTripsEl.textContent = sum.total_trips ?? state.trips.length;
  avgFareEl.textContent = (sum.avg_fare ?? computeAvg(state.trips, 'fare_amount')).toFixed(2);
  avgSpeedEl.textContent = (sum.avg_speed ?? computeAvgSpeed(state.trips)).toFixed(2);
  avgTipPctEl.textContent = ((sum.avg_tip_pct ?? computeAvg(state.trips, 'tip_pct'))*100).toFixed(1) + '%';
}

function computeAvg(arr, key){
  if(!arr.length) return 0;
  const v = arr.reduce((s,x)=>s + (Number(x[key])||0), 0);
  return v / arr.length;
}

function computeAvgSpeed(arr){
  if(!arr.length) return 0;
  const v = arr.reduce((s,x)=> s + (Number(x.distance_km) || 0) / Math.max(1e-6, (Number(x.duration_minutes) || 0)/60), 0);
  return v / arr.length;
}

function renderCharts(){
  const trips = state.trips;
  // time series: group by date
  const byDate = {};
  trips.forEach(t=>{
    const d = new Date(t.pickup_datetime);
    const key = d.toISOString().slice(0,10);
    byDate[key] = (byDate[key]||0) + 1;
  });
  const labels = Object.keys(byDate).sort();
  const values = labels.map(k => byDate[k]);

  // distance distribution buckets
  const buckets = [0,1,2,5,10,20,50];
  const bucketCounts = buckets.map((b,i)=>{
    const min = b, max = buckets[i+1] ?? Infinity;
    return trips.filter(t => t.distance_km >= min && t.distance_km < max).length;
  });

  // top pickup zones (group)
  const zones = {};
  trips.forEach(t=>{
    const z = t.pickup_zone || 'Unknown';
    zones[z] = (zones[z]||0) + 1;
  });
  const zoneEntries = Object.entries(zones).sort((a,b)=>b[1]-a[1]).slice(0,10);
  const zoneLabels = zoneEntries.map(e=>e[0]);
  const zoneValues = zoneEntries.map(e=>e[1]);

  // create/update charts
  const timeCtx = document.getElementById('timeChart').getContext('2d');
  if(timeChart) timeChart.destroy();
  timeChart = new Chart(timeCtx, {
    type:'line',
    data:{
      labels,
      datasets:[{ label:'Trips', data: values, tension:0.2, fill:true }]
    },
    options:{ plugins:{legend:{display:false}}}
  });

  const distCtx = document.getElementById('distanceChart').getContext('2d');
  if(distanceChart) distanceChart.destroy();
  distanceChart = new Chart(distCtx, {
    type:'bar',
    data:{
      labels: buckets.map((b,i)=> b + (buckets[i+1] ? '–' + buckets[i+1] : '+') + ' km'),
      datasets:[{ label:'Trips', data: bucketCounts }]
    },
    options:{ plugins:{legend:{display:false}}}
  });

  const zonesCtx = document.getElementById('zonesChart').getContext('2d');
  if(zonesChart) zonesChart.destroy();
  zonesChart = new Chart(zonesCtx, {
    type:'pie',
    data:{ labels:zoneLabels, datasets:[{ data:zoneValues }]},
    options:{ plugins:{legend:{position:'right'}}}
  });
}

// ------------------ Table ------------------

function renderTable(){
  const rows = state.trips;
  const start = (state.page-1)*state.pageSize;
  const pageRows = rows.slice(start, start + state.pageSize);
  tripsTableBody.innerHTML = '';
  pageRows.forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatShortDate(r.pickup_datetime)}</td>
      <td>${formatShortDate(r.dropoff_datetime)}</td>
      <td>${Number(r.distance_km).toFixed(2)}</td>
      <td>${Number(r.duration_minutes)}</td>
      <td>$${Number(r.fare_amount).toFixed(2)}</td>
      <td>${Math.round((r.tip_pct||0)*100)}%</td>
    `;
    tripsTableBody.appendChild(tr);
  });
  pageInfo.textContent = `${state.page}`;
}

function formatShortDate(iso){
  try{
    const d = new Date(iso);
    return d.toLocaleString();
  }catch(e){ return iso; }
}

// ------------------ Util ------------------

function showLoading(isOn){
  if(isOn) refreshBtn.textContent = 'Loading...';
  else refreshBtn.textContent = 'Refresh';
}

// initialize
init();
