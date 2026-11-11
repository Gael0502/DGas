import { getState } from "../state.js";
import { factoryHorizons, getHorizonDays, getRegionalDemand, getSupplyTotals } from "../factory-data.js";
import { formatNumber, pageHeader, statusBadge } from "../ui.js";

function renderRows(state, days, selectedRegion = "All regions") {
  const rows = getRegionalDemand(state, days).filter(item => selectedRegion === "All regions" || item.name === selectedRegion);
  if (!rows.length) return '<tr><td colspan="7"><div class="empty-state">No supply records match this selection.</div></td></tr>';
  return rows.map(item => {
    const gap = item.predicted > item.available;
    const commitmentGap = item.confirmed > item.committed || item.predicted > item.committed;
    const signal = gap ? statusBadge("Supply gap") : commitmentGap ? statusBadge("Review allocation") : statusBadge("Covered");
    const coverage = item.predicted ? `${Math.round(item.available / item.predicted * 100)}%` : "—";
    return `<tr><td><strong>${item.name}</strong></td><td>${formatNumber(item.available)} kg</td><td>${formatNumber(item.committed)} kg</td><td>${formatNumber(item.confirmed)} kg</td><td>${formatNumber(item.predicted)} kg</td><td>${coverage}</td><td>${signal}</td></tr>`;
  }).join("");
}

function updateRows() {
  const state = getState();
  const days = getHorizonDays(document.getElementById("factorySupplyHorizon").value);
  const region = document.getElementById("factorySupplyRegion").value;
  document.getElementById("factorySupplyRows").innerHTML = renderRows(state, days, region);
  const totals = getSupplyTotals();
  const forecast = Math.round(state.forecastKg * days / 30);
  const supplyGap = Math.max(0, forecast - totals.available);
  const commitmentGap = Math.max(0, state.confirmedKg - totals.committed);
  const forecastCommitmentGap = Math.max(0, forecast - totals.committed);
  const alert = document.getElementById("factorySupplyAlert");
  alert.className = supplyGap || commitmentGap || forecastCommitmentGap ? "factory-intelligence-alert warning" : "factory-intelligence-alert";
  alert.innerHTML = supplyGap || commitmentGap || forecastCommitmentGap
    ? `<strong>Supply-demand planning alert</strong><span>${commitmentGap ? `Confirmed orders exceed reported committed supply by ${formatNumber(commitmentGap)} kg. ` : ""}${forecastCommitmentGap ? `The ${days}-day forecast is ${formatNumber(forecastCommitmentGap)} kg above reported committed supply. ` : ""}${supplyGap ? `Forecast demand also exceeds available supply by ${formatNumber(supplyGap)} kg.` : "Review allocation against the available supply estimate."}</span><small>Forecast and supply are illustrative demonstration records</small>`
    : `<strong>Supply coverage outlook</strong><span>Reported available supply is ${formatNumber(Math.max(0, totals.available - forecast))} kg above the ${days}-day forecast. Confirmed orders still require allocation against committed supply.</span><small>Forecast and supply are illustrative demonstration records</small>`;
}

export function render() {
  const state = getState();
  const totals = getSupplyTotals();
  const forecast = Math.round(state.forecastKg * 7 / 30);
  const actions = `<div class="filters"><select id="factorySupplyRegion" aria-label="Filter supply region"><option>All regions</option>${["Gasabo", "Nyarugenge", "Kicukiro", "Other Kigali"].map(region => `<option>${region}</option>`).join("")}</select><select id="factorySupplyHorizon" aria-label="Supply planning horizon">${factoryHorizons.map(item => `<option>${item.label}</option>`).join("")}</select></div>`;
  return `${pageHeader({ eyebrow: "Insights · supplier planning", title: "Supply overview", subtitle: "Compare supplier-reported available and committed quantities with confirmed and predicted demand. All records are illustrative.", actions })}
    <div class="grid kpi-grid">
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Available supply estimate</span><span class="status">Reported</span></div><div class="kpi-value">${formatNumber(totals.available)} kg</div><div class="kpi-foot">Not a verified stock balance</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Committed supply</span><span class="status">Reported</span></div><div class="kpi-value">${formatNumber(totals.committed)} kg</div><div class="kpi-foot">Separate from customer orders</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Confirmed demand</span><span class="status">Customer orders</span></div><div class="kpi-value">${formatNumber(state.confirmedKg)} kg</div><div class="kpi-foot">Live shared demand signal</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Predicted demand</span><span class="status predicted">Next 7 days</span></div><div class="kpi-value">${formatNumber(forecast)} kg</div><div class="kpi-foot">Modelled estimate · not an order</div></article>
    </div>
    <div class="factory-intelligence-alert" id="factorySupplyAlert"></div>
    <article class="card table-card"><div class="table-head"><div><div class="card-title">Regional supply and demand position</div><div class="card-sub">Reported inventory and commitments are distinct from customer orders and forecast estimates</div></div><span class="status predicted">Illustrative records</span></div><div class="table-scroll"><table><thead><tr><th>Region</th><th>Available estimate</th><th>Committed supply</th><th>Confirmed demand</th><th>Predicted demand</th><th>Available coverage</th><th>Planning signal</th></tr></thead><tbody id="factorySupplyRows">${renderRows(state, 7)}</tbody></table></div></article>
    <div class="notice blue">Supply entries are supplier-reported mock records. They do not represent verified physical stock, confirmed allocation, supplier acceptance or delivery capacity.</div>`;
}

export function mount() {
  ["factorySupplyRegion", "factorySupplyHorizon"].forEach(id =>
    document.getElementById(id).addEventListener("change", updateRows)
  );
  updateRows();
}
