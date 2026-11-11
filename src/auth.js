export const DEMO_PASSWORD = "DirectGasDemo2026!";

export const demoAccounts = [
  {
    email: "admin@directgas.rw",
    name: "DirectGas Administrator",
    role: "admin",
    label: "Administrator",
    initials: "DA",
    customerId: null
  },
  {
    email: "factory@directgas.rw",
    name: "Kigali Energy Hub",
    role: "factory",
    label: "Factory / Supplier",
    initials: "KH",
    customerId: null
  },
  {
    email: "customer@directgas.rw",
    name: "Aline Mukamana",
    role: "customer",
    label: "Customer",
    initials: "AM",
    customerId: "CUS-0284"
  }
];

const SESSION_KEY = "directgas-demo-session-v1";

export const roleHomes = {
  admin: "/admin/dashboard",
  factory: "/factory/dashboard",
  customer: "/customer/dashboard"
};

export const roleNavigation = {
  admin: [
    { path: "/admin/dashboard", title: "DirectGas Control Tower", label: "Overview", group: "Platform", icon: "grid" },
    { path: "/admin/suppliers", title: "Supplier Management", label: "Suppliers", group: "Platform", icon: "factory" },
    { path: "/admin/customers", title: "Customer Management", label: "Customers", group: "Platform", icon: "users" },
    { path: "/admin/orders", title: "Order Management", label: "Orders", group: "Platform", icon: "package" },
    { path: "/admin/intelligence", title: "Demand Intelligence", label: "Demand intelligence", group: "Intelligence", icon: "chart" },
    { path: "/admin/finance", title: "Financial Intelligence", label: "Financial intelligence", group: "Intelligence", icon: "coins" },
    { path: "/admin/replenishment", title: "Smart Replenishment", label: "Replenishment", group: "Customer tools", icon: "refresh" },
    { path: "/admin/cylinder-ownership", title: "DirectGas Own", label: "Cylinder ownership", group: "Customer tools", icon: "lock" },
    { path: "/admin/settings", title: "Administration", label: "Settings & accounts", group: "Administration", icon: "settings" }
  ],
  factory: [
    { path: "/factory/dashboard", title: "Factory Intelligence Centre", label: "Overview", group: "Factory workspace", icon: "grid" },
    { path: "/factory/regional-demand", title: "Regional Demand", label: "Regional demand", group: "Market intelligence", icon: "map" },
    { path: "/factory/intelligence", title: "Demand Forecasting", label: "Demand forecasting", group: "Market intelligence", icon: "chart" },
    { path: "/factory/incoming-orders", title: "Incoming Orders", label: "Incoming orders", group: "Factory workspace", icon: "package" },
    { path: "/factory/history", title: "Demand History", label: "Demand history", group: "Insights", icon: "refresh" },
    { path: "/factory/supply-records", title: "Supply Overview", label: "Supply overview", group: "Insights", icon: "factory" },
    { path: "/factory/reports", title: "Demand Reports", label: "Reports", group: "Workspace", icon: "download" },
    { path: "/factory/account", title: "Account Settings", label: "Account settings", group: "Workspace", icon: "settings" }
  ],
  customer: [
    { path: "/customer/dashboard", title: "My DirectGas", label: "Overview", group: "My DirectGas", icon: "grid" },
    { path: "/customer/order-gas", title: "Order Gas", label: "Order gas", group: "My DirectGas", icon: "package" },
    { path: "/customer/orders", title: "My Orders", label: "My orders", group: "My DirectGas", icon: "refresh" },
    { path: "/customer/replenishment", title: "Smart Replenishment", label: "Replenishment", group: "My DirectGas", icon: "chart" },
    { path: "/customer/ownership", title: "DirectGas Own", label: "Cylinder ownership", group: "My account", icon: "lock" },
    { path: "/customer/account", title: "Customer Account", label: "Account", group: "My account", icon: "settings" }
  ]
};

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const stored = JSON.parse(raw);
    const account = demoAccounts.find(item => item.email === stored.email && item.role === stored.role);
    if (!account) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return { ...account, authenticatedAt: stored.authenticatedAt };
  } catch (error) {
    console.warn("Could not read the DirectGas demo session; the user has been signed out.", error);
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function login(email, password) {
  const account = demoAccounts.find(item => item.email === email.trim().toLowerCase());
  if (!account || password !== DEMO_PASSWORD) {
    throw new Error("Email or password is incorrect. Use one of the demo accounts below.");
  }
  const session = { ...account, authenticatedAt: new Date().toISOString() };
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    email: session.email,
    role: session.role,
    authenticatedAt: session.authenticatedAt
  }));
  return session;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function accountForRole(role) {
  return demoAccounts.find(item => item.role === role) || null;
}
