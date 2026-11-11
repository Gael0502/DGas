import { getState } from "../state.js";
import { demandTrend } from "../data.js";
import { monthlyDemand } from "../factory-data.js";
import { lineChart } from "../charts.js";
import { formatNumber, pageHeader } from "../ui.js";

function updateHistory() {
  const count = Number(document.getElementById("factoryHistoryPeriod").value);
  const labels = monthlyDemand.labels.slice(-count);
  const confirmed = monthlyDemand.confirmed.slice(-count);
  const predicted = monthlyDemand.predicted.slice(-count);
  const peakIndex = confirmed.indexOf(Math.max(...confirmed));
  const total = confirmed.reduce((sum, value) => sum + value, 0);
  const state = getState();
  const recentTrend = demandTrend.confirmed.slice(-count).reduce((sum, value) => sum + value, 0);
  const priorTrend = demandTrend.confirmed.slice(0, count).reduce((sum, value) => sum + value, 0);
  const change = priorTrend ? Math.round((recentTrend - priorTrend) / priorTrend * 100) : 0;
  document.getElementById("factoryHistoryTotal").textContent = `${formatNumber(total)} kg`;
  document.getElementById("factoryHistoryPeak").textContent = labels[peakIndex] || "—";
  document.getElementById("factoryHistoryChange").textContent = `${change >= 0 ? "+" : ""}${change}%`;
  document.getElementById("factoryHistoryActive").textContent = `${formatNumber(state.confirmedKg)} kg`;
  document.getElementById("factoryHistoryChart").innerHTML = lineChart({
    confirmed,
    predicted,
    labels,
    id: "factoryMonthlyHistoryChart"
  });
  document.getElementById("factoryHistoryRows").innerHTML = labels.map((month, index) =>
    `<tr><td><strong>${month}</strong></td><td>${formatNumber(confirmed[index])} kg</td><td>${formatNumber(predicted[index])} kg</td><td>${formatNumber(predicted[index] - confirmed[index])} kg</td><td>87%</td></tr>`
  ).reverse().join("");
}

export function render() {
  const initialTotal = monthlyDemand.confirmed.reduce((sum, value) => sum + value, 0);
  const peak = monthlyDemand.labels[monthlyDemand.confirmed.indexOf(Math.max(...monthlyDemand.confirmed))];
  return `${pageHeader({ eyebrow: "Insights · aggregated patterns", title: "Historical demand analytics", subtitle: "Review monthly demand patterns, seasonal peaks and forecast performance across aggregated regional activity.", actions: '<div class="filters"><select id="factoryHistoryPeriod" aria-label="Historical time period"><option value="6">Last 6 months</option><option value="12" selected>Last 12 months</option></select></div>' })}
    <div class="grid kpi-grid">
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Historical confirmed volume</span><span class="status">12 months</span></div><div class="kpi-value" id="factoryHistoryTotal">${formatNumber(initialTotal)} kg</div><div class="kpi-foot">Aggregated monthly demand</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Peak demand month</span><span class="status predicted">Seasonality</span></div><div class="kpi-value" id="factoryHistoryPeak">${peak}</div><div class="kpi-foot">Highest monthly volume in period</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Recent trend</span><span class="status">Change</span></div><div class="kpi-value" id="factoryHistoryChange">—</div><div class="kpi-foot">Recent versus prior period</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Current confirmed demand</span><span class="status">Current</span></div><div class="kpi-value" id="factoryHistoryActive">${formatNumber(getState().confirmedKg)} kg</div><div class="kpi-foot">Current orders · separate from history</div></article>
    </div>
    <article class="card"><div class="card-head"><div><div class="card-title">Monthly demand and forecast</div><div class="card-sub">Aggregated kilograms · historical records and modelled estimates are separate</div></div><div class="legend"><span><i></i>Confirmed history</span><span><i class="forecast"></i>Forecast estimate</span></div></div><div class="chart-wrap" id="factoryHistoryChart">${lineChart({ confirmed: monthlyDemand.confirmed, predicted: monthlyDemand.predicted, labels: monthlyDemand.labels, id: "factoryMonthlyHistoryChart" })}</div></article>
    <article class="card table-card" style="margin-top:14px"><div class="table-head"><div><div class="card-title">Monthly summary</div><div class="card-sub">Aggregated demand history · no individual customer records</div></div><span class="status predicted">Model confidence · 87%</span></div><div class="table-scroll"><table><thead><tr><th>Month</th><th>Confirmed demand</th><th>Predicted demand</th><th>Variance</th><th>Confidence</th></tr></thead><tbody id="factoryHistoryRows">${monthlyDemand.labels.map((month, index) => `<tr><td><strong>${month}</strong></td><td>${formatNumber(monthlyDemand.confirmed[index])} kg</td><td>${formatNumber(monthlyDemand.predicted[index])} kg</td><td>${formatNumber(monthlyDemand.predicted[index] - monthlyDemand.confirmed[index])} kg</td><td>87%</td></tr>`).reverse().join("")}</tbody></table></div></article>
    <div class="notice blue">Historical volumes and confidence figures are illustrative planning data, not verified market history or validated model performance.</div>`;
}

export function mount() {
  document.getElementById("factoryHistoryPeriod").addEventListener("change", updateHistory);
  updateHistory();
}
