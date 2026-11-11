import { getState, addSupplier } from "../state.js";
import { regions } from "../data.js";
import { escapeHTML, formatNumber, pageHeader, statusBadge } from "../ui.js";

function supplierRows(items) {
  if (!items.length) return '<tr><td colspan="7"><div class="empty-state">No suppliers match these filters. Adjust your search or add a demo supplier.</div></td></tr>';
  return items.map(supplier => `<tr><td><strong>${escapeHTML(supplier.name)}</strong></td><td>${escapeHTML(supplier.id)}</td><td>${escapeHTML(supplier.region)}</td><td>${escapeHTML(supplier.contact)}</td><td>${formatNumber(supplier.capacity)} kg</td><td>${supplier.performance}%</td><td>${statusBadge(supplier.status)}</td></tr>`).join("");
}

export function render() {
  const state = getState();
  const actions = `<button class="btn btn-primary" id="toggleSupplierForm">＋ Add supplier</button>`;
  const active = state.suppliers.filter(item => item.status === "Active").length;
  const capacity = state.suppliers.reduce((sum, item) => sum + item.capacity, 0);
  return `${pageHeader({ eyebrow: "Network operations", title: "Supplier management", subtitle: "Manage demonstration supplier partners, regional capacity and service readiness.", actions })}
    <div class="grid kpi-grid three">
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Active demo suppliers</span><span class="status">Network</span></div><div class="kpi-value">${formatNumber(active)}</div><div class="kpi-foot">Across the Kigali service area</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Illustrative monthly capacity</span><span class="status predicted">Declared</span></div><div class="kpi-value">${formatNumber(capacity)}<small> kg</small></div><div class="kpi-foot">Supplier-provided demo estimates</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Average service score</span><span class="status">On track</span></div><div class="kpi-value">${Math.round(state.suppliers.reduce((sum, item) => sum + item.performance, 0) / Math.max(1, state.suppliers.length))}%</div><div class="kpi-foot">Illustrative fulfilment performance</div></article>
    </div>
    <article class="card panel" id="supplierFormPanel" hidden><h2>Register a demo supplier</h2><p>Sample records only. Adding a supplier does not establish a real supplier relationship or fulfilment service.</p><form id="supplierForm"><div class="form-grid"><div class="field"><label for="supplierName">Supplier name</label><input id="supplierName" name="name" required placeholder="e.g. Kigali Energy Hub"></div><div class="field"><label for="supplierRegion">Service region</label><select id="supplierRegion" name="region" required>${regions.map(region => `<option>${escapeHTML(region)}</option>`).join("")}</select></div><div class="field"><label for="supplierCapacity">Monthly capacity (kg)</label><input id="supplierCapacity" name="capacity" type="number" min="1" required placeholder="2500"></div><div class="field"><label for="supplierContact">Demo contact</label><input id="supplierContact" name="contact" placeholder="Contact name"></div></div><div class="form-actions"><button class="btn" type="button" id="cancelSupplier">Cancel</button><button class="btn btn-primary" type="submit">Add demo supplier</button></div></form></article>
    <article class="card table-card" style="margin-top:14px"><div class="table-head"><div><div class="card-title">Supplier directory</div><div class="card-sub">Operational details and declared demonstration capacity</div></div><div class="filters"><input class="control-select" id="supplierSearch" type="search" placeholder="Search supplier…" aria-label="Search supplier"><select id="supplierRegionFilter" aria-label="Filter by region"><option>All regions</option>${regions.map(region => `<option>${escapeHTML(region)}</option>`).join("")}</select><select id="supplierStatusFilter" aria-label="Filter by status"><option>All statuses</option><option>Active</option><option>Review</option></select></div></div><div class="table-scroll"><table><thead><tr><th>Supplier</th><th>Reference</th><th>Region</th><th>Contact</th><th>Capacity / month</th><th>Service score</th><th>Status</th></tr></thead><tbody id="supplierRows">${supplierRows(state.suppliers)}</tbody></table></div></article>
    <div class="notice blue">Supplier records and capacity in this interface are illustrative. No supplier integration, stock reservation, order acceptance or physical delivery is connected.</div>`;
}

export function mount({ toast, refresh, session }) {
  const search = document.getElementById("supplierSearch");
  const regionFilter = document.getElementById("supplierRegionFilter");
  const statusFilter = document.getElementById("supplierStatusFilter");
  const updateRows = () => {
    const query = search.value.trim().toLowerCase();
    const state = getState();
    const matching = state.suppliers.filter(item =>
      (!query || `${item.name} ${item.id} ${item.region} ${item.contact}`.toLowerCase().includes(query)) &&
      (regionFilter.value === "All regions" || item.region === regionFilter.value) &&
      (statusFilter.value === "All statuses" || item.status === statusFilter.value)
    );
    document.getElementById("supplierRows").innerHTML = supplierRows(matching);
  };
  [search, regionFilter, statusFilter].forEach(element => element.addEventListener("input", updateRows));
  document.getElementById("toggleSupplierForm").addEventListener("click", () => {
    const panel = document.getElementById("supplierFormPanel");
    panel.hidden = !panel.hidden;
    if (!panel.hidden) document.getElementById("supplierName").focus();
  });
  document.getElementById("cancelSupplier").addEventListener("click", () => {
    document.getElementById("supplierForm").reset();
    document.getElementById("supplierFormPanel").hidden = true;
  });
  document.getElementById("supplierForm").addEventListener("submit", event => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    try {
      addSupplier({ actor: session, name: fields.get("name"), region: fields.get("region"), capacity: fields.get("capacity"), contact: fields.get("contact") });
      toast("Demo supplier added to the supplier directory.");
      refresh();
    } catch (error) {
      toast(error.message);
    }
  });
}
