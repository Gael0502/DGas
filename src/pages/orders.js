import { getState, createOrder, updateOrderStatus } from "../state.js";
import { regions } from "../data.js";
import { escapeHTML, formatNumber, pageHeader, statusBadge } from "../ui.js";

function rowsFor(orders) {
  if (!orders.length) return '<tr><td colspan="7"><div class="empty-state">No orders match the selected filters.</div></td></tr>';
  return orders.map(order => `<tr><td><strong>${escapeHTML(order.id)}</strong></td><td>${escapeHTML(order.customer)}</td><td>${escapeHTML(order.region)}</td><td>${formatNumber(order.kg)} kg</td><td>${escapeHTML(order.created)}</td><td>${statusBadge(order.status)}</td><td><select class="control-select order-status" data-order-id="${escapeHTML(order.id)}" aria-label="Update ${escapeHTML(order.id)} status"><option ${order.status === "Confirmed" ? "selected" : ""}>Confirmed</option><option ${order.status === "In progress" ? "selected" : ""}>In progress</option><option ${order.status === "Delivered" ? "selected" : ""}>Delivered</option><option ${order.status === "Cancelled" ? "selected" : ""}>Cancelled</option></select></td></tr>`).join("");
}

export function render() {
  const state = getState();
  const customers = state.customers.filter(customer => customer.email || customer.orders > 0);
  const customerOptions = customers.map(customer => `<option value="${escapeHTML(customer.id)}">${escapeHTML(customer.name)}</option>`).join("");
  const actions = `<button class="btn btn-primary" id="toggleOrderForm">＋ Create order</button>`;
  return `${pageHeader({ eyebrow: "Order operations", title: "Order management", subtitle: "Manage customer orders and track their contribution to supplier demand intelligence.", actions })}
    <div class="grid kpi-grid three">
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Total orders</span><span class="status">All records</span></div><div class="kpi-value">${formatNumber(state.orderCount)}</div><div class="kpi-foot">Includes order history</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Confirmed demand</span><span class="status">Customer confirmed</span></div><div class="kpi-value">${formatNumber(state.confirmedKg)}<small> kg</small></div><div class="kpi-foot">Shared with supplier intelligence</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">In progress</span><span class="status pending">Pipeline</span></div><div class="kpi-value">${state.orders.filter(order => order.status === "In progress").length}</div><div class="kpi-foot">Current order status</div></article>
    </div>
    <article class="card panel" id="orderFormPanel" hidden><h2>Create a customer order</h2><p>Confirmed orders update workspace demand and supplier intelligence. No payment or delivery is initiated.</p><form id="orderForm"><div class="form-grid"><div class="field"><label for="orderCustomer">Customer</label><select id="orderCustomer" name="customerId" required>${customerOptions}</select></div><div class="field"><label for="orderRegion">Region</label><select id="orderRegion" name="region">${regions.map(region => `<option>${escapeHTML(region)}</option>`).join("")}</select></div><div class="field"><label for="orderSize">Cylinder size</label><select id="orderSize" name="kg"><option value="6">6 kg</option><option value="12" selected>12 kg</option><option value="15">15 kg</option></select></div></div><div class="form-actions"><button class="btn" type="button" id="cancelOrder">Cancel</button><button class="btn btn-primary" type="submit">Confirm order</button></div></form></article>
    <article class="card table-card" style="margin-top:14px"><div class="table-head"><div><div class="card-title">Order register</div><div class="card-sub">Order records · status changes update confirmed demand</div></div><div class="filters"><input class="control-select" type="search" id="orderSearch" placeholder="Search orders…" aria-label="Search orders"><select id="orderStatusFilter" aria-label="Filter orders"><option>All statuses</option><option>Confirmed</option><option>In progress</option><option>Delivered</option><option>Cancelled</option></select><select id="orderRegionFilter" aria-label="Filter by region"><option>All regions</option>${regions.map(region => `<option>${escapeHTML(region)}</option>`).join("")}</select></div></div><div class="table-scroll"><table><thead><tr><th>Order</th><th>Customer</th><th>Region</th><th>Quantity</th><th>Created</th><th>Status</th><th>Update status</th></tr></thead><tbody id="orderRows">${rowsFor(state.orders)}</tbody></table></div></article>
    <div class="notice blue">Order records are illustrative. Status changes adjust planning demand only; no physical fulfilment or payment occurs.</div>`;
}

export function mount({ toast, refresh, session }) {
  const search = document.getElementById("orderSearch");
  const status = document.getElementById("orderStatusFilter");
  const region = document.getElementById("orderRegionFilter");
  const filterRows = () => {
    const query = search.value.trim().toLowerCase();
    const orders = getState().orders.filter(order =>
      (!query || `${order.id} ${order.customer} ${order.region}`.toLowerCase().includes(query)) &&
      (status.value === "All statuses" || order.status === status.value) &&
      (region.value === "All regions" || order.region === region.value)
    );
    document.getElementById("orderRows").innerHTML = rowsFor(orders);
  };
  [search, status, region].forEach(element => element.addEventListener("input", filterRows));
  document.getElementById("toggleOrderForm").addEventListener("click", () => {
    const panel = document.getElementById("orderFormPanel");
    panel.hidden = !panel.hidden;
    if (!panel.hidden) document.getElementById("orderCustomer").focus();
  });
  document.getElementById("cancelOrder").addEventListener("click", () => {
    document.getElementById("orderForm").reset();
    document.getElementById("orderFormPanel").hidden = true;
  });
  document.getElementById("orderForm").addEventListener("submit", event => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    try {
      const order = createOrder({ actor: session, customerId: fields.get("customerId"), region: fields.get("region"), kg: fields.get("kg") });
      toast(`Order ${order.id} confirmed. Supplier demand updated.`);
      refresh();
    } catch (error) {
      toast(error.message);
    }
  });
  document.getElementById("orderRows").addEventListener("change", event => {
    if (!event.target.matches(".order-status")) return;
    try {
      const order = updateOrderStatus({ actor: session, id: event.target.dataset.orderId, nextStatus: event.target.value });
      toast(`${order.id} marked ${order.status.toLowerCase()}.`);
      refresh();
    } catch (error) {
      toast(error.message);
      refresh();
    }
  });
}
