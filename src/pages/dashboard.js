import { getState } from "../state.js";
import { demandTrend, regions } from "../data.js";
import { lineChart } from "../charts.js";
import { cardHeader, escapeHTML, formatNumber, kpiCard, pageHeader, statusBadge } from "../ui.js";

const regionColors = ["", "b", "c", "d"];

function renderRegions(state, filter) {
  const selected = filter === "All regions" || filter === "Kigali"
    ? regions
    : regions.filter(region => region === filter);
  const max = Math.max(1, ...Object.values(state.regions));
  if (!selected.length) return '<div class="empty-state">No confirmed demand in this region yet.</div>';
  return selected.map(region => {
    const value = state.regions[region] || 0;
    return `<div class="region-row-wrap"><div class="region-row"><span class="region-name"><i class="region-dot ${regionColors[regions.indexOf(region)]}"></i>${escapeHTML(region)}</span><span class="region-val">${formatNumber(value)} kg</span></div><div class="bar-track region-full"><div class="bar-fill" style="width:${Math.max(3, value / max * 100)}%"></div></div></div>`;
  }).join("");
}

function renderTransactions(state) {
  return state.orders.slice(0, 4).map(order => `<div class="transaction"><div class="tx-person"><span class="tx-avatar">${escapeHTML(order.initials)}</span><span><span class="tx-name">${escapeHTML(order.customer)}</span><span class="tx-detail">${escapeHTML(order.region)} · ${escapeHTML(order.created)}</span></span></div><div class="tx-right"><div class="tx-amount">${formatNumber(order.kg)} kg</div>${statusBadge(order.status)}</div></div>`).join("");
}

export function render() {
  const state = getState();
  const actions = `<div class="filters"><select id="dashboardPeriod" aria-label="Dashboard period"><option>Last 30 days</option><option>Last 7 days</option><option>This quarter</option></select><select id="dashboardRegion" aria-label="Dashboard region"><option>All regions</option><option>Kigali</option>${regions.map(region => `<option>${escapeHTML(region)}</option>`).join("")}</select></div><a class="btn btn-primary" href="/orders" data-route="/orders">＋ New demo order</a>`;
  const chartConfirmed = demandTrend.confirmed.map((value, index) => value + (index > 8 ? Math.round((state.confirmedKg - 3420) / 3) : 0));
  const chartPredicted = demandTrend.predicted.map((value, index) => value + (index > 8 ? Math.round((state.confirmedKg - 3420) / 5) : 0));
  return `${pageHeader({ eyebrow: "Network overview", title: "Management control tower", subtitle: "A live view of demonstration demand, fulfilment and platform activity across Rwanda.", actions })}
    <div class="grid kpi-grid">
      ${kpiCard("Total customers", formatNumber(state.customers.length), "Illustrative registered profiles", "users")}
      ${kpiCard("Total suppliers", formatNumber(state.suppliers.length), "Demonstration partner records", "factory")}
      ${kpiCard("Total confirmed orders", formatNumber(state.orders.filter(order => order.status !== "Cancelled").length), "Confirmed customer records · demo only", "package")}
      ${kpiCard("Confirmed demand", `${formatNumber(state.confirmedKg)}<small> kg</small>`, "Customer-confirmed orders only", "coins", true)}
      ${kpiCard("Forecast demand", `${formatNumber(state.forecastKg)}<small> kg</small>`, "Modelled estimate · 87% confidence", "chart", true)}
      ${kpiCard("Estimated customer savings", `RWF ${formatNumber(state.orderCount * 600)}`, "Illustrative RWF 600/order · not verified savings", "coins")}
      ${kpiCard("Illustrative platform revenue", `RWF ${(1.24 + (state.orderCount - 248) * .005).toFixed(2)}M`, "Demo fee model · not actual revenue", "factory")}
      ${kpiCard("Reported demonstration orders", formatNumber(state.orderCount), "Illustrative platform-wide model count", "package")}
    </div>
    <div class="grid dashboard-grid">
      <article class="card">${cardHeader("Demand intelligence", "Confirmed demand vs. predicted demand · Kigali region", '<div class="legend"><span><i></i>Confirmed</span><span><i class="forecast"></i>Predicted</span></div>')}<div class="chart-wrap">${lineChart({ confirmed: chartConfirmed, predicted: chartPredicted, labels: ["1 Nov","6 Nov","11 Nov","16 Nov","21 Nov","26 Nov","30 Nov"], id: "dashboardDemandChart" })}</div></article>
      <article class="card">${cardHeader("Regional demand", "Confirmed customer demand by service area", '<span class="status">Kigali</span>')}<div class="region-list" id="dashboardRegions">${renderRegions(state, "All regions")}</div></article>
    </div>
    <div class="grid section-grid">
      <article class="card"><div class="table-head"><div><div class="card-title">Recent transactions</div><div class="card-sub">Latest customer activity across the network</div></div><a class="btn btn-small" href="/orders" data-route="/orders">View orders</a></div><div class="transaction-list">${renderTransactions(state)}</div></article>
      <article class="card">${cardHeader("Supplier performance", "Fulfilment readiness · demonstration", '<span class="status">On track</span>')}<div class="supply-wrap"><div class="supply-stat"><span>Confirmed orders ready</span><strong>92%</strong></div><div class="supply-progress"><span style="width:92%"></span></div><div class="supply-stat" style="margin-top:16px"><span>Average fulfilment time</span><strong>2.4 hrs</strong></div><div class="supply-stat"><span>Active demo suppliers</span><strong>${state.suppliers.filter(item => item.status === "Active").length}</strong></div><div class="callout">Demand signals help suppliers plan inventory. Physical fulfilment remains with appropriately licensed operators.</div></div></article>
    </div>
    <article class="card table-card"><div class="table-head"><div><div class="card-title">Order fulfilment</div><div class="card-sub">Demonstration pipeline · no physical delivery is initiated</div></div><a class="btn btn-small" href="/orders" data-route="/orders">Manage orders</a></div><div class="table-scroll"><table><thead><tr><th>Order</th><th>Customer</th><th>Region</th><th>Size</th><th>Order date</th><th>Status</th></tr></thead><tbody>${state.orders.slice(0, 5).map(order => `<tr><td><strong>${escapeHTML(order.id)}</strong></td><td>${escapeHTML(order.customer)}</td><td>${escapeHTML(order.region)}</td><td>${formatNumber(order.kg)} kg</td><td>${escapeHTML(order.created)}</td><td>${statusBadge(order.status)}</td></tr>`).join("")}</tbody></table></div></article>`;
}

export function mount({ toast }) {
  document.getElementById("dashboardRegion")?.addEventListener("change", event => {
    const state = getState();
    const region = event.currentTarget.value;
    const selected = region === "All regions" || region === "Kigali" ? regions : [region];
    const max = Math.max(1, ...Object.values(state.regions));
    document.getElementById("dashboardRegions").innerHTML = renderRegions(state, region);
    if (selected.length === 0) toast("No matching regional demand.");
    document.getElementById("dashboardRegions").querySelectorAll(".bar-fill").forEach((bar, index) => {
      const value = state.regions[selected[index]] || 0;
      bar.style.width = `${Math.max(3, value / max * 100)}%`;
    });
  });
  document.getElementById("dashboardPeriod")?.addEventListener("change", event => {
    toast(`Dashboard period set to ${event.currentTarget.value.toLowerCase()} (illustrative data).`);
  });
}
