import { addRepayment, getState } from "../state.js";
import { escapeHTML, formatNumber, formatRwf, pageHeader, statusBadge } from "../ui.js";

export function render() {
  const state = getState();
  const agreedValue = 48000;
  const repaid = state.repayments.reduce((sum, payment) => sum + payment.amount, 0);
  const balance = Math.max(0, agreedValue - repaid);
  const progress = Math.min(100, repaid / agreedValue * 100);
  const actions = `<span class="status">Demo account · DG-OWN-0284</span>`;
  const rows = state.repayments.map(payment => `<tr><td>${escapeHTML(payment.date)}</td><td><strong>${escapeHTML(payment.reference)}</strong></td><td>${formatRwf(payment.amount)}</td><td>${statusBadge("Recorded")}</td></tr>`).join("");
  return `${pageHeader({ eyebrow: "A path to ownership", title: "DirectGas Own", subtitle: "Track cylinder financing and repayment progress separately from gas purchases.", actions })}
    <div class="grid two-col">
      <div>
        <section class="ownership-hero"><small>CYLINDER OWNERSHIP PROGRESS</small><h2>12 kg cylinder plan</h2><p>Illustrative account summary · subject to financing agreement</p><div class="ownership-bar"><span style="width:${progress}%"></span></div><div class="ownership-progress-label"><span>${progress.toFixed(0)}% repaid</span><span>Ownership transfer subject to agreement</span></div></section>
        <div class="grid ownership-kpis"><article class="card kpi"><div class="kpi-label">Agreed cylinder value</div><div class="kpi-value">${formatRwf(agreedValue)}</div></article><article class="card kpi"><div class="kpi-label">Amount repaid</div><div class="kpi-value">${formatRwf(repaid)}</div></article><article class="card kpi"><div class="kpi-label">Outstanding balance</div><div class="kpi-value">${formatRwf(balance)}</div></article></div>
        <article class="card table-card"><div class="table-head"><div><div class="card-title">Financing payment history</div><div class="card-sub">Cylinder ownership repayments only · gas purchases are separate</div></div><button class="btn btn-primary btn-small" id="recordRepayment" ${balance === 0 ? "disabled" : ""}>＋ Record demo repayment</button></div><div class="table-scroll"><table><thead><tr><th>Date</th><th>Payment reference</th><th>Amount</th><th>Status</th></tr></thead><tbody>${rows || '<tr><td colspan="4"><div class="empty-state">No financing repayments recorded.</div></td></tr>'}</tbody></table></div></article>
      </div>
      <div class="grid" style="gap:14px">
        <article class="card panel"><h2>Financing summary</h2><p>Account terms are illustrative. Refer to a signed agreement for actual terms and obligations.</p><div class="price-line"><span>Agreed cylinder value</span><strong>${formatRwf(agreedValue)}</strong></div><div class="price-line"><span>Financing charges</span><strong>RWF 0 · demo</strong></div><div class="price-line"><span>Repayment schedule</span><strong>RWF 5,000 / month</strong></div><div class="price-line"><span>Next scheduled date</span><strong>Nov 05, 2026</strong></div><div class="notice">Ownership transfer is subject to the applicable financing agreement and completion of its terms. Financing repayments are separate from gas purchases.</div></article>
        <article class="card panel"><h2>Keep purchases separate</h2><p>DirectGas Own tracks equipment financing—not gas transactions.</p><div class="history-item"><div><strong>Cylinder repayment</strong><small>Recorded in ownership account</small></div><b style="color:#148365">RWF 5,000</b></div><div class="history-item"><div><strong>Gas refill purchase</strong><small>Separate supplier transaction</small></div><span class="status predicted">Not included</span></div><div class="fine-print">This interface is a demonstration only. No repayment or financial transaction is processed.</div></article>
      </div>
    </div>`;
}

export function mount({ toast, refresh, session }) {
  document.getElementById("recordRepayment").addEventListener("click", () => {
    try {
      const payment = addRepayment(session);
      toast(`Demo repayment of ${formatRwf(payment.amount)} recorded locally.`);
      refresh();
    } catch (error) {
      toast(error.message);
    }
  });
}
