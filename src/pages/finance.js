import { getState } from "../state.js";
import { formatNumber, formatRwf, pageHeader } from "../ui.js";

function numberFrom(id) {
  const value = Number(document.getElementById(id).value);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function updateCalculator() {
  const quantity = numberFrom("financeCylinderSize");
  const gas = quantity * numberFrom("financeGasRate");
  const logistics = numberFrom("financeLogistics");
  const taxRate = Math.min(100, numberFrom("financeTaxRate"));
  const fee = numberFrom("financePlatformFee");
  const reference = numberFrom("financeRetailReference");
  const tax = (gas + logistics) * taxRate / 100;
  const total = gas + logistics + tax + fee;
  const difference = reference - total;
  document.getElementById("financeGasLine").textContent = formatRwf(gas);
  document.getElementById("financeLogisticsLine").textContent = formatRwf(logistics);
  document.getElementById("financeTaxLine").textContent = formatRwf(tax);
  document.getElementById("financeFeeLine").textContent = formatRwf(fee);
  document.getElementById("financeTotal").textContent = formatRwf(total);
  const comparison = document.getElementById("financeComparison");
  comparison.textContent = difference >= 0 ? `− ${formatRwf(difference)}*` : `+ ${formatRwf(Math.abs(difference))} vs reference`;
  comparison.style.color = difference >= 0 ? "#168366" : "#b6733e";
}

export function render() {
  const state = getState();
  const completed = 1.24;
  const fees = state.orderCount * 5000;
  const settled = Math.round(fees * .78);
  return `${pageHeader({ eyebrow: "Platform economics", title: "Financial overview", subtitle: "Track platform revenue assumptions and explore customer pricing." })}
    <div class="grid kpi-grid">
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Modelled platform revenue</span><span class="status predicted">Estimate</span></div><div class="kpi-value">RWF ${completed.toFixed(2)}M</div><div class="kpi-foot">Illustrative scenario · not collected revenue</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Estimated platform fees</span><span class="status">Modelled</span></div><div class="kpi-value">${formatRwf(fees)}</div><div class="kpi-foot">Illustrative RWF 5,000/order assumption</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Estimated supplier settlements</span><span class="status">Estimate</span></div><div class="kpi-value">${formatRwf(settled)}</div><div class="kpi-foot">Modelled · payment processing is not connected</div></article>
      <article class="card kpi"><div class="kpi-top"><span class="kpi-label">Confirmed demand</span><span class="status">Current</span></div><div class="kpi-value">${formatNumber(state.confirmedKg)}<small> kg</small></div><div class="kpi-foot">Confirmed orders in this workspace</div></article>
    </div>
    <div class="grid two-col">
      <article class="card panel"><h2>Transparent price calculator</h2><p>Adjust the planning assumptions in Rwandan francs to see the full customer price breakdown.</p><div class="form-grid">
        <div class="field"><label for="financeCylinderSize">Cylinder size</label><select id="financeCylinderSize"><option value="6">6 kg</option><option value="12" selected>12 kg</option><option value="15">15 kg</option></select></div>
        <div class="field"><label for="financeGasRate">Reference gas price (RWF/kg)</label><input id="financeGasRate" type="number" min="0" value="1400"></div>
        <div class="field"><label for="financeLogistics">Logistics & fulfilment (RWF)</label><input id="financeLogistics" type="number" min="0" value="2500"></div>
        <div class="field"><label for="financeTaxRate">Illustrative tax/charges (%)</label><input id="financeTaxRate" type="number" min="0" max="100" value="18"></div>
        <div class="field"><label for="financePlatformFee">DirectGas platform fee (RWF)</label><input id="financePlatformFee" type="number" min="0" value="500"></div>
        <div class="field"><label for="financeRetailReference">Retail comparison reference (RWF)</label><input id="financeRetailReference" type="number" min="0" value="22000"></div>
      </div><div class="notice blue">All values are illustrative assumptions, not a supplier quote or tax advice. Confirm actual prices and applicable charges with a licensed supplier.</div></article>
      <article class="card panel"><h2>Customer price breakdown</h2><p>Estimate updates instantly as assumptions change.</p><div class="price-line"><span>Reference gas price</span><strong id="financeGasLine">${formatRwf(16800)}</strong></div><div class="price-line"><span>Logistics & fulfilment</span><strong id="financeLogisticsLine">${formatRwf(2500)}</strong></div><div class="price-line"><span>Illustrative taxes & charges</span><strong id="financeTaxLine">${formatRwf(3474)}</strong></div><div class="price-line"><span>DirectGas platform fee</span><strong id="financeFeeLine">${formatRwf(500)}</strong></div><div class="price-total"><span>Estimated customer price</span><strong id="financeTotal">${formatRwf(23274)}</strong>      </div><div class="savings-box"><span>Compared with editable retail reference</span><strong id="financeComparison">− RWF 0*</strong></div><div class="fine-print">For this estimate, taxes apply to gas + logistics. The comparison is arithmetic only; actual market prices, availability, fees and savings are not verified.</div></article>
    </div>
    <article class="card panel" style="margin-top:14px"><h2>Revenue model</h2><p>Planning assumptions for the platform business model.</p><div class="grid kpi-grid three" style="margin:0"><div class="history-item"><div><strong>Platform service fee</strong><small>Illustrative per-order assumption</small></div><b>RWF 5,000</b></div><div class="history-item"><div><strong>Supplier fulfilment</strong><small>Handled by licensed partners, if engaged</small></div><span class="status predicted">Not connected</span></div><div class="history-item"><div><strong>Financing repayments</strong><small>Tracked separately from gas purchases</small></div><a class="btn btn-small" href="/cylinder-ownership" data-route="/cylinder-ownership">View ownership</a></div></div></article>`;
}

export function mount() {
  ["financeCylinderSize", "financeGasRate", "financeLogistics", "financeTaxRate", "financePlatformFee", "financeRetailReference"].forEach(id => {
    document.getElementById(id).addEventListener("input", updateCalculator);
  });
  updateCalculator();
}
