import { getState, addCustomer } from "../state.js";
import { regions } from "../data.js";
import { escapeHTML, formatNumber, pageHeader, statusBadge } from "../ui.js";

function customerRows(items) {
  if (!items.length) return '<tr><td colspan="7"><div class="empty-state">No customers match this search. Try another name or region.</div></td></tr>';
  return items.map(customer => `<tr><td><div class="tx-person"><span class="tx-avatar">${escapeHTML(customer.initials)}</span><span><strong>${escapeHTML(customer.name)}</strong><span class="tx-detail">${escapeHTML(customer.id)}</span></span></div></td><td>${escapeHTML(customer.phone)}</td><td>${escapeHTML(customer.region)}</td><td>${formatNumber(customer.orders)}</td><td>${formatNumber(customer.kg)} kg</td><td>${statusBadge(customer.status)}</td><td><a class="btn btn-small" href="/replenishment" data-route="/replenishment">Replenishment</a></td></tr>`).join("");
}

export function render() {
  const state = getState();
  const actions = `<button class="btn btn-primary" id="toggleCustomerForm">＋ Add customer</button>`;
  const active = state.customers.filter(customer => customer.status === "Active").length;
  const orders = state.customers.reduce((sum, customer) => sum + customer.orders, 0);
  return `${pageHeader({ eyebrow: "Customer operations", title: "Customer management", subtitle: "Understand customer activity and support informed, customer-controlled replenishment.", actions })}
    <div class="grid kpi-grid three">
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Customer profiles</span><span class="status">Directory</span></div><div class="kpi-value">${formatNumber(state.customers.length)}</div><div class="kpi-foot">Current workspace records</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Active customers</span><span class="status">Engaged</span></div><div class="kpi-value">${formatNumber(active)}</div><div class="kpi-foot">With prior order activity</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Previous orders</span><span class="status predicted">History</span></div><div class="kpi-value">${formatNumber(orders)}</div><div class="kpi-foot">Customer order history</div></article>
    </div>
    <article class="card panel" id="customerFormPanel" hidden><h2>Add a customer profile</h2><p>Add a profile to this workspace.</p><form id="customerForm"><div class="form-grid"><div class="field"><label for="customerName">Customer name</label><input id="customerName" name="name" required placeholder="Full name"></div><div class="field"><label for="customerRegion">Region</label><select id="customerRegion" name="region">${regions.map(region => `<option>${escapeHTML(region)}</option>`).join("")}</select></div><div class="field"><label for="customerPhone">Phone (optional)</label><input id="customerPhone" name="phone" placeholder="+250 …"></div></div><div class="form-actions"><button class="btn" type="button" id="cancelCustomer">Cancel</button><button class="btn btn-primary" type="submit">Create profile</button></div></form></article>
    <article class="card table-card" style="margin-top:14px"><div class="table-head"><div><div class="card-title">Customer directory</div><div class="card-sub">Search profiles and open the replenishment experience</div></div><div class="filters"><input class="control-select" id="customerSearch" type="search" placeholder="Search customers…" aria-label="Search customers"><select id="customerRegionFilter" aria-label="Filter customers by region"><option>All regions</option>${regions.map(region => `<option>${escapeHTML(region)}</option>`).join("")}</select></div></div><div class="table-scroll"><table><thead><tr><th>Customer</th><th>Contact</th><th>Region</th><th>Orders</th><th>Volume</th><th>Status</th><th>Action</th></tr></thead><tbody id="customerRows">${customerRows(state.customers)}</tbody></table></div></article>
    <div class="notice blue">Customer records are illustrative and stored in this browser. No personal data is sent to an external service.</div>`;
}

export function mount({ toast, refresh, session }) {
  const search = document.getElementById("customerSearch");
  const regionFilter = document.getElementById("customerRegionFilter");
  const updateRows = () => {
    const query = search.value.trim().toLowerCase();
    const items = getState().customers.filter(customer =>
      (!query || `${customer.name} ${customer.id} ${customer.region}`.toLowerCase().includes(query)) &&
      (regionFilter.value === "All regions" || customer.region === regionFilter.value)
    );
    document.getElementById("customerRows").innerHTML = customerRows(items);
  };
  search.addEventListener("input", updateRows);
  regionFilter.addEventListener("change", updateRows);
  document.getElementById("toggleCustomerForm").addEventListener("click", () => {
    const panel = document.getElementById("customerFormPanel");
    panel.hidden = !panel.hidden;
    if (!panel.hidden) document.getElementById("customerName").focus();
  });
  document.getElementById("cancelCustomer").addEventListener("click", () => {
    document.getElementById("customerForm").reset();
    document.getElementById("customerFormPanel").hidden = true;
  });
  document.getElementById("customerForm").addEventListener("submit", event => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    try {
      addCustomer({ actor: session, name: fields.get("name"), region: fields.get("region"), phone: fields.get("phone") });
      toast("Customer profile created.");
      refresh();
    } catch (error) {
      toast(error.message);
    }
  });
}
