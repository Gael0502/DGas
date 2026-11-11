import { getState, updateCustomerProfile } from "../state.js";
import { escapeHTML, pageHeader } from "../ui.js";

export function render({ session }) {
  const customer = getState().customers.find(item => item.id === session.customerId);
  return `${pageHeader({ eyebrow: "Personal settings", title: "My account", subtitle: "Review the profile associated with your demo login." })}
    <div class="grid two-col">
      <article class="card panel"><div class="profile-card" style="padding:0 0 14px"><span class="profile-avatar">${escapeHTML(customer.initials)}</span><span><strong>${escapeHTML(customer.name)}</strong><small>Residential customer · ${escapeHTML(customer.region)}, Rwanda</small></span></div><div class="price-line"><span>Email</span><strong>${escapeHTML(customer.email || session.email)}</strong></div><form id="customerProfileForm"><div class="field" style="margin-top:12px"><label for="customerPhone">Phone number (demo profile)</label><input id="customerPhone" name="phone" value="${escapeHTML(customer.phone)}" required minlength="6" maxlength="32"></div><div class="form-actions"><button class="btn btn-primary" type="submit">Save my profile</button></div></form><div class="price-line"><span>Customer reference</span><strong>${escapeHTML(customer.id)}</strong></div><div class="notice blue">Demo profile information is fictional and stored only in your browser’s local demo data.</div></article>
      <article class="card panel"><h2>Account preferences</h2><p>These are display controls for the demo only.</p><div class="toggle-row"><div><strong>Low supply reminder</strong><small>Show the estimated refill prompt on your dashboard.</small></div><span class="status">On</span></div><div class="toggle-row"><div><strong>Price assumption notices</strong><small>Label illustrative calculator values clearly.</small></div><span class="status">On</span></div><div class="fine-print">No emails, SMS messages or push notifications are sent.</div></article>
    </div>`;
}

export function mount({ session, toast, refresh }) {
  document.getElementById("customerProfileForm").addEventListener("submit", event => {
    event.preventDefault();
    const phone = new FormData(event.currentTarget).get("phone");
    try {
      updateCustomerProfile({ actor: session, phone });
      toast("Your demo profile was updated.");
      refresh();
    } catch (error) {
      toast(error.message);
    }
  });
}
