import { getState } from "../state.js";
import { regions } from "../data.js";
import { factoryHorizons, getDemandTrend, getHorizonDays, getRegionalDemand, getSupplyTotals } from "../factory-data.js";
import { lineChart } from "../charts.js";
import { escapeHTML, formatNumber, pageHeader, statusBadge } from "../ui.js";

function renderDemandRows(state, days, category, selectedRegion) {
  const rows = getRegionalDemand(state, days).filter(item => selectedRegion === "All regions" || item.name === selectedRegion);
  if (!rows.length) return '<tr><td colspan="5"><div class="empty-state">No regional demand signals match this selection.</div></td></tr>';
  return rows.map(item => {
    const signal = item.predicted > item.available ? statusBadge("Supply gap") : item.predicted > item.committed || item.confirmed > item.committed ? statusBadge("Review allocation") : statusBadge("Covered");
    const confirmed = category === "Predicted" ? "—" : `${formatNumber(item.confirmed)} kg`;
    const predicted = category === "Confirmed" ? "—" : `${formatNumber(item.predicted)} kg`;
    return `<tr><td><strong>${escapeHTML(item.name)}</strong></td><td>${confirmed}</td><td>${predicted}</td><td>${formatNumber(item.available)} kg</td><td>${signal}</td></tr>`;
  }).join("");
}

function updateViews() {
  const state = getState();
  const selectedRegion = document.getElementById("regionalDemandRegion").value;
  const days = getHorizonDays(document.getElementById("regionalDemandHorizon").value);
  const category = document.getElementById("regionalDemandCategory").value;
  const rows = getRegionalDemand(state, days).filter(item => selectedRegion === "All regions" || item.name === selectedRegion);
  const confirmed = rows.reduce((sum, item) => sum + item.confirmed, 0);
  const predicted = rows.reduce((sum, item) => sum + item.predicted, 0);
  const supply = getSupplyTotals();
  const trend = getDemandTrend(state, selectedRegion, days);
  if (category === "Confirmed") trend.predicted = trend.predicted.map(() => 0);
  if (category === "Predicted") trend.confirmed = trend.confirmed.map(() => 0);
  document.getElementById("regionalDemandConfirmed").textContent = `${formatNumber(confirmed)} kg`;
  document.getElementById("regionalDemandForecast").textContent = `${formatNumber(predicted)} kg`;
  document.getElementById("regionalDemandCoverage").textContent = `${formatNumber(supply.available)} kg`;
  document.getElementById("regionalDemandChartLabel").textContent = `${selectedRegion === "All regions" ? "All Kigali service areas" : escapeHTML(selectedRegion)} · ${days}-day outlook`;
  document.getElementById("regionalDemandChart").innerHTML = lineChart({
    confirmed: trend.confirmed,
    predicted: trend.predicted,
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    id: "regionalDemandTrendChart"
  });
  document.getElementById("regionalDemandRows").innerHTML = renderDemandRows(state, days, category, selectedRegion);
  const orders = state.orders.filter(order => order.status !== "Cancelled" && (selectedRegion === "All regions" || order.region === selectedRegion)).slice(0, 8);
  document.getElementById("regionalOrderRows").innerHTML = orders.length
    ? orders.map(order => `<tr><td><strong>${escapeHTML(order.id)}</strong></td><td>${escapeHTML(order.region)}</td><td>${formatNumber(order.kg)} kg</td><td>${escapeHTML(order.created)}</td><td>${statusBadge(order.status)}</td></tr>`).join("")
    : '<tr><td colspan="5"><div class="empty-state">No incoming orders for this area yet.</div></td></tr>';
}

export function render() {
  const queryRegion = new URLSearchParams(window.location.search).get("region");
  const initialRegion = regions.includes(queryRegion) ? queryRegion : "All regions";
  const actions = `<div class="filters"><select id="regionalDemandRegion" aria-label="Choose a demand region"><option ${initialRegion === "All regions" ? "selected" : ""}>All regions</option>${regions.map(region => `<option ${initialRegion === region ? "selected" : ""}>${escapeHTML(region)}</option>`).join("")}</select><select id="regionalDemandHorizon" aria-label="Choose forecast horizon">${factoryHorizons.map(item => `<option>${item.label}</option>`).join("")}</select><select id="regionalDemandCategory" aria-label="Choose demand category"><option>All demand</option><option>Confirmed</option><option>Predicted</option></select></div>`;
  const state = getState();
  const supply = getSupplyTotals();
  const initialRows = renderDemandRows(state, 7, "All demand", initialRegion);
  const initialOrders = state.orders.filter(order => order.status !== "Cancelled" && (initialRegion === "All regions" || order.region === initialRegion)).slice(0, 8);
  return `${pageHeader({ eyebrow: "Market intelligence", title: "Regional demand", subtitle: "Explore aggregated customer demand by service area, compare the forecast, and review non-identifying order signals.", actions })}
    <div class="grid kpi-grid three">
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Confirmed demand</span><span class="status">Customer orders</span></div><div class="kpi-value" id="regionalDemandConfirmed">${formatNumber(state.confirmedKg)} kg</div><div class="kpi-foot">Current workspace orders</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Predicted demand</span><span class="status predicted">7-day estimate</span></div><div class="kpi-value" id="regionalDemandForecast">${formatNumber(Math.round(state.forecastKg * 7 / 30))} kg</div><div class="kpi-foot">Modelled separately from confirmed orders</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Reported available supply</span><span class="status">Estimate</span></div><div class="kpi-value" id="regionalDemandCoverage">${formatNumber(supply.available)} kg</div><div class="kpi-foot">Illustrative supplier-reported quantity</div></article>
    </div>
    <div class="grid dashboard-grid">
      <article class="card"><div class="card-head"><div><div class="card-title">Demand trend by area</div><div class="card-sub" id="regionalDemandChartLabel">All Kigali service areas · 7-day outlook</div></div><div class="legend"><span><i></i>Confirmed</span><span><i class="forecast"></i>Predicted</span></div></div><div class="chart-wrap" id="regionalDemandChart">${lineChart({ confirmed: [100,120,110,140,130,150,145,160,155,170,165,180], predicted: [110,130,125,150,155,170,165,180,185,195,200,215], labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], id: "regionalDemandTrendChart" })}</div></article>
      <article class="card"><div class="card-head"><div><div class="card-title">Regional planning signals</div><div class="card-sub">Volumes in kg · forecast period set above</div></div></div><div class="table-scroll"><table><thead><tr><th>Region</th><th>Confirmed</th><th>Predicted</th><th>Available</th><th>Signal</th></tr></thead><tbody id="regionalDemandRows">${initialRows}</tbody></table></div></article>
    </div>
    <article class="card table-card"><div class="table-head"><div><div class="card-title">Order signals by area</div><div class="card-sub">Aggregated records only. No customer names, phone numbers or personal history are available here.</div></div><a class="btn btn-small" href="/factory/incoming-orders" data-route="/factory/incoming-orders">Incoming orders</a></div><div class="table-scroll"><table><thead><tr><th>Order reference</th><th>Region</th><th>Quantity</th><th>Received</th><th>Status</th></tr></thead><tbody id="regionalOrderRows">${initialOrders.length ? initialOrders.map(order => `<tr><td><strong>${escapeHTML(order.id)}</strong></td><td>${escapeHTML(order.region)}</td><td>${formatNumber(order.kg)} kg</td><td>${escapeHTML(order.created)}</td><td>${statusBadge(order.status)}</td></tr>`).join("") : '<tr><td colspan="5"><div class="empty-state">No customer order signals yet.</div></td></tr>'}</tbody></table></div></article>
    <div class="notice blue">Regional forecasts and supply quantities are illustrative planning assumptions, not verified market figures, physical stock or delivery commitments.</div>`;
}

export function mount() {
  ["regionalDemandRegion", "regionalDemandHorizon", "regionalDemandCategory"].forEach(id =>
    document.getElementById(id).addEventListener("change", updateViews)
  );
  updateViews();
}
