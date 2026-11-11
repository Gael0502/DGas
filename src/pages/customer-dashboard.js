import { getState } from "../state.js";
import { escapeHTML, formatNumber, formatRwf, pageHeader, statusBadge } from "../ui.js";

function customerOrders(session) {
  return getState().orders.filter(order => order.customerId === session.customerId);
}

export function render({ session }) {
  const state = getState();
  const customer = state.customers.find(item => item.id === session.customerId);
  const orders = customerOrders(session);
  const active = orders.filter(order => !["Delivered", "Cancelled"].includes(order.status));
  const latest = orders[0];
  const actions = `<a class="btn btn-primary" href="/customer/order-gas" data-route="/customer/order-gas">＋ Order gas</a>`;
  return `${pageHeader({ eyebrow: "Your energy, anticipated", title: `Welcome, ${customer.name.split(" ")[0]}`, subtitle: "Your orders, replenishment and cylinder ownership—together in one place.", actions })}
    <div class="grid kpi-grid">
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">My confirmed orders</span><span class="status">Personal</span></div><div class="kpi-value">${formatNumber(orders.length)}</div><div class="kpi-foot">Your demonstration order history</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">My active orders</span><span class="status pending">In progress</span></div><div class="kpi-value">${formatNumber(active.length)}</div><div class="kpi-foot">Only orders linked to your account</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Next refill estimate</span><span class="status predicted">Predicted</span></div><div class="kpi-value" style="font-size:17px">Nov 18, 2026</div><div class="kpi-foot">Reminder only · not an order</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Cylinder ownership progress</span><span class="status">DirectGas Own</span></div><div class="kpi-value">42%</div><div class="kpi-foot">Financing is separate from gas purchases</div></article>
    </div>
    <div class="grid dashboard-grid">
      <article class="card panel"><div class="card-head" style="padding:0"><div><div class="card-title">Order gas</div><div class="card-sub">Transparent illustrative pricing · confirmation required</div></div></div><div style="display:flex;align-items:center;justify-content:space-between;gap:14px;padding-top:20px"><div><div class="kpi-value" style="font-size:17px">12 kg cylinder</div><div class="card-sub" style="margin-top:7px">Estimated sample total ${formatRwf(23274)}</div></div><a class="btn btn-primary" href="/customer/order-gas" data-route="/customer/order-gas">Review price</a></div><div class="notice blue">All figures are editable demo assumptions—not market quotes or verified savings.</div></article>
      <article class="card panel"><div class="card-head" style="padding:0"><div><div class="card-title">My latest order</div><div class="card-sub">Customer-specific order status</div></div></div>${latest ? `<div class="history-item" style="margin-top:9px"><div><strong>${escapeHTML(latest.id)} · ${formatNumber(latest.kg)} kg</strong><small>${escapeHTML(latest.created)} · ${escapeHTML(latest.region)}</small></div>${statusBadge(latest.status)}</div><a class="btn btn-small" style="margin-top:8px" href="/customer/orders" data-route="/customer/orders">View my orders</a>` : '<div class="empty-state">You have no sample orders yet. Orders you confirm will appear here.</div>'}</article>
    </div>
    <div class="grid dashboard-grid">
      <article class="card refill-card"><span class="refill-tag">Smart reminder · predicted</span><h2>Your next refill is approaching</h2><div class="refill-date">Nov 18, 2026</div><div class="refill-details">Based on your previous purchase and typical consumption. This is a prediction—not an order or delivery booking.</div><div class="refill-actions"><a class="btn btn-primary" href="/customer/replenishment" data-route="/customer/replenishment">Review reminder</a><a class="btn" href="/customer/orders" data-route="/customer/orders">Order history</a></div></article>
      <article class="card panel"><h2>My account</h2><p>${escapeHTML(customer.email || session.email)} · ${escapeHTML(customer.region)}, Kigali</p><div class="price-line"><span>Previous personal orders</span><strong>${formatNumber(orders.length)}</strong></div><div class="price-line"><span>Cylinder plan</span><strong>12 kg · DirectGas Own</strong></div><a class="btn btn-small" href="/customer/account" data-route="/customer/account">Manage my account</a></article>
    </div>
    <div class="notice blue">Your dashboard shows only the customer account associated with this demo login. No real payment or physical delivery is connected.</div>`;
}

export function mount() {}
