const mockTrips = [];
for (let i = 0; i < 100; i++) {
  const distance = parseFloat((Math.random() * 20 + 0.5).toFixed(2));
  const fare = parseFloat((distance * (Math.random() * 3 + 1)).toFixed(2));
  const tipPct = parseFloat((Math.random() * 20).toFixed(1));
  const duration = parseFloat((distance / (Math.random() * 60 + 10) * 60).toFixed(1));
  const hour = Math.floor(Math.random() * 24);
  const pickup = `Zone ${Math.floor(Math.random() * 10 + 1)}`;
  const dropoff = `Zone ${Math.floor(Math.random() * 10 + 1)}`;
  mockTrips.push({ pickup, dropoff, distance, fare, tipPct, duration, hour });
}

let currentPage = 1;
const rowsPerPage = 10;

let timeChart, distanceChart, zonesChart;

function paginate(data, page, rows) {
  const start = (page - 1) * rows;
  return data.slice(start, start + rows);
}

function updateStats(data) {
  const total = data.length;
  const avgFare = (data.reduce((a, b) => a + b.fare, 0) / total || 0).toFixed(2);
  const avgSpeed = (data.reduce((a, b) => a + (b.distance / (b.duration / 60)), 0) / total || 0).toFixed(2);
  const avgTip = (data.reduce((a, b) => a + b.tipPct, 0) / total || 0).toFixed(1);

  document.getElementById("totalTrips").textContent = total;
  document.getElementById("avgFare").textContent = `$${avgFare}`;
  document.getElementById("avgSpeed").textContent = `${avgSpeed} km/h`;
  document.getElementById("avgTipPct").textContent = `${avgTip}%`;
}

function updateTable(data) {
  const tbody = document.querySelector("#tripsTable tbody");
  tbody.innerHTML = "";
  const pageData = paginate(data, currentPage, rowsPerPage);
  pageData.forEach(trip => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${trip.pickup}</td>
      <td>${trip.dropoff}</td>
      <td>${trip.distance}</td>
      <td>${trip.duration}</td>
      <td>${trip.fare}</td>
      <td>${trip.tipPct}</td>
    `;
    tbody.appendChild(tr);
  });
  document.getElementById("pageInfo").textContent = currentPage;
}

function updateCharts(data) {
  const tripsByHour = Array(24).fill(0);
  data.forEach(d => tripsByHour[d.hour]++);
  const ctxTime = document.getElementById("timeChart").getContext("2d");
  if (timeChart) timeChart.destroy();
  timeChart = new Chart(ctxTime, {
    type: "line",
    data: {
      labels: Array.from({ length: 24 }, (_, i) => i),
      datasets: [{ label: "Trips", data: tripsByHour, borderColor: "blue", tension: 0.3 }]
    },
    options: { responsive: true }
  });
  
  const distanceBins = Array(20).fill(0);
  data.forEach(d => {
    const idx = Math.min(Math.floor(d.distance), 19);
    distanceBins[idx]++;
  });
  const ctxDist = document.getElementById("distanceChart").getContext("2d");
  if (distanceChart) distanceChart.destroy();
  distanceChart = new Chart(ctxDist, {
    type: "bar",
    data: {
      labels: Array.from({ length: 20 }, (_, i) => i + " km"),
      datasets: [{ label: "Trips", data: distanceBins, backgroundColor: "green" }]
    },
    options: { responsive: true }
  });

  const zonesCount = {};
  data.forEach(d => zonesCount[d.pickup] = (zonesCount[d.pickup] || 0) + 1);
  const topZones = Object.entries(zonesCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const ctxZones = document.getElementById("zonesChart").getContext("2d");
  if (zonesChart) zonesChart.destroy();
  zonesChart = new Chart(ctxZones, {
    type: "pie",
    data: {
      labels: topZones.map(t => t[0]),
      datasets: [{ label: "Trips", data: topZones.map(t => t[1]), backgroundColor: ["red","blue","green","orange","purple"] }]
    },
    options: { responsive: true }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const hourSelect = document.getElementById("hourFilter");
  for (let i = 0; i < 24; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i.toString().padStart(2, "0");
    hourSelect.appendChild(option);
  }

  updateStats(mockTrips);
  updateTable(mockTrips);
  updateCharts(mockTrips);

  document.getElementById("applyFilters").addEventListener("click", () => {
    let filtered = [...mockTrips];
    const start = document.getElementById("startDate").value;
    const end = document.getElementById("endDate").value;
    const hour = document.getElementById("hourFilter").value;
    const minDist = parseFloat(document.getElementById("minDistance").value) || 0;
    const maxDist = parseFloat(document.getElementById("maxDistance").value) || Infinity;
    const minFare = parseFloat(document.getElementById("minFare").value) || 0;
    const maxFare = parseFloat(document.getElementById("maxFare").value) || Infinity;

    if (hour) filtered = filtered.filter(t => t.hour == hour);
    filtered = filtered.filter(t => t.distance >= minDist && t.distance <= maxDist);
    filtered = filtered.filter(t => t.fare >= minFare && t.fare <= maxFare);

    currentPage = 1;
    updateStats(filtered);
    updateTable(filtered);
    updateCharts(filtered);
  });

  document.getElementById("resetFilters").addEventListener("click", () => {
    document.getElementById("startDate").value = "";
    document.getElementById("endDate").value = "";
    document.getElementById("hourFilter").value = "";
    document.getElementById("minDistance").value = "";
    document.getElementById("maxDistance").value = "";
    document.getElementById("minFare").value = "";
    document.getElementById("maxFare").value = "";
    currentPage = 1;
    updateStats(mockTrips);
    updateTable(mockTrips);
    updateCharts(mockTrips);
  });

  document.getElementById("refreshBtn").addEventListener("click", () => {
    currentPage = 1;
    updateStats(mockTrips);
    updateTable(mockTrips);
    updateCharts(mockTrips);
    alert("Data refreshed!");
  });

  document.getElementById("prevPage").addEventListener("click", () => {
    if (currentPage > 1) currentPage--;
    updateTable(mockTrips);
  });

  document.getElementById("nextPage").addEventListener("click", () => {
    if (currentPage * rowsPerPage < mockTrips.length) currentPage++;
    updateTable(mockTrips);
  });
});
