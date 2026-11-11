import { getState } from "../state.js";
import { demandTrend, regions } from "../data.js";
import { factoryHorizons, getHorizonDays, getRegionalDemand, getSupplyTotals } from "../factory-data.js";
import { lineChart } from "../charts.js";
import { escapeHTML, formatNumber, pageHeader } from "../ui.js";

function updateViews() {
  const state = getState();
  const days = getHorizonDays(document.getElementById("intelligencePeriod").value);
  const region = document.getElementById("intelligenceRegion").value;
  const selected = getRegionalDemand(state, days).filter(item => region === "All regions" || region === "Kigali" || item.name === region);
  const confirmed = selected.reduce((sum, item) => sum + item.confirmed, 0);
  const predicted = selected.reduce((sum, item) => sum + item.predicted, 0);
  const category = document.getElementById("intelligenceCategory").value;
  document.getElementById("intelligenceConfirmed").textContent = `${formatNumber(confirmed)} kg`;
  document.getElementById("intelligenceForecast").textContent = `${formatNumber(predicted)} kg`;
  const max = Math.max(1, ...selected.map(item => item.confirmed), ...selected.map(item => item.predicted));
  document.getElementById("intelligenceRegionBars").innerHTML = selected.map(item => {
    const confirmedValue = item.confirmed;
    const forecastValue = item.predicted;
    const confirmedBar = category !== "Predicted" ? `<div class="demand-bar-row"><span class="bar-label">${escapeHTML(item.name)}</span><div class="bar-track"><div class="bar-fill" style="width:${confirmedValue / max * 100}%"></div></div><span class="bar-number">${formatNumber(confirmedValue)} kg</span></div>` : "";
    const predictedBar = category !== "Confirmed" ? `<div class="demand-bar-row"><span class="bar-label">${escapeHTML(item.name)} predicted</span><div class="bar-track"><div class="bar-fill forecast-fill" style="width:${forecastValue / max * 100}%"></div></div><span class="bar-number">${formatNumber(forecastValue)} kg</span></div>` : "";
    return confirmedBar + predictedBar;
  }).join("") || '<div class="empty-state">No demand signals match this region.</div>';
  const replenishmentRows = getRegionalDemand(state, 30)
    .filter(item => region === "All regions" || region === "Kigali" || item.name === region)
    .map(item => {
      const firstWindow = Math.round(item.predicted * 7 / 30);
      const secondWindow = Math.round(item.predicted * 7 / 30);
      const finalWindow = item.predicted - firstWindow - secondWindow;
      return `<tr><td><strong>${escapeHTML(item.name)}</strong></td><td>${formatNumber(firstWindow)} kg</td><td>${formatNumber(secondWindow)} kg</td><td>${formatNumber(finalWindow)} kg</td><td>87%</td></tr>`;
    }).join("");
  document.getElementById("intelligenceReplenishmentRows").innerHTML = replenishmentRows || '<tr><td colspan="5"><div class="empty-state">No regional replenishment estimates match this filter.</div></td></tr>';
  const selectedConfirmed = selected.reduce((sum, item) => sum + item.confirmed, 0);
  const share = selectedConfirmed / Math.max(1, state.confirmedKg);
  const chartConfirmed = demandTrend.confirmed.map(value => Math.round(value * share));
  const chartPredicted = demandTrend.predicted.map(value => Math.round(value * share * days / 30));
  if (category === "Confirmed") chartPredicted.fill(0);
  if (category === "Predicted") chartConfirmed.fill(0);
  const chartHost = document.getElementById("intelligenceChartHost");
  chartHost.innerHTML = lineChart({ confirmed: chartConfirmed, predicted: chartPredicted, labels: ["1 Nov","6 Nov","11 Nov","16 Nov","21 Nov","26 Nov","30 Nov"], id: "intelligenceChart" });
  document.getElementById("intelligencePeriodLabel").textContent = `${days}-day forecast horizon · monthly pattern in kilograms`;
  const supply = getSupplyTotals();
  const forecastGap = Math.max(0, predicted - supply.available);
  const commitmentGap = Math.max(0, predicted - supply.committed);
  const supplyAlert = document.getElementById("intelligenceSupplyAlert");
  supplyAlert.className = forecastGap || commitmentGap ? "factory-intelligence-alert warning" : "factory-intelligence-alert";
  supplyAlert.innerHTML = forecastGap || commitmentGap
    ? `<strong>Supply-demand planning alert</strong><span>${commitmentGap ? `Forecast demand is ${formatNumber(commitmentGap)} kg above reported committed supply. ` : ""}${forecastGap ? `It also exceeds reported available supply by ${formatNumber(forecastGap)} kg.` : "Review allocation against the available supply estimate."}</span><small>Illustrative supply records · not a stock reservation</small>`
    : `<strong>Supply coverage outlook</strong><span>Reported available supply currently covers the ${days}-day forecast in this view. Confirmed and predicted demand are counted separately.</span><small>Illustrative supply records · not a stock reservation</small>`;
  document.getElementById("intelligenceAvailable").textContent = `${formatNumber(supply.available)} kg`;
  document.getElementById("intelligenceCommitted").textContent = `${formatNumber(supply.committed)} kg`;
  document.getElementById("intelligenceSupplyBar").style.width = `${Math.min(100, predicted / Math.max(1, supply.available) * 100)}%`;
  document.getElementById("intelligenceSupplyCoverage").textContent = `${(supply.available / Math.max(1, predicted) * 100).toFixed(0)}%`;
}

export function render({ role } = {}) {
  const state = getState();
  const isFactory = role === "factory";
  const actions = `<div class="filters"><select id="intelligencePeriod" aria-label="Demand period">${factoryHorizons.map(item => `<option>${item.label}</option>`).join("")}</select><select id="intelligenceRegion" aria-label="Demand region"><option>All regions</option>${regions.map(region => `<option>${escapeHTML(region)}</option>`).join("")}</select><select id="intelligenceCategory" aria-label="Demand category"><option>All categories</option><option>Confirmed</option><option>Predicted</option></select></div>`;
  const daily = [290, 340, 315, 390, 410, 355, 280];
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const maxDay = Math.max(...daily);
  return `${pageHeader({ eyebrow: isFactory ? "Supplier workspace" : "Platform intelligence", title: isFactory ? "Demand forecasting" : "Demand intelligence", subtitle: "Separate confirmed customer orders from modelled demand to inform supply planning.", actions })}
    <div class="grid kpi-grid three">
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Confirmed customer orders</span><span class="status">Booked intent</span></div><div class="kpi-value" id="intelligenceConfirmed">${formatNumber(state.confirmedKg)} kg</div><div class="kpi-foot">Customer-confirmed demand · not a forecast</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Predicted demand</span><span class="status predicted">Modelled</span></div><div class="kpi-value" id="intelligenceForecast">${formatNumber(Math.round(state.forecastKg * 7 / 30))} kg</div><div class="kpi-foot">Planning estimate · next 7 days</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Forecast confidence</span><span class="status">Signal quality</span></div><div class="kpi-value">87%</div><div class="kpi-foot">Based on recent demo patterns</div></article>
    </div>
    <div class="grid dashboard-grid">
      <article class="card">${`<div class="card-head"><div><div class="card-title">Demand forecast</div><div class="card-sub" id="intelligencePeriodLabel">7-day forecast horizon · monthly pattern in kilograms</div></div><div class="legend"><span><i></i>Confirmed</span><span><i class="forecast"></i>Predicted</span></div></div>`}<div class="chart-wrap" id="intelligenceChartHost">${lineChart({ confirmed: demandTrend.confirmed, predicted: demandTrend.predicted, labels: ["1 Nov","6 Nov","11 Nov","16 Nov","21 Nov","26 Nov","30 Nov"], id: "intelligenceChart" })}</div></article>
      <article class="card">${`<div class="card-head"><div><div class="card-title">Regional demand split</div><div class="card-sub">Confirmed and predicted demand · kilograms</div></div></div>`}<div class="legend-inline"><span><i></i>Confirmed</span><span><i class="forecast"></i>Predicted</span></div><div class="demand-bars" id="intelligenceRegionBars"></div></article>
    </div>
    <div class="grid dashboard-grid">
      <article class="card">${`<div class="card-head"><div><div class="card-title">Demand by day</div><div class="card-sub">Illustrative weekly pattern · kilograms per day</div></div></div>`}<div class="demand-bars">${days.map((day, index) => `<div class="demand-bar-row"><span class="bar-label">${day}</span><div class="bar-track"><div class="bar-fill" style="width:${daily[index] / maxDay * 100}%"></div></div><span class="bar-number">${formatNumber(daily[index])} kg</span></div>`).join("")}</div></article>
      <article class="card">${`<div class="card-head"><div><div class="card-title">Historical demand trend</div><div class="card-sub">Aggregated monthly consumption · kilograms</div></div></div>`}<div class="chart-wrap">${lineChart({ confirmed: [1100, 1260, 1180, 1450, 1390, 1610], predicted: [1200, 1300, 1270, 1490, 1510, 1700], labels: ["Jun","Jul","Aug","Sep","Oct","Nov"], compact: true, id: "factoryHistoryChart" })}</div></article>
    </div>
    <article class="card table-card" style="margin-bottom:14px"><div class="table-head"><div><div class="card-title">Expected replenishment windows</div><div class="card-sub">Aggregated regional forecast windows · no individual customer refill dates or histories are exposed</div></div><span class="status predicted">30-day estimate</span></div><div class="table-scroll"><table><thead><tr><th>Region</th><th>Next 7 days</th><th>Days 8-14</th><th>Days 15-30</th><th>Confidence</th></tr></thead><tbody id="intelligenceReplenishmentRows">${getRegionalDemand(state, 30).map(item => { const first = Math.round(item.predicted * 7 / 30); const second = Math.round(item.predicted * 7 / 30); return `<tr><td><strong>${escapeHTML(item.name)}</strong></td><td>${formatNumber(first)} kg</td><td>${formatNumber(second)} kg</td><td>${formatNumber(item.predicted - first - second)} kg</td><td>87%</td></tr>`; }).join("")}</tbody></table></div></article>
    <div class="grid dashboard-grid"><article class="card">${`<div class="card-head"><div><div class="card-title">Supply position</div><div class="card-sub">Illustrative inventory records</div></div></div>`}<div class="supply-wrap"><div class="supply-stat"><span>Available supply</span><strong id="intelligenceAvailable">${formatNumber(getSupplyTotals().available)} kg</strong></div><div class="supply-stat"><span>Committed supply</span><strong id="intelligenceCommitted">${formatNumber(getSupplyTotals().committed)} kg</strong></div><div class="supply-progress"><span id="intelligenceSupplyBar" style="width:${Math.min(100, state.forecastKg * 7 / 30 / getSupplyTotals().available * 100)}%"></span></div><div class="supply-stat"><span>Availability vs. forecast</span><strong id="intelligenceSupplyCoverage">${(getSupplyTotals().available / (state.forecastKg * 7 / 30) * 100).toFixed(0)}%</strong></div><div class="factory-intelligence-alert" id="intelligenceSupplyAlert"></div><div class="notice blue">Predicted demand is a planning estimate, not a confirmed order, stock reservation or delivery instruction.</div></div></article></div>
    <article class="card table-card"><div class="table-head"><div><div class="card-title">Demand signal records</div><div class="card-sub">Confirmed customer intent is recorded separately from modelled demand</div></div><span class="status">Demo records</span></div><div class="table-scroll"><table><thead><tr><th>Region</th><th>Confirmed orders</th><th>Predicted demand</th><th>Available supply</th><th>Confidence</th><th>Signal type</th></tr></thead><tbody>${getRegionalDemand(state, 7).map(item => `<tr><td><strong>${escapeHTML(item.name)}</strong></td><td>${formatNumber(item.confirmed)} kg</td><td>${formatNumber(item.predicted)} kg</td><td>${formatNumber(item.available)} kg</td><td>87%</td><td><span class="status">Confirmed</span> <span class="status predicted">Predicted</span></td></tr>`).join("")}</tbody></table></div></article>`;
}

export function mount() {
  ["intelligencePeriod", "intelligenceRegion", "intelligenceCategory"].forEach(id => document.getElementById(id).addEventListener("change", updateViews));
  updateViews();
}
