import { getState } from "./state.js";

const iconPaths = {
  grid: '<rect x="2.5" y="2.5" width="6" height="6" rx="1.2"/><rect x="11.5" y="2.5" width="6" height="6" rx="1.2"/><rect x="2.5" y="11.5" width="6" height="6" rx="1.2"/><rect x="11.5" y="11.5" width="6" height="6" rx="1.2"/>',
  factory: '<path d="M3 17V8l5 3V8l5 3V5l4-2v14H3Z"/><path d="M6 14h1m3 0h1m3 0h1"/>',
  chart: '<path d="M3 16V4m0 12h14"/><path d="m5 13 3-4 3 2 5-6"/><path d="M13 5h3v3"/>',
  map: '<path d="m2 5 5-2 6 2 5-2v12l-5 2-6-2-5 2V5Z"/><path d="M7 3v12m6-10v12"/>',
  download: '<path d="M10 2v10m-4-4 4 4 4-4"/><path d="M3 13v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4"/>',
  users: '<circle cx="7" cy="7" r="3"/><path d="M2 17c0-2.7 2-4.5 5-4.5s5 1.8 5 4.5"/><path d="M13 4.3a3 3 0 0 1 0 5.7m2 2c1.9.6 3 2.2 3 4"/>',
  package: '<path d="m10 2 7 4v8l-7 4-7-4V6l7-4Z"/><path d="m3.5 5.8 6.5 4 6.5-4M10 10v8"/>',
  refresh: '<path d="M16.5 8A6.5 6.5 0 1 0 17 11m-.5-8v5h-5"/><path d="M10 6v4l2.5 1.5"/>',
  coins: '<circle cx="10" cy="10" r="7.5"/><path d="M12.5 7.3h-3a1.5 1.5 0 1 0 0 3h1a1.5 1.5 0 1 1 0 3h-3M10 5.5v9"/>',
  lock: '<rect x="3.5" y="8" width="13" height="9" rx="2"/><path d="M6.5 8V5.5a3.5 3.5 0 0 1 7 0V8m-3.5 3v2"/>',
  settings: '<circle cx="10" cy="10" r="3"/><path d="m8.3 2.8.4-1h2.6l.4 1 1.5.7 1-.4 1.8 1.8-.4 1 .7 1.5 1 .4v2.6l-1 .4-.7 1.5.4 1-1.8 1.8-1-.4-1.5.7-.4 1H8.7l-.4-1-1.5-.7-1 .4L4 13.3l.4-1-.7-1.5-1-.4V7.8l1-.4.7-1.5-.4-1 1.8-1.8 1 .4 1.5-.7Z"/>',
  menu: '<path d="M3 5h14M3 10h14M3 15h14"/>',
  search: '<circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4 4"/>',
  bell: '<path d="M15.5 7a5.5 5.5 0 0 0-11 0c0 6-2 6-2 7.5h15C17.5 13 15.5 13 15.5 7Zm-7.5 11h4"/>',
  chevron: '<path d="m6 8 4 4 4-4"/>',
  eye: '<path d="M2 10s2.8-5 8-5 8 5 8 5-2.8 5-8 5-8-5-8-5Z"/><circle cx="10" cy="10" r="2"/>',
  logout: '<path d="M8 3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h4m4-3 4-4-4-4m4 4H7"/>'
};

export function icon(name, size = 17) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || ""}</svg>`;
}

export function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

export function formatNumber(value) {
  return Math.round(Number(value) || 0).toLocaleString("en-US");
}

export function formatRwf(value) {
  return `RWF ${formatNumber(value)}`;
}

export function statusBadge(status) {
  const className = status === "In progress" || status === "Review" || status === "New" || status === "Review allocation" || status === "Supply gap"
    ? "pending"
    : status === "Predicted" ? "predicted"
      : status === "Cancelled" ? "cancelled"
        : status === "Delivered" ? "neutral" : "";
  return `<span class="status ${className}">${escapeHTML(status)}</span>`;
}

export function pageHeader({ eyebrow, title, subtitle, actions = "" }) {
  return `<div class="page-heading"><div><div class="eyebrow">${escapeHTML(eyebrow)}</div><h1>${escapeHTML(title)}</h1><p class="subtitle">${escapeHTML(subtitle)}</p></div>${actions ? `<div class="heading-actions">${actions}</div>` : ""}</div>`;
}

export function cardHeader(title, subtitle = "", trailing = "") {
  return `<div class="card-head"><div><div class="card-title">${escapeHTML(title)}</div>${subtitle ? `<div class="card-sub">${escapeHTML(subtitle)}</div>` : ""}</div>${trailing}</div>`;
}

export function kpiCard(label, value, note, iconName = "chart", isHtmlValue = false) {
  return `<article class="card kpi"><div class="kpi-top"><span class="kpi-label">${escapeHTML(label)}</span><span class="kpi-icon">${icon(iconName, 14)}</span></div><div class="kpi-value">${isHtmlValue ? value : escapeHTML(value)}</div><div class="kpi-foot">${note}</div></article>`;
}

export function shell(path, pageMarkup, session, navItems) {
  const state = getState();
  const groups = [...new Set(navItems.map(item => item.group))];
  const nav = groups.map(group => `<div class="nav-group"><div class="nav-label">${escapeHTML(group)}</div>${navItems.filter(item => item.group === group).map(item => `<a class="nav-item ${item.path === path ? "active" : ""}" href="${item.path}" data-route="${item.path}" title="${escapeHTML(item.title)}"><span class="nav-icon">${icon(item.icon)}</span><span class="nav-text">${escapeHTML(item.label)}</span></a>`).join("")}</div>`).join("");
  const current = navItems.find(item => item.path === path);
  const notifications = session.role === "customer"
    ? `<div class="popover-item"><strong>Replenishment outlook</strong>Your next refill estimate is ready to review.</div><div class="popover-item"><strong>Order activity</strong>${state.orders.filter(order => order.customerId === session.customerId).length} orders are associated with your account.</div><div class="popover-item"><strong>Account privacy</strong>Your personal order history is visible only in your customer workspace.</div>`
    : session.role === "factory"
      ? `<div class="popover-item"><strong>Confirmed market demand</strong>${formatNumber(state.confirmedKg)} kg across ${Object.keys(state.regions).length} service areas.</div><div class="popover-item"><strong>Forecast outlook</strong>${formatNumber(state.forecastKg)} kg predicted for the planning period.</div><div class="popover-item"><strong>Supplier planning</strong>Availability and commitments are reported planning estimates.</div>`
      : `<div class="popover-item"><strong>Platform demand overview</strong>${formatNumber(state.confirmedKg)} kg across ${state.orders.filter(order => order.status !== "Cancelled").length} active order records.</div><div class="popover-item"><strong>Regional forecast</strong>${formatNumber(state.forecastKg)} kg in the current planning outlook.</div><div class="popover-item"><strong>Workspace activity</strong>Order and demand changes update across your account views.</div>`;
  const searchPlaceholder = session.role === "admin" ? "Search pages, orders, customers…" : "Search pages and orders…";
  return `<div class="app-shell" id="appShell">
    <aside class="sidebar" id="sidebar">
      <a class="brand" href="${roleHome(session.role)}" data-route="${roleHome(session.role)}" aria-label="DirectGas home">
        <span class="brand-mark"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13.2 2.8c.5 4-4.1 5.3-4.1 9.2 0 1.5 1 2.5 2.3 2.5 1.8 0 2.8-1.6 2.5-3.5 2.4 1.6 3.8 3.7 3.8 6.1a5.8 5.8 0 0 1-11.6 0c0-5.8 6.2-8.5 7.1-14.3Z" fill="white"/><path d="M12.1 21a2.8 2.8 0 0 0 2.8-2.8c0-1.1-.6-2-1.7-2.9-.1 1.9-2.7 2-2.7 3.7 0 1.1.7 2 1.6 2Z" fill="#9FE5C9"/></svg></span>
        <span class="brand-name">direct<span>gas</span></span>
      </a>
      <nav aria-label="Main navigation">${nav}</nav>
      <div class="nav-spacer"></div>
      <div class="workspace-preview"><span class="preview-dot"></span><span><strong>Planning workspace</strong><small>Illustrative data · no payment or delivery processing</small></span></div>
      <button class="sidebar-user profile-trigger" type="button" aria-label="Open profile menu"><span class="avatar">${escapeHTML(session.initials)}</span><span class="user-copy"><strong>${escapeHTML(session.name)}</strong><small>${escapeHTML(session.label)}</small></span></button>
    </aside>
    <div class="mobile-overlay" id="mobileOverlay"></div>
    <main class="main">
      <header class="topbar">
        <div class="topbar-left"><button class="icon-button mobile-toggle" id="mobileToggle" type="button" aria-label="Open navigation">${icon("menu", 19)}</button><button class="icon-button collapse-toggle" id="collapseToggle" type="button" aria-label="Collapse sidebar">${icon("menu", 18)}</button><div class="breadcrumb"><a href="${roleHome(session.role)}" data-route="${roleHome(session.role)}">DirectGas</a><span style="color:#bac2ca;margin:0 6px">/</span><b>${escapeHTML(current?.title || "Workspace")}</b></div></div>
        <div class="topbar-actions">
          <div class="search-wrap"><span class="search-icon">${icon("search", 15)}</span><input id="globalSearch" class="search-input" type="search" placeholder="${searchPlaceholder}" aria-label="Search"><div class="search-results" id="searchResults"></div></div>
          <div class="popover-anchor"><button class="icon-button" id="notificationsButton" type="button" aria-label="Workspace updates">${icon("bell")}</button><div class="popover" id="notificationsPopover"><h3 class="popover-title">Workspace updates</h3>${notifications}</div></div>
          <div class="popover-anchor"><button class="profile-button profile-trigger" id="profileButton" type="button"><span class="avatar">${escapeHTML(session.initials)}</span><span class="profile-copy"><strong>${escapeHTML(session.name)}</strong><small>${escapeHTML(session.label)}</small></span>${icon("chevron", 13)}</button><div class="popover" id="profilePopover"><h3 class="popover-title">${escapeHTML(session.email)}</h3><div class="popover-item">Signed in as <strong>${escapeHTML(session.label)}</strong>.</div><button class="popover-link" id="logoutButton" type="button">${icon("logout", 14)} &nbsp; Sign out</button><div class="popover-item">Commercial orders, payment processing and physical delivery are not enabled.</div></div></div>
        </div>
      </header>
      <div class="content" id="pageContent">${pageMarkup}</div>
      <footer class="site-footer">
        <div class="site-footer-inner">
          <section class="footer-story" aria-labelledby="footerStoryTitle">
            <div class="footer-eyebrow">Why DirectGas</div>
            <h2 id="footerStoryTitle">A better way to keep the flame on.</h2>
            <p>We grew tired of watching rising gas prices put reliable cooking fuel further out of reach for too many households. Daudi and Chrispin believed the answer started with a more connected supply chain: clearer prices for customers, better visibility into local demand, and smarter planning for suppliers.</p>
            <p>That belief became DirectGas—not just a place to order LPG, but an intelligence layer designed to help the people who need gas and the people who supply it make better-informed decisions.</p>
          </section>
          <figure class="footer-kigali">
            <img src="/assets/kigali-skyline.jpg" alt="Kigali's hillside neighborhoods and city skyline" loading="lazy" decoding="async">
            <figcaption><strong>Kigali, Rwanda</strong><span>Photo by <a href="https://www.flickr.com/photos/88357066@N07/8085984107" target="_blank" rel="noopener noreferrer">lorihowesm</a> · <a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noopener noreferrer">CC BY 2.0</a></span></figcaption>
          </figure>
          <section class="footer-founders" aria-labelledby="footerFoundersTitle">
            <div class="footer-eyebrow">The people behind the idea</div>
            <h2 id="footerFoundersTitle">Meet the founders</h2>
            <div class="founder-list">
              <article class="founder-card">
                <img class="founder-portrait daudi-portrait" src="/assets/daudi-founder.png" alt="Daudi, DirectGas CEO" loading="lazy" decoding="async">
                <div><h3>Daudi</h3><p>CEO</p></div>
              </article>
              <article class="founder-card">
                <img class="founder-portrait chrispin-portrait" src="/assets/chrispin-founder.png" alt="Chrispin, DirectGas CTO" loading="lazy" decoding="async">
                <div><h3>Chrispin</h3><p>CTO</p></div>
              </article>
              <article class="founder-card">
                <div class="founder-portrait kenny-portrait" role="img" aria-label="Portrait placeholder for Kenny"><span>K</span></div>
                <div><h3>Kenny</h3><p>CMO</p></div>
              </article>
            </div>
          </section>
        </div>
        <div class="site-footer-bottom"><span>DirectGas · LPG supply chain intelligence</span><span>Built for a more connected energy future.</span></div>
      </footer>
    </main>
  </div>`;
}

function roleHome(role) {
  return ({ admin: "/admin/dashboard", factory: "/factory/dashboard", customer: "/customer/dashboard" })[role] || "/login";
}
