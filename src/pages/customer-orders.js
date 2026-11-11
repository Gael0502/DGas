import { getState } from "../state.js";
import { escapeHTML, formatNumber, formatRwf, pageHeader, statusBadge } from "../ui.js";

function rowsFor(orders) {
  if (!orders.length) return '<tr><td colspan="6"><div class="empty-state">No personal orders match this filter. A customer confirmation will appear here.</div></td></tr>';
  return orders.map(order => `<tr><td><strong>${escapeHTML(order.id)}</strong></td><td>${escapeHTML(order.created)}</td><td>${formatNumber(order.kg)} kg</td><td>${order.demoPrice ? formatRwf(order.demoPrice) : "Illustrative"}</td><td>${statusBadge(order.status)}</td><td>${escapeHTML(order.region)}</td></tr>`).join("");
}

export function render({ session }) {
  const orders = getState().orders.filter(order => order.customerId === session.customerId);
  return `${pageHeader({ eyebrow: "Personal activity", title: "My orders", subtitle: "Only orders associated with your customer account are shown here." })}
    <article class="card table-card"><div class="table-head"><div><div class="card-title">My order history</div><div class="card-sub">${formatNumber(orders.length)} personal demonstration orders</div></div><div class="filters"><select id="myOrderStatus" aria-label="Filter my orders"><option>All statuses</option><option>Confirmed</option><option>In progress</option><option>Delivered</option><option>Cancelled</option></select></div></div><div class="table-scroll"><table><thead><tr><th>Order</th><th>Date</th><th>Quantity</th><th>Illustrative price</th><th>Status</th><th>Region</th></tr></thead><tbody id="myOrderRows">${rowsFor(orders)}</tbody></table></div></article>
    <div class="notice blue">Order values are illustrative. Delivery status shown here is a demo record; no physical delivery connection exists.</div>`;
}

export function mount({ session }) {
  document.getElementById("myOrderStatus").addEventListener("change", event => {
    const personalOrders = getState().orders.filter(order => order.customerId === session.customerId);
    const filtered = event.currentTarget.value === "All statuses"
      ? personalOrders
      : personalOrders.filter(order => order.status === event.currentTarget.value);
    document.getElementById("myOrderRows").innerHTML = rowsFor(filtered);
  });
}
