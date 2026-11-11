import { getState } from "../state.js";
import { escapeHTML, formatNumber, pageHeader, statusBadge } from "../ui.js";

function renderRows(query = "") {
  const orders = getState().orders.filter(order =>
    order.status !== "Cancelled" &&
    (!query || `${order.id} ${order.region} ${order.status}`.toLowerCase().includes(query))
  );
  if (!orders.length) return '<tr><td colspan="5"><div class="empty-state">No incoming demand records match your search.</div></td></tr>';
  return orders.map(order => `<tr><td><strong>${escapeHTML(order.id)}</strong></td><td>${escapeHTML(order.region)}</td><td>${formatNumber(order.kg)} kg</td><td>${escapeHTML(order.created)}</td><td>${statusBadge(order.status)}</td></tr>`).join("");
}

export function render() {
  return `${pageHeader({ eyebrow: "Factory workspace", title: "Incoming orders", subtitle: "Review order references, quantities and service areas. Personal customer information is protected from supplier accounts." })}
    <div class="grid kpi-grid three">
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Confirmed demand</span><span class="status">Current</span></div><div class="kpi-value">${formatNumber(getState().confirmedKg)}<small> kg</small></div><div class="kpi-foot">Customer-confirmed orders</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Predicted demand</span><span class="status predicted">Modelled</span></div><div class="kpi-value">${formatNumber(getState().forecastKg)}<small> kg</small></div><div class="kpi-foot">Forecast stays separate from orders</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Forecast confidence</span><span class="status predicted">Modelled</span></div><div class="kpi-value">87%</div><div class="kpi-foot">Planning estimate</div></article>
    </div>
    <article class="card table-card"><div class="table-head"><div><div class="card-title">Incoming customer demand</div><div class="card-sub">Personal customer information is not exposed to supplier accounts</div></div><div class="filters"><input class="control-select" id="factoryOrderSearch" type="search" placeholder="Search reference or region…" aria-label="Search aggregated orders"><select id="factoryOrderRegion" aria-label="Filter by region"><option>All regions</option><option>Gasabo</option><option>Nyarugenge</option><option>Kicukiro</option><option>Other Kigali</option></select></div></div><div class="table-scroll"><table><thead><tr><th>Order reference</th><th>Region</th><th>Quantity</th><th>Received</th><th>Status</th></tr></thead><tbody id="factoryOrderRows">${renderRows()}</tbody></table></div></article>
    <div class="notice blue">This workspace displays aggregated order activity only. Supplier access does not include customer identities or order-management controls.</div>`;
}

export function mount() {
  const search = document.getElementById("factoryOrderSearch");
  const region = document.getElementById("factoryOrderRegion");
  const update = () => {
    const query = search.value.trim().toLowerCase();
    const selected = region.value;
    const filtered = getState().orders.filter(order =>
      order.status !== "Cancelled" &&
      (!query || `${order.id} ${order.region} ${order.status}`.toLowerCase().includes(query)) &&
      (selected === "All regions" || order.region === selected)
    );
    document.getElementById("factoryOrderRows").innerHTML = filtered.length
      ? filtered.map(order => `<tr><td><strong>${escapeHTML(order.id)}</strong></td><td>${escapeHTML(order.region)}</td><td>${formatNumber(order.kg)} kg</td><td>${escapeHTML(order.created)}</td><td>${statusBadge(order.status)}</td></tr>`).join("")
      : '<tr><td colspan="5"><div class="empty-state">No incoming demand records match your search.</div></td></tr>';
  };
  search.addEventListener("input", update);
  region.addEventListener("change", update);
}
