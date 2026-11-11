import { getState, resetDemoData, updatePreference, updateWorkspace } from "../state.js";
import { escapeHTML, pageHeader } from "../ui.js";
import { demoAccounts, DEMO_PASSWORD } from "../auth.js";

const preferenceLabels = [
  ["emailAlerts", "Email activity alerts", "Demo alert preferences for order and workspace events."],
  ["lowSupplyReminder", "Low supply reminders", "Show customer replenishment reminders in this demo."],
  ["priceAlerts", "Price assumption alerts", "Highlight changes to illustrative pricing assumptions."],
  ["weeklyDigest", "Weekly intelligence summary", "Show a weekly demand summary in the notification center."]
];

export function render() {
  const state = getState();
  const workspace = state.workspace;
  const preferences = preferenceLabels.map(([key, title, description]) => `<div class="toggle-row"><div><strong>${title}</strong><small>${description}</small></div><button class="switch" type="button" role="switch" aria-checked="${state.preferences[key]}" data-preference="${key}" aria-label="${title}"></button></div>`).join("");
  return `${pageHeader({ eyebrow: "Workspace controls", title: "Administration", subtitle: "Configure the local demonstration workspace and notification preferences." })}
    <div class="grid two-col">
      <article class="card panel"><h2>Workspace settings</h2><p>These settings apply only to this browser demonstration environment.</p><form id="workspaceForm"><div class="form-grid"><div class="field"><label for="workspaceName">Workspace name</label><input id="workspaceName" name="name" required value="${escapeHTML(workspace.name)}"></div><div class="field"><label for="workspaceRegion">Operating region</label><select id="workspaceRegion" name="region"><option ${workspace.region === "Kigali" ? "selected" : ""}>Kigali</option><option ${workspace.region === "Northern Province" ? "selected" : ""}>Northern Province</option><option ${workspace.region === "Southern Province" ? "selected" : ""}>Southern Province</option><option ${workspace.region === "Eastern Province" ? "selected" : ""}>Eastern Province</option><option ${workspace.region === "Western Province" ? "selected" : ""}>Western Province</option></select></div><div class="field"><label for="workspaceCurrency">Display currency</label><select id="workspaceCurrency" name="currency"><option ${workspace.currency === "RWF" ? "selected" : ""}>RWF</option><option ${workspace.currency === "USD" ? "selected" : ""}>USD</option></select></div><div class="field"><label for="workspaceTimezone">Timezone</label><select id="workspaceTimezone" name="timezone"><option ${workspace.timezone === "Africa/Kigali" ? "selected" : ""}>Africa/Kigali</option><option ${workspace.timezone === "UTC" ? "selected" : ""}>UTC</option></select></div></div><div class="form-actions"><button class="btn btn-primary" type="submit">Save workspace</button></div></form></article>
      <article class="card panel"><h2>Notifications</h2><p>Toggle local demo notifications. No email, SMS or push message is sent.</p>${preferences}</article>
      <article class="card panel"><h2>Demo account management</h2><p>Exactly three role accounts are available for this competition demonstration.</p>${demoAccounts.map(account => `<div class="history-item"><div><strong>${escapeHTML(account.label)}</strong><small>${escapeHTML(account.email)}</small></div><span class="status">${escapeHTML(account.role)}</span></div>`).join("")}<div class="fine-print">Shared demo password: <code>${escapeHTML(DEMO_PASSWORD)}</code>. These accounts are hard-coded browser demo identities, not production users.</div></article>
      <article class="card panel"><h2>Application environment</h2><p>DirectGas is running as a self-contained demonstration app.</p><div class="price-line"><span>Environment</span><strong>Local demo · local storage</strong></div><div class="price-line"><span>External API integrations</span><strong>None configured</strong></div><div class="price-line"><span>Payment processing</span><strong>Not connected</strong></div><div class="price-line"><span>Physical delivery</span><strong>Not connected</strong></div><button class="btn btn-danger btn-small" id="resetDemoData" style="margin-top:12px">Reset demo data</button></article>
      <article class="card panel"><h2>Data and privacy</h2><p>Customer, supplier, finance and demand records are illustrative browser-local examples.</p><div class="notice blue">Do not enter real customer information. Demo role checks run in frontend JavaScript and are not production security. A production backend must enforce authentication and authorization.</div><div class="fine-print">Demo order updates persist in this browser’s local storage and can be reset by clearing this site’s local storage.</div></article>
    </div>`;
}

export function mount({ toast, session, refresh }) {
  document.getElementById("workspaceForm").addEventListener("submit", event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      updateWorkspace({
        name: form.get("name"),
        region: form.get("region"),
        currency: form.get("currency"),
        timezone: form.get("timezone")
      }, session);
      toast("Workspace settings saved for this demo session.");
    } catch (error) {
      toast(error.message);
    }
  });
  document.querySelectorAll("[data-preference]").forEach(button => button.addEventListener("click", () => {
    const key = button.dataset.preference;
    const next = button.getAttribute("aria-checked") !== "true";
    try {
      updatePreference(key, next, session);
      button.setAttribute("aria-checked", String(next));
      toast(`${button.getAttribute("aria-label")} ${next ? "enabled" : "disabled"}.`);
    } catch (error) {
      toast(error.message);
    }
  }));
  document.getElementById("resetDemoData").addEventListener("click", () => {
    if (!window.confirm("Reset all shared demonstration records to the original sample data?")) return;
    try {
      resetDemoData(session);
      toast("Shared demonstration data reset.");
      refresh();
    } catch (error) {
      toast(error.message);
    }
  });
}
