import * as adminDashboard from "./pages/dashboard.js";
import * as adminSuppliers from "./pages/suppliers.js";
import * as adminIntelligence from "./pages/intelligence.js";
import * as adminCustomers from "./pages/customers.js";
import * as adminOrders from "./pages/orders.js";
import * as adminReplenishment from "./pages/replenishment.js";
import * as adminFinance from "./pages/finance.js";
import * as adminOwnership from "./pages/ownership.js";
import * as adminSettings from "./pages/settings.js";
import * as factoryDashboard from "./pages/factory-dashboard.js";
import * as factoryOrders from "./pages/factory-orders.js";
import * as factorySupply from "./pages/factory-supply.js";
import * as factoryAccount from "./pages/factory-account.js";
import * as factoryHistory from "./pages/factory-history.js";
import * as factoryRegionalDemand from "./pages/factory-regional-demand.js";
import * as factoryReports from "./pages/factory-reports.js";
import * as customerDashboard from "./pages/customer-dashboard.js";
import * as customerOrder from "./pages/customer-order.js";
import * as customerOrders from "./pages/customer-orders.js";
import * as customerAccount from "./pages/customer-account.js";
import * as loginPage from "./pages/login.js";
import { getSession, login, logout, roleHomes, roleNavigation } from "./auth.js";
import { refreshStateFromStorage, STORAGE_KEY, getState } from "./state.js";
import { escapeHTML, shell } from "./ui.js";

const routeDefinitions = {
  "/admin/dashboard": { role: "admin", title: "DirectGas Control Tower", page: adminDashboard },
  "/admin/suppliers": { role: "admin", title: "Supplier Management", page: adminSuppliers },
  "/admin/customers": { role: "admin", title: "Customer Management", page: adminCustomers },
  "/admin/orders": { role: "admin", title: "Order Management", page: adminOrders },
  "/admin/intelligence": { role: "admin", title: "Demand Intelligence", page: adminIntelligence },
  "/admin/finance": { role: "admin", title: "Financial Intelligence", page: adminFinance },
  "/admin/replenishment": { role: "admin", title: "Smart Replenishment", page: adminReplenishment },
  "/admin/cylinder-ownership": { role: "admin", title: "DirectGas Own", page: adminOwnership },
  "/admin/settings": { role: "admin", title: "Administration", page: adminSettings },
  "/factory/dashboard": { role: "factory", title: "Factory Intelligence Centre", page: factoryDashboard },
  "/factory/regional-demand": { role: "factory", title: "Regional Demand", page: factoryRegionalDemand },
  "/factory/intelligence": { role: "factory", title: "Demand Forecasting", page: adminIntelligence },
  "/factory/incoming-orders": { role: "factory", title: "Incoming Orders", page: factoryOrders },
  "/factory/history": { role: "factory", title: "Demand History", page: factoryHistory },
  "/factory/supply-records": { role: "factory", title: "Supply Overview", page: factorySupply },
  "/factory/reports": { role: "factory", title: "Demand Reports", page: factoryReports },
  "/factory/account": { role: "factory", title: "Supplier Account", page: factoryAccount },
  "/customer/dashboard": { role: "customer", title: "My DirectGas", page: customerDashboard },
  "/customer/order-gas": { role: "customer", title: "Order Gas", page: customerOrder },
  "/customer/orders": { role: "customer", title: "My Orders", page: customerOrders },
  "/customer/replenishment": { role: "customer", title: "Smart Replenishment", page: adminReplenishment },
  "/customer/ownership": { role: "customer", title: "DirectGas Own", page: adminOwnership },
  "/customer/account": { role: "customer", title: "My Account", page: customerAccount }
};

const legacyPaths = {
  "/dashboard": { admin: "/admin/dashboard", factory: "/factory/dashboard", customer: "/customer/dashboard" },
  "/suppliers": { admin: "/admin/suppliers" },
  "/customers": { admin: "/admin/customers" },
  "/orders": { admin: "/admin/orders", factory: "/factory/incoming-orders", customer: "/customer/orders" },
  "/intelligence": { admin: "/admin/intelligence", factory: "/factory/intelligence" },
  "/finance": { admin: "/admin/finance", customer: "/customer/order-gas" },
  "/replenishment": { admin: "/admin/replenishment", customer: "/customer/replenishment" },
  "/cylinder-ownership": { admin: "/admin/cylinder-ownership", customer: "/customer/ownership" },
  "/settings": { admin: "/admin/settings", factory: "/factory/account", customer: "/customer/account" }
};

const app = document.getElementById("app");
const toastElement = document.getElementById("toast");
let toastTimer;

function toast(message) {
  toastElement.textContent = message;
  toastElement.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastElement.classList.remove("show"), 2800);
}

function resolvePath(path, session) {
  if (path === "/login") return path;
  if (!session) return "/login";
  if (path === "/" || path === "/admin" || path === "/factory" || path === "/customer") {
    return roleHomes[session.role];
  }
  const alias = legacyPaths[path];
  if (alias) return alias[session.role] || roleHomes[session.role];
  const definition = routeDefinitions[path];
  return definition?.role === session.role ? path : roleHomes[session.role];
}

function navigate(path, { replace = false, denied = false } = {}) {
  const session = getSession();
  const target = resolvePath(path, session);
  if (denied && target !== path) toast("That page is not available to your role.");
  if (window.location.pathname !== target) {
    if (replace) history.replaceState({}, "", target);
    else history.pushState({}, "", target);
  }
  renderRoute();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderLogin() {
  app.innerHTML = loginPage.render();
  loginPage.mount({
    onLogin(email, password) {
      const session = login(email, password);
      navigate(roleHomes[session.role], { replace: true });
    }
  });
  document.title = "DirectGas — Sign in";
}

function renderRoute() {
  let session = getSession();
  if (window.location.pathname === "/login") {
    if (session) {
      navigate(roleHomes[session.role], { replace: true });
      return;
    }
    renderLogin();
    return;
  }

  const target = resolvePath(window.location.pathname, session);
  if (target === "/login") {
    history.replaceState({}, "", target);
    renderLogin();
    return;
  }
  if (target !== window.location.pathname) {
    const denied = Boolean(session && routeDefinitions[window.location.pathname] &&
      routeDefinitions[window.location.pathname].role !== session.role);
    history.replaceState({}, "", target);
    if (denied) toast("That page is not available to your role.");
  }

  session = getSession();
  const route = routeDefinitions[target];
  if (!session || !route || route.role !== session.role) {
    history.replaceState({}, "", "/login");
    renderLogin();
    return;
  }
  const pageMarkup = route.page.render({ session, role: session.role });
  app.innerHTML = shell(target, pageMarkup, session, roleNavigation[session.role]);
  route.page.mount?.({ toast, refresh: renderRoute, navigate, session });
  bindShell(session);
  document.title = `DirectGas — ${route.title}`;
}

function togglePopover(popoverId) {
  const selected = document.getElementById(popoverId);
  const open = !selected.classList.contains("open");
  document.querySelectorAll(".popover.open").forEach(element => element.classList.remove("open"));
  if (open) selected.classList.add("open");
  document.getElementById("searchResults")?.classList.remove("open");
}

function bindSearch(session) {
  const input = document.getElementById("globalSearch");
  const results = document.getElementById("searchResults");
  const nav = roleNavigation[session.role];
  const renderResults = () => {
    const query = input.value.trim().toLowerCase();
    if (!query) {
      results.classList.remove("open");
      results.innerHTML = "";
      return;
    }
    const routeResults = nav.filter(item => `${item.title} ${item.label}`.toLowerCase().includes(query))
      .map(item => `<a class="search-result" href="${item.path}" data-route="${item.path}">${escapeHTML(item.title)}<small>Open your workspace</small></a>`);
    const state = getState();
    let orderResults = [];
    if (session.role === "admin") {
      orderResults = state.orders.filter(order => `${order.id} ${order.customer} ${order.region}`.toLowerCase().includes(query)).slice(0, 3)
        .map(order => `<a class="search-result" href="/admin/orders" data-route="/admin/orders">${escapeHTML(order.id)} · ${escapeHTML(order.customer)}<small>${escapeHTML(order.region)} · ${escapeHTML(order.status)}</small></a>`);
    } else if (session.role === "factory") {
      orderResults = state.orders.filter(order => `${order.id} ${order.region} ${order.status}`.toLowerCase().includes(query)).slice(0, 3)
        .map(order => `<a class="search-result" href="/factory/incoming-orders" data-route="/factory/incoming-orders">${escapeHTML(order.id)} · ${escapeHTML(order.region)}<small>Aggregated demand · ${escapeHTML(order.status)}</small></a>`);
    } else {
      orderResults = state.orders.filter(order => order.customerId === session.customerId && `${order.id} ${order.region} ${order.status}`.toLowerCase().includes(query)).slice(0, 3)
        .map(order => `<a class="search-result" href="/customer/orders" data-route="/customer/orders">${escapeHTML(order.id)} · ${formatOrder(order)}<small>${escapeHTML(order.region)} · ${escapeHTML(order.status)}</small></a>`);
    }
    const customerResults = session.role === "admin"
      ? state.customers.filter(customer => `${customer.name} ${customer.id} ${customer.region}`.toLowerCase().includes(query)).slice(0, 3)
        .map(customer => `<a class="search-result" href="/admin/customers" data-route="/admin/customers">${escapeHTML(customer.name)}<small>${escapeHTML(customer.id)} · ${escapeHTML(customer.region)}</small></a>`)
      : [];
    const supplierResults = session.role === "admin"
      ? state.suppliers.filter(supplier => `${supplier.name} ${supplier.id} ${supplier.region}`.toLowerCase().includes(query)).slice(0, 3)
        .map(supplier => `<a class="search-result" href="/admin/suppliers" data-route="/admin/suppliers">${escapeHTML(supplier.name)}<small>${escapeHTML(supplier.id)} · ${escapeHTML(supplier.region)}</small></a>`)
      : session.role === "factory" && `kigali energy hub sup-001 gasabo`.includes(query)
        ? ['<a class="search-result" href="/factory/account" data-route="/factory/account">Kigali Energy Hub<small>SUP-001 · assigned supplier account</small></a>']
        : [];
    const matching = [...routeResults, ...orderResults, ...customerResults, ...supplierResults].slice(0, 8);
    results.innerHTML = matching.length ? matching.join("") : '<div class="empty-state">No matching pages or permitted records.</div>';
    results.classList.add("open");
  };
  input.addEventListener("input", renderResults);
  input.addEventListener("keydown", event => {
    if (event.key === "Escape") results.classList.remove("open");
    if (event.key === "Enter") {
      const firstLink = results.querySelector("[data-route]");
      if (firstLink) navigate(firstLink.dataset.route);
    }
  });
}

function formatOrder(order) {
  return `${escapeHTML(order.kg)} kg`;
}

function bindShell(session) {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("mobileOverlay");
  document.getElementById("collapseToggle").addEventListener("click", () => {
    document.getElementById("appShell").classList.toggle("is-collapsed");
  });
  const closeMobile = () => {
    sidebar.classList.remove("mobile-open");
    overlay.classList.remove("show");
  };
  document.getElementById("mobileToggle").addEventListener("click", () => {
    sidebar.classList.toggle("mobile-open");
    overlay.classList.toggle("show");
  });
  overlay.addEventListener("click", closeMobile);
  document.getElementById("notificationsButton").addEventListener("click", () => togglePopover("notificationsPopover"));
  document.getElementById("profileButton").addEventListener("click", () => togglePopover("profilePopover"));
  document.querySelector(".sidebar-user").addEventListener("click", () => togglePopover("profilePopover"));
  document.getElementById("logoutButton").addEventListener("click", () => {
    logout();
    navigate("/login", { replace: true });
  });
  bindSearch(session);
}

document.addEventListener("click", event => {
  const logoutButton = event.target.closest("[data-logout]");
  if (logoutButton) {
    logout();
    navigate("/login", { replace: true });
    return;
  }
  const link = event.target.closest("[data-route]");
  if (link && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
    event.preventDefault();
    const session = getSession();
    const target = resolvePath(link.dataset.route, session);
    navigate(target, { denied: target !== link.dataset.route && Boolean(session) });
    return;
  }
  if (!event.target.closest(".popover-anchor") && !event.target.closest(".sidebar-user")) {
    document.querySelectorAll(".popover.open").forEach(element => element.classList.remove("open"));
  }
  if (!event.target.closest(".search-wrap")) document.getElementById("searchResults")?.classList.remove("open");
});

window.addEventListener("popstate", renderRoute);
window.addEventListener("storage", event => {
  if (event.key === STORAGE_KEY) {
    refreshStateFromStorage();
    if (getSession()) renderRoute();
  } else if (event.key === "directgas-demo-session-v1") {
    renderRoute();
  }
});

const initialSession = getSession();
if (window.location.pathname === "/") {
  history.replaceState({}, "", initialSession ? roleHomes[initialSession.role] : "/login");
}
renderRoute();
