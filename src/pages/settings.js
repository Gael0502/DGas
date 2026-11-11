import { getState, resetDemoData, updatePreference, updateWorkspace } from "../state.js";
import { escapeHTML, pageHeader } from "../ui.js";
import { demoAccounts } from "../auth.js";

const preferenceLabels = [
  ["emailAlerts", "Email activity alerts", "Order and workspace activity updates."],
  ["lowSupplyReminder", "Low supply reminders", "Customer replenishment prompts."],
  ["priceAlerts", "Price assumption alerts", "Changes to pricing assumptions."],
  ["weeklyDigest", "Weekly intelligence summary", "A summary of regional demand."]
];

export function render() {
  const state = getState();
  const workspace = state.workspace;
  const preferences = preferenceLabels.map(([key, title, description]) => `<div class="toggle-row"><div><strong>${title}</strong><small>${description}</small></div><button class="switch" type="button" role="switch" aria-checked="${state.preferences[key]}" data-preference="${key}" aria-label="${title}"></button></div>`).join("");
  return `${pageHeader({ eyebrow: "Workspace controls", title: "Administration", subtitle: "Manage workspace settings, access roles and operating preferences." })}
    <div class="grid two-col">
      <article class="card panel"><h2>Workspace settings</h2><p>Set the workspace display name, operating region and locale.</p><form id="workspaceForm"><div class="form-grid"><div class="field"><label for="workspaceName">Workspace name</label><input id="workspaceName" name="name" required value="${escapeHTML(workspace.name)}"></div><div class="field"><label for="workspaceRegion">Operating region</label><select id="workspaceRegion" name="region"><option ${workspace.region === "Kigali" ? "selected" : ""}>Kigali</option><option ${workspace.region === "Northern Province" ? "selected" : ""}>Northern Province</option><option ${workspace.region === "Southern Province" ? "selected" : ""}>Southern Province</option><option ${workspace.region === "Eastern Province" ? "selected" : ""}>Eastern Province</option><option ${workspace.region === "Western Province" ? "selected" : ""}>Western Province</option></select></div><div class="field"><label for="workspaceCurrency">Display currency</label><select id="workspaceCurrency" name="currency"><option ${workspace.currency === "RWF" ? "selected" : ""}>RWF</option><option ${workspace.currency === "USD" ? "selected" : ""}>USD</option></select></div><div class="field"><label for="workspaceTimezone">Timezone</label><select id="workspaceTimezone" name="timezone"><option ${workspace.timezone === "Africa/Kigali" ? "selected" : ""}>Africa/Kigali</option><option ${workspace.timezone === "UTC" ? "selected" : ""}>UTC</option></select></div></div><div class="form-actions"><button class="btn btn-primary" type="submit">Save changes</button></div></form></article>
      <article class="card panel"><h2>Notification preferences</h2><p>Choose which updates appear in the workspace.</p>${preferences}<div class="fine-print">External email and SMS notifications are not enabled.</div></article>
      <article class="card panel"><h2>Workspace roles</h2><p>Role-specific access across the DirectGas platform.</p>${demoAccounts.map(account => `<div class="history-item"><div><strong>${escapeHTML(account.role === "factory" ? "Factory / Supplier" : account.label)}</strong><small>${escapeHTML(account.role === "admin" ? "Platform oversight and administration" : account.role === "factory" ? "Aggregated demand and supply planning" : "Personal orders and replenishment")}</small></div><span class="status">${escapeHTML(account.role)}</span></div>`).join("")}<div class="fine-print">Role access is illustrative and not connected to a production identity service.</div></article>
      <article class="card panel"><h2>Platform services</h2><p>Current workspace capabilities and service connections.</p><div class="price-line"><span>Environment</span><strong>Presentation workspace</strong></div><div class="price-line"><span>Data storage</span><strong>This browser</strong></div><div class="price-line"><span>Supplier connections</span><strong>Not connected</strong></div><div class="price-line"><span>Payment processing</span><strong>Not connected</strong></div><div class="price-line"><span>Physical delivery</span><strong>Licensed operators</strong></div><button class="btn btn-danger btn-small" id="resetDemoData" style="margin-top:12px">Restore initial records</button></article>
      <article class="card panel"><h2>Data and access</h2><p>Use this preview with illustrative records only; do not enter real customer information.</p><div class="notice blue">Access controls shown here are for product presentation. A production service must enforce authentication, authorization and data protection on a trusted backend.</div><div class="fine-print">Changes are stored in this browser and can be restored to the initial workspace records.</div></article>
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
      toast("Workspace settings saved.");
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
    if (!window.confirm("Restore the workspace to its initial sample records? This will remove current local changes.")) return;
    try {
      resetDemoData(session);
      toast("Workspace restored to its initial records.");
      refresh();
    } catch (error) {
      toast(error.message);
    }
  });
}
