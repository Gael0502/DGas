import { getState } from "../state.js";
import { regions } from "../data.js";
import { factoryHorizons, getDemandTrend, getHorizonDays, getRegionalDemand, getSupplyTotals, weeklyDemand } from "../factory-data.js";
import { lineChart } from "../charts.js";
import { escapeHTML, formatNumber, pageHeader, statusBadge } from "../ui.js";

function renderRegionalRows(state, days, selectedRegion = "All regions", category = "All demand") {
  const rows = getRegionalDemand(state, days).filter(item => selectedRegion === "All regions" || item.name === selectedRegion);
  if (!rows.length) return '<tr><td colspan="5"><div class="empty-state">No regional demand matches this filter.</div></td></tr>';
  return rows.map(item => `<tr><td><a class="table-link" href="/factory/regional-demand" data-route="/factory/regional-demand"><strong>${escapeHTML(item.name)}</strong></a></td><td>${category === "Predicted" ? "—" : `${formatNumber(item.confirmed)} kg`}</td><td>${category === "Confirmed" ? "—" : `${formatNumber(item.predicted)} kg`}</td><td>${formatNumber(item.available)} kg</td><td>${item.predicted > item.available ? statusBadge("Supply gap") : item.predicted > item.committed || item.confirmed > item.committed ? statusBadge("Review allocation") : statusBadge("Covered")}</td></tr>`).join("");
}

function renderOrders(state, selectedRegion = "All regions") {
  const orders = state.orders.filter(order => order.status !== "Cancelled" && (selectedRegion === "All regions" || order.region === selectedRegion)).slice(0, 5);
  if (!orders.length) return '<tr><td colspan="5"><div class="empty-state">No incoming order signals match this region.</div></td></tr>';
  return orders.map(order => `<tr><td><strong>${escapeHTML(order.id)}</strong></td><td>${escapeHTML(order.region)}</td><td>${formatNumber(order.kg)} kg</td><td>${escapeHTML(order.created)}</td><td>${statusBadge(order.status)}</td></tr>`).join("");
}

function renderDailyBars(state, selectedRegion = "All regions") {
  const rows = getRegionalDemand(state, 7);
  const totalConfirmed = rows.reduce((sum, item) => sum + item.confirmed, 0);
  const selectedConfirmed = rows.filter(item => selectedRegion === "All regions" || item.name === selectedRegion)
    .reduce((sum, item) => sum + item.confirmed, 0);
  const share = totalConfirmed > 0 ? selectedConfirmed / totalConfirmed : 1;
  const maximum = Math.max(...weeklyDemand.predicted);
  return weeklyDemand.labels.map((day, index) => {
    const confirmed = Math.round(weeklyDemand.confirmed[index] * share);
    const predicted = Math.round(weeklyDemand.predicted[index] * share);
    return `<div class="demand-bar-row"><span class="bar-label">${day}</span><div class="factory-dual-track"><i class="factory-confirmed-bar" style="width:${confirmed / maximum * 100}%"></i><i class="factory-predicted-bar" style="width:${predicted / maximum * 100}%"></i></div><span class="bar-number">${formatNumber(predicted)} kg</span></div>`;
  }).join("");
}

function updateViews() {
  const state = getState();
  const regionFilter = document.getElementById("factoryDashboardRegion").value;
  const days = getHorizonDays(document.getElementById("factoryDashboardHorizon").value);
  const category = document.getElementById("factoryDashboardCategory").value;
  const regionMetrics = getRegionalDemand(state, days).filter(item => regionFilter === "All regions" || item.name === regionFilter);
  const confirmed = regionMetrics.reduce((sum, item) => sum + item.confirmed, 0);
  const predicted = regionMetrics.reduce((sum, item) => sum + item.predicted, 0);
  const trend = getDemandTrend(state, regionFilter, days);
  if (category === "Confirmed") trend.predicted = trend.predicted.map(() => 0);
  if (category === "Predicted") trend.confirmed = trend.confirmed.map(() => 0);
  const supply = getSupplyTotals();

  document.getElementById("factoryDashboardConfirmed").innerHTML = `${formatNumber(confirmed)}<small> kg</small>`;
  document.getElementById("factoryDashboardForecast").innerHTML = `${formatNumber(predicted)}<small> kg</small>`;
  document.getElementById("factoryDashboardRegionCount").textContent = String(regionMetrics.length);
  document.getElementById("factoryDashboardHorizonLabel").textContent = `${days} days`;
  document.getElementById("factoryDashboardPeriodLabel").textContent = `Illustrative monthly pattern · ${regionFilter === "All regions" ? "all regions" : escapeHTML(regionFilter)}`;
  document.getElementById("factoryDashboardChart").innerHTML = lineChart({
    confirmed: trend.confirmed,
    predicted: trend.predicted,
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    id: "factoryOverviewChart"
  });
  document.getElementById("factoryDashboardRegions").innerHTML = renderRegionalRows(state, days, regionFilter, category);
  document.getElementById("factoryDashboardOrders").innerHTML = renderOrders(state, regionFilter);
  document.getElementById("factoryDashboardDaily").innerHTML = renderDailyBars(state, regionFilter);
  document.getElementById("factoryDashboardSupply").innerHTML = `${formatNumber(supply.available)} kg`;
  document.getElementById("factoryDashboardCommitted").innerHTML = `${formatNumber(supply.committed)} kg`;

  const commitmentGap = Math.max(0, confirmed - supply.committed);
  const forecastCommitmentGap = Math.max(0, predicted - supply.committed);
  const forecastGap = Math.max(0, predicted - supply.available);
  const alert = document.getElementById("factoryDashboardAlert");
  alert.className = commitmentGap || forecastCommitmentGap || forecastGap ? "factory-intelligence-alert warning" : "factory-intelligence-alert";
  alert.innerHTML = commitmentGap || forecastCommitmentGap
    ? `<strong>DirectGas Intelligence Alert</strong><span>${commitmentGap ? `Confirmed demand exceeds reported committed supply by ${formatNumber(commitmentGap)} kg. ` : ""}${forecastCommitmentGap ? `The selected forecast is ${formatNumber(forecastCommitmentGap)} kg above reported committed supply. ` : ""}${forecastGap ? `The forecast also exceeds reported available supply by ${formatNumber(forecastGap)} kg.` : "Review planned allocation against available supplier stock."}</span><small>Illustrative supply records · not a stock reservation</small>`
    : forecastGap
      ? `<strong>DirectGas Intelligence Alert</strong><span>Forecast demand in this view exceeds reported available supply by ${formatNumber(forecastGap)} kg. Review capacity for the selected horizon.</span><small>Illustrative forecast · 87% demo confidence</small>`
      : `<strong>DirectGas Intelligence</strong><span>Reported available supply currently covers the ${days}-day forecast for this view. Confirmed and predicted demand remain separate.</span><small>Illustrative supply records · not a stock reservation</small>`;
}

export function render() {
  const state = getState();
  const actions = `<div class="filters"><select id="factoryDashboardRegion" aria-label="Filter dashboard region"><option>All regions</option>${regions.map(region => `<option>${escapeHTML(region)}</option>`).join("")}</select><select id="factoryDashboardHorizon" aria-label="Forecast horizon">${factoryHorizons.map(item => `<option>${item.label}</option>`).join("")}</select><select id="factoryDashboardCategory" aria-label="Demand category"><option>All demand</option><option>Confirmed</option><option>Predicted</option></select></div>`;
  const supply = getSupplyTotals();
  return `${pageHeader({ eyebrow: "Supplier workspace · aggregated market signals", title: "Factory Intelligence Centre", subtitle: "Understand how much demand is confirmed, where it is concentrated, and what the next planning horizon may bring.", actions })}
    <div class="grid kpi-grid">
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Confirmed demand</span><span class="status">Live orders</span></div><div class="kpi-value" id="factoryDashboardConfirmed">${formatNumber(state.confirmedKg)}<small> kg</small></div><div class="kpi-foot">Customer-confirmed demand only</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Predicted demand</span><span class="status predicted">Modelled</span></div><div class="kpi-value" id="factoryDashboardForecast">${formatNumber(Math.round(state.forecastKg * 7 / 30))}<small> kg</small></div><div class="kpi-foot">For <span id="factoryDashboardHorizonLabel">7 days</span> · separate from orders</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Demand regions</span><span class="status">Kigali coverage</span></div><div class="kpi-value" id="factoryDashboardRegionCount">${regions.length}</div><div class="kpi-foot">Aggregated service areas</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Forecast confidence</span><span class="status">Illustrative</span></div><div class="kpi-value">87%</div><div class="kpi-foot">Demonstration model confidence</div></article>
    </div>
    <div class="factory-intelligence-alert" id="factoryDashboardAlert" aria-live="polite"></div>
    <div class="grid dashboard-grid">
      <article class="card"><div class="card-head"><div><div class="card-title">Demand trend</div><div class="card-sub" id="factoryDashboardPeriodLabel">Illustrative monthly pattern · all regions</div></div><div class="legend"><span><i></i>Confirmed</span><span><i class="forecast"></i>Predicted</span></div></div><div class="chart-wrap" id="factoryDashboardChart">${lineChart({ confirmed: [110,126,118,145,139,161,154,172,168,181,174,190], predicted: [120,130,127,149,151,170,165,179,180,191,193,204], labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], id: "factoryOverviewChart" })}</div></article>
      <article class="card"><div class="card-head"><div><div class="card-title">Regional demand</div><div class="card-sub">Confirmed orders and ${escapeHTML(factoryHorizons[0].label.toLowerCase())} forecast</div></div><a class="btn btn-small" href="/factory/regional-demand" data-route="/factory/regional-demand">Explore regions</a></div><div class="table-scroll"><table><thead><tr><th>Region</th><th>Confirmed</th><th>Forecast</th><th>Available</th><th>Signal</th></tr></thead><tbody id="factoryDashboardRegions">${renderRegionalRows(state, 7)}</tbody></table></div></article>
    </div>
    <div class="grid dashboard-grid">
      <article class="card"><div class="card-head"><div><div class="card-title">Demand by day</div><div class="card-sub">Illustrative weekly purchasing pattern · no customer identities</div></div><div class="legend"><span><i></i>Confirmed</span><span><i class="forecast"></i>Predicted</span></div></div><div class="demand-bars" id="factoryDashboardDaily">${renderDailyBars(state)}</div></article>
      <article class="card"><div class="card-head"><div><div class="card-title">Supply planning</div><div class="card-sub">Supplier-reported demonstration records</div></div><a class="btn btn-small" href="/factory/supply-records" data-route="/factory/supply-records">View supply</a></div><div class="supply-wrap"><div class="supply-stat"><span>Available estimate</span><strong id="factoryDashboardSupply">${formatNumber(supply.available)} kg</strong></div><div class="supply-stat"><span>Committed supply</span><strong id="factoryDashboardCommitted">${formatNumber(supply.committed)} kg</strong></div><div class="supply-stat"><span>Confirmed demand</span><strong>${formatNumber(state.confirmedKg)} kg</strong></div><div class="notice blue">Availability and commitments are illustrative supplier inputs, not verified stock or delivery capacity.</div></div></article>
    </div>
    <article class="card table-card"><div class="table-head"><div><div class="card-title">Incoming customer demand</div><div class="card-sub">Order reference, region, quantity and status only · private customer details are not shared</div></div><a class="btn btn-small" href="/factory/incoming-orders" data-route="/factory/incoming-orders">All incoming orders</a></div><div class="table-scroll"><table><thead><tr><th>Order reference</th><th>Region</th><th>Quantity</th><th>Received</th><th>Status</th></tr></thead><tbody id="factoryDashboardOrders">${renderOrders(state)}</tbody></table></div></article>
    <div class="notice blue">All figures and demand forecasts are fictional demonstration data. They are planning signals only; licensed operators remain responsible for physical LPG handling and fulfilment.</div>`;
}

export function mount() {
  ["factoryDashboardRegion", "factoryDashboardHorizon", "factoryDashboardCategory"].forEach(id =>
    document.getElementById(id).addEventListener("change", updateViews)
  );
  updateViews();
}
