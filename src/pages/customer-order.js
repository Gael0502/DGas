import { createOrder, getState } from "../state.js";
import { formatNumber, formatRwf, pageHeader } from "../ui.js";

function numericValue(id) {
  const value = Number(document.getElementById(id).value);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function updatePrice() {
  const kg = numericValue("customerCylinderSize");
  const gas = kg * numericValue("customerGasPrice");
  const delivery = numericValue("customerLogistics");
  const taxRate = Math.min(100, numericValue("customerTaxRate"));
  const fee = numericValue("customerFee");
  const reference = numericValue("customerRetailReference");
  const tax = (gas + delivery) * taxRate / 100;
  const total = gas + delivery + tax + fee;
  const delta = reference - total;
  document.getElementById("customerGasLine").textContent = formatRwf(gas);
  document.getElementById("customerDeliveryLine").textContent = formatRwf(delivery);
  document.getElementById("customerTaxLine").textContent = formatRwf(tax);
  document.getElementById("customerFeeLine").textContent = formatRwf(fee);
  document.getElementById("customerTotalLine").textContent = formatRwf(total);
  document.getElementById("customerSavingsLine").textContent = delta >= 0 ? `− ${formatRwf(delta)}*` : `+ ${formatRwf(Math.abs(delta))} vs reference`;
}

export function render({ session }) {
  const customer = getState().customers.find(item => item.id === session.customerId);
  return `${pageHeader({ eyebrow: "Customer checkout", title: "Order gas", subtitle: "Review your price breakdown and confirm your order. You’ll remain in control of every refill." })}
    <div class="grid two-col">
      <article class="card panel"><h2>Your cylinder</h2><p>Select a cylinder size. Your estimated total updates as you adjust the pricing assumptions.</p><form id="customerOrderForm"><div class="form-grid"><div class="field"><label for="customerCylinderSize">Cylinder size</label><select id="customerCylinderSize" name="kg"><option value="6">6 kg</option><option value="12" selected>12 kg</option><option value="15">15 kg</option></select></div><div class="field"><label>Delivery region</label><input value="${customer.region}, Kigali" readonly></div></div><div class="notice blue">Your order is associated with your customer account. This preview does not contact a supplier or arrange delivery.</div><div class="form-actions"><button class="btn btn-primary" type="submit">Confirm order</button></div></form></article>
      <article class="card panel"><h2>Transparent price breakdown</h2><p>Adjust each assumption to explore how it contributes to your estimated total.</p><div class="form-grid"><div class="field"><label for="customerGasPrice">Reference gas price (RWF/kg)</label><input id="customerGasPrice" type="number" min="0" value="1400"></div><div class="field"><label for="customerLogistics">Logistics (RWF)</label><input id="customerLogistics" type="number" min="0" value="2500"></div><div class="field"><label for="customerTaxRate">Taxes & charges assumption (%)</label><input id="customerTaxRate" type="number" min="0" max="100" value="18"></div><div class="field"><label for="customerFee">Platform fee (RWF)</label><input id="customerFee" type="number" min="0" value="500"></div><div class="field"><label for="customerRetailReference">Retail comparison reference (RWF)</label><input id="customerRetailReference" type="number" min="0" value="22000"></div></div><div class="price-line"><span>Reference gas price</span><strong id="customerGasLine">${formatRwf(16800)}</strong></div><div class="price-line"><span>Logistics & fulfilment</span><strong id="customerDeliveryLine">${formatRwf(2500)}</strong></div><div class="price-line"><span>Taxes & charges</span><strong id="customerTaxLine">${formatRwf(3474)}</strong></div><div class="price-line"><span>DirectGas platform fee</span><strong id="customerFeeLine">${formatRwf(500)}</strong></div><div class="price-total"><span>Estimated customer price</span><strong id="customerTotalLine">${formatRwf(23274)}</strong></div><div class="savings-box"><span>Compared with editable retail reference</span><strong id="customerSavingsLine">− RWF 0*</strong></div><div class="fine-print">All values are editable assumptions, not verified market prices, taxes or savings. Confirm actual charges with a licensed supplier.</div></article>
    </div>`;
}

export function mount({ session, toast, refresh }) {
  ["customerCylinderSize", "customerGasPrice", "customerLogistics", "customerTaxRate", "customerFee", "customerRetailReference"].forEach(id => document.getElementById(id).addEventListener("input", updatePrice));
  updatePrice();
  document.getElementById("customerOrderForm").addEventListener("submit", event => {
    event.preventDefault();
    const kg = new FormData(event.currentTarget).get("kg");
    try {
      const demoPrice = Number(document.getElementById("customerTotalLine").textContent.replace(/[^\d]/g, ""));
      const order = createOrder({ actor: session, customerId: session.customerId, kg, demoPrice });
      toast(`Order ${order.id} confirmed. Supplier demand updated.`);
      refresh();
    } catch (error) {
      toast(error.message);
    }
  });
}
