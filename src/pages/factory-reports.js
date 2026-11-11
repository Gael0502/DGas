import { getState } from "../state.js";
import { regions } from "../data.js";
import { csvCell, factoryHorizons, getHorizonDays, getRegionalDemand } from "../factory-data.js";
import { escapeHTML, formatNumber, pageHeader, statusBadge } from "../ui.js";

function filteredData() {
  const state = getState();
  const region = document.getElementById("factoryReportRegion").value;
  const days = getHorizonDays(document.getElementById("factoryReportHorizon").value);
  const summary = getRegionalDemand(state, days).filter(item => region === "All regions" || item.name === region);
  const orders = state.orders.filter(order => order.status !== "Cancelled" && (region === "All regions" || order.region === region));
  return { summary, orders, region, days };
}

function renderPreview() {
  const { summary, orders } = filteredData();
  const summaryRows = summary.map(item => `<tr><td><strong>${escapeHTML(item.name)}</strong></td><td>${formatNumber(item.confirmed)} kg</td><td>${formatNumber(item.predicted)} kg</td><td>${formatNumber(item.available)} kg</td><td>${formatNumber(item.committed)} kg</td><td>${item.predicted > item.available ? statusBadge("Supply gap") : item.predicted > item.committed || item.confirmed > item.committed ? statusBadge("Review allocation") : statusBadge("Covered")}</td></tr>`).join("");
  const orderRows = orders.slice(0, 8).map(order => `<tr><td><strong>${escapeHTML(order.id)}</strong></td><td>${escapeHTML(order.region)}</td><td>${formatNumber(order.kg)} kg</td><td>${escapeHTML(order.created)}</td><td>${statusBadge(order.status)}</td></tr>`).join("");
  document.getElementById("factoryReportSummary").innerHTML = summaryRows || '<tr><td colspan="6"><div class="empty-state">No regional report data for this filter.</div></td></tr>';
  document.getElementById("factoryReportOrders").innerHTML = orderRows || '<tr><td colspan="5"><div class="empty-state">No incoming order records for this filter.</div></td></tr>';
  document.getElementById("factoryReportPeriodLabel").textContent = `${orders.length} aggregated order records · next ${filteredData().days} days forecast`;
}

function downloadCsv() {
  const { summary, orders, region, days } = filteredData();
  const rows = [
    ["DirectGas demonstration demand report", "Fictional planning data only"],
    ["Forecast horizon", `${days} days`],
    ["Region filter", region],
    [],
    ["Regional demand summary"],
    ["Region", "Confirmed demand (kg)", "Predicted demand (kg)", "Available supply estimate (kg)", "Committed supply (kg)"],
    ...summary.map(item => [item.name, item.confirmed, item.predicted, item.available, item.committed]),
    [],
    ["Aggregated incoming orders"],
    ["Order reference", "Region", "Quantity (kg)", "Received", "Status"],
    ...orders.map(order => [order.id, order.region, order.kg, order.created, order.status]),
    [],
    ["Customer names, phone numbers and personal data are intentionally excluded."]
  ];
  const csv = rows.map(row => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `directgas-demand-report-${days}d.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function render() {
  const actions = `<div class="filters"><select id="factoryReportRegion" aria-label="Report region"><option>All regions</option>${regions.map(region => `<option>${escapeHTML(region)}</option>`).join("")}</select><select id="factoryReportHorizon" aria-label="Report forecast horizon">${factoryHorizons.map(item => `<option>${item.label}</option>`).join("")}</select><button class="btn btn-primary" id="downloadFactoryReport" type="button">↓ Export CSV</button></div>`;
  const { summary, orders } = filteredDataInitial();
  return `${pageHeader({ eyebrow: "Workspace · exportable insights", title: "Demand reports", subtitle: "Build a shareable regional planning snapshot. Exports contain aggregated demand and order references only—never customer identity or contact data.", actions })}
    <div class="factory-intelligence-alert"><strong>Privacy by design</strong><span>Report previews and CSV exports include regional totals and permitted order fields only. No customer names, email addresses, phone numbers or personal history are included.</span><small>Demonstration data · not a commercial report</small></div>
    <article class="card table-card"><div class="table-head"><div><div class="card-title">Regional demand summary</div><div class="card-sub" id="factoryReportPeriodLabel">${orders.length} aggregated order records · next 7 days forecast</div></div><span class="status">Illustrative</span></div><div class="table-scroll"><table><thead><tr><th>Region</th><th>Confirmed demand</th><th>Predicted demand</th><th>Available estimate</th><th>Committed supply</th><th>Planning signal</th></tr></thead><tbody id="factoryReportSummary">${summary.map(item => `<tr><td><strong>${escapeHTML(item.name)}</strong></td><td>${formatNumber(item.confirmed)} kg</td><td>${formatNumber(item.predicted)} kg</td><td>${formatNumber(item.available)} kg</td><td>${formatNumber(item.committed)} kg</td><td>${item.predicted > item.available ? statusBadge("Supply gap") : item.predicted > item.committed || item.confirmed > item.committed ? statusBadge("Review allocation") : statusBadge("Covered")}</td></tr>`).join("")}</tbody></table></div></article>
    <article class="card table-card" style="margin-top:14px"><div class="table-head"><div><div class="card-title">Incoming order signals</div><div class="card-sub">Reference, area, volume, received date and status</div></div><a class="btn btn-small" href="/factory/incoming-orders" data-route="/factory/incoming-orders">Open incoming orders</a></div><div class="table-scroll"><table><thead><tr><th>Order reference</th><th>Region</th><th>Quantity</th><th>Received</th><th>Status</th></tr></thead><tbody id="factoryReportOrders">${orders.length ? orders.slice(0, 8).map(order => `<tr><td><strong>${escapeHTML(order.id)}</strong></td><td>${escapeHTML(order.region)}</td><td>${formatNumber(order.kg)} kg</td><td>${escapeHTML(order.created)}</td><td>${statusBadge(order.status)}</td></tr>`).join("") : '<tr><td colspan="5"><div class="empty-state">No incoming order records yet.</div></td></tr>'}</tbody></table></div></article>
    <div class="notice blue">The report is an illustrative planning aid. Availability, forecasts and confidence are unverified assumptions; this demo does not initiate supply allocation or physical delivery.</div>`;
}

function filteredDataInitial() {
  const state = getState();
  return {
    summary: getRegionalDemand(state, 7),
    orders: state.orders.filter(order => order.status !== "Cancelled")
  };
}

export function mount({ toast }) {
  ["factoryReportRegion", "factoryReportHorizon"].forEach(id =>
    document.getElementById(id).addEventListener("change", renderPreview)
  );
  document.getElementById("downloadFactoryReport").addEventListener("click", () => {
    downloadCsv();
    toast("Aggregated demand report exported as CSV.");
  });
}
