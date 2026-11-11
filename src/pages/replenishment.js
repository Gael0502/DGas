import { getState, setRefillAction } from "../state.js";
import { lineChart } from "../charts.js";
import { escapeHTML, formatRwf, pageHeader, statusBadge } from "../ui.js";

function renderAction(state, session) {
  if (session.role !== "customer" && state.refillAction === "suggested") {
    return '<div class="notice blue">This is a customer-only decision. The customer account must confirm, postpone or decline the suggestion.</div>';
  }
  if (state.refillAction === "confirmed") {
    return `<span class="status">Confirmed · demo only</span><div class="notice">Your sample order is confirmed. Shared demand views reflect the customer-confirmed activity. No payment or delivery has been initiated.</div>`;
  }
  if (state.refillAction === "postponed") return '<span class="status pending">Postponed · no order placed</span><div class="notice blue">We’ll remind you in 3 days. Confirmed demand is unchanged.</div>';
  if (state.refillAction === "declined") return '<span class="status cancelled">Declined · demand unchanged</span><div class="notice blue">You declined this refill suggestion. No order was created.</div>';
  return `<div class="refill-actions"><button class="btn btn-primary" data-refill-action="confirmed">Confirm sample order · 12 kg</button><button class="btn" data-refill-action="postponed">Remind me later</button><button class="btn" data-refill-action="declined">Not now</button></div>`;
}

export function render({ session }) {
  const state = getState();
  const title = state.refillAction === "confirmed" ? "Sample order confirmed"
    : state.refillAction === "postponed" ? "Reminder postponed"
      : state.refillAction === "declined" ? "Suggestion declined"
        : "Your next refill is approaching";
  const date = state.refillAction === "confirmed" ? "12 kg · customer confirmed"
    : state.refillAction === "postponed" ? "Check back in 3 days"
      : state.refillAction === "declined" ? "No order placed" : "Nov 18, 2026";
  const personalHistory = state.personalOrders.filter(order => !order.customerId || order.customerId === session.customerId).map(order => `<div class="history-item"><div><strong>${escapeHTML(order.date)}</strong><small>${order.kg} kg cylinder · ${escapeHTML(order.ref)}</small></div><b>${escapeHTML(order.price)}</b></div>`).join("");
  return `${pageHeader({ eyebrow: "Your energy, anticipated", title: "Smart replenishment", subtitle: "A timely nudge, not an automatic order. You stay in control of every refill." })}
    <div class="grid two-col">
      <div class="grid" style="gap:14px">
        <article class="card profile-card"><span class="profile-avatar">AM</span><span><strong>Aline Mukamana</strong><small>Residential customer · Kigali, Gasabo · Customer since Jan 2025</small></span><span class="status" style="margin-left:auto">Verified demo</span></article>
        <article class="card refill-card"><span class="refill-tag">Smart reminder · predicted</span><h2>${title}</h2><div class="refill-date">${date}</div><div class="refill-details">Based on your previous purchase of one 12 kg cylinder and your typical 31-day consumption pattern. This is a prediction—not an order or delivery booking.</div><div style="margin-top:8px;color:#85938f;font-size:8px">Estimated remaining: <strong style="color:#536f64">~7 days</strong> · Last refill: Oct 18, 2026</div>${renderAction(state, session)}</article>
        <article class="card panel"><div class="card-head" style="padding:0"><div><div class="card-title">Previous orders</div><div class="card-sub">Personal consumption history · gas purchases only</div></div></div><div class="history-list">${personalHistory}</div></article>
      </div>
      <div class="grid" style="gap:14px">
        <article class="card panel"><h2>Consumption history</h2><p>Recent usage helps estimate your next refill window.</p><div class="chart-wrap" style="padding:0">${lineChart({ confirmed: [11,12,10,12,11,12], predicted: [12,12,12,12,12,12], labels: ["Jun","Jul","Aug","Sep","Oct","Nov"], compact: true, id: "consumptionHistory" })}</div><div class="legend-inline" style="padding:2px 0 0"><span><i></i>Monthly usage (kg)</span></div></article>
        <article class="card panel"><h2>Replenishment alerts</h2><p>Informational reminders only. No order is placed without your confirmation.</p><div class="notice" id="replenishmentMessage">Your estimate is based on personal order history. Confirm only when you are ready.</div><div class="history-item" style="margin-top:8px"><div><strong>Low supply reminder</strong><small>When estimated supply is running low</small></div><span class="status">On</span></div><div class="history-item"><div><strong>Price change alert</strong><small>When illustrative assumptions change</small></div><span class="status">On</span></div></article>
        <div class="notice blue">This app does not connect to real LPG transactions, payments or delivery. Licensed operators remain responsible for physical LPG handling and fulfilment.</div>
      </div>
    </div>`;
}

export function mount({ toast, refresh, session }) {
  document.querySelectorAll("[data-refill-action]").forEach(button => button.addEventListener("click", () => {
    try {
      const action = button.dataset.refillAction;
      setRefillAction(action, session);
      toast(action === "confirmed"
        ? "Sample order confirmed — supplier demand updated."
        : action === "postponed" ? "Reminder postponed. No order was placed." : "Suggestion declined. No order was placed.");
      refresh();
    } catch (error) {
      toast(error.message);
    }
  }));
}
