import { pageHeader } from "../ui.js";

export function render() {
  return `${pageHeader({ eyebrow: "Factory workspace", title: "Account settings", subtitle: "Business information and visibility settings for the supplier account currently signed in." })}
    <div class="grid two-col">
      <article class="card panel"><div class="profile-card" style="padding:0 0 14px"><span class="profile-avatar">KH</span><span><strong>Kigali Energy Hub</strong><small>Factory / supplier · Kigali service area</small></span><span class="status">Active</span></div><div class="price-line"><span>Account email</span><strong>factory@directgas.rw</strong></div><div class="price-line"><span>Supplier reference</span><strong>SUP-001</strong></div><div class="price-line"><span>Declared monthly capacity</span><strong>3,200 kg</strong></div><div class="price-line"><span>Service score</span><strong>96%</strong></div><div class="fine-print">Capacity and service score are planning assumptions.</div></article>
      <article class="card panel"><h2>Factory visibility</h2><p>Your supplier role is limited to aggregated regional demand and assigned supplier planning information.</p><div class="toggle-row"><div><strong>Customer identities</strong><small>Names, contact information and personal order history</small></div><span class="status cancelled">Restricted</span></div><div class="toggle-row"><div><strong>Regional confirmed demand</strong><small>Aggregated customer-confirmed volume</small></div><span class="status">Visible</span></div><div class="toggle-row"><div><strong>Forecast estimates</strong><small>Clearly separated from confirmed orders</small></div><span class="status predicted">Visible</span></div></article>
    </div>
    <div class="notice blue">Supplier visibility is limited to aggregated market signals. Customer-identifying details remain restricted to authorized customer and administrator workspaces.</div>`;
}

export function mount() {}
