import { initialData } from "./data.js";

export const STORAGE_KEY = "directgas-demo-data-v1";
const privilegedRoles = new Set(["admin"]);
const listeners = new Set();

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(initialData);
  try {
    const stored = JSON.parse(raw);
    if (!Array.isArray(stored.orders) || !Array.isArray(stored.customers) ||
      !Array.isArray(stored.suppliers) || !stored.regions || !Number.isFinite(stored.confirmedKg)) {
      throw new Error("Stored demo data has an invalid shape.");
    }
    const restored = { ...structuredClone(initialData), ...stored };
    restored.orders = restored.orders.map(order => ({
      ...order,
      product: order.product || `${Number(order.kg) || 0} kg LPG cylinder`,
      orderDate: order.orderDate || order.created || "Demo history"
    }));
    return restored;
  } catch (error) {
    console.warn("Could not load DirectGas demo data; the initial demonstration records are restored.", error);
    localStorage.removeItem(STORAGE_KEY);
    return structuredClone(initialData);
  }
}

let state = loadState();

function assertRole(actor, allowedRoles, action) {
  if (!actor || !allowedRoles.includes(actor.role)) {
    throw new Error(`Your demo role is not permitted to ${action}.`);
  }
}

export function getState() {
  return state;
}

export function refreshStateFromStorage() {
  state = loadState();
  notify({ type: "storage-sync" }, false);
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(change, persist = true) {
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Could not persist the DirectGas demo changes.", error);
      throw new Error("Your browser could not save this demo change. Check local storage availability and try again.");
    }
  }
  listeners.forEach(listener => listener(change, state));
}

export function createOrder({ actor, customerId, customer, region, kg }) {
  assertRole(actor, ["admin", "customer"], "create an order");
  const parsedKg = Number(kg);
  if (!Number.isFinite(parsedKg) || parsedKg <= 0) {
    throw new Error("Enter a customer, region, and a valid cylinder quantity.");
  }
  const targetCustomerId = actor.role === "customer" ? actor.customerId : customerId;
  const customerRecord = state.customers.find(item => item.id === targetCustomerId) ||
    (actor.role === "admin" ? state.customers.find(item => item.name.toLowerCase() === String(customer || "").trim().toLowerCase()) : null);
  if (!customerRecord) throw new Error("The selected customer account could not be found.");
  if (actor.role === "customer" && targetCustomerId !== actor.customerId) {
    throw new Error("Customers may only place orders for their own account.");
  }
  const id = `DG-${String(state.orderSequence).padStart(4, "0")}`;
  state.orderSequence += 1;
  const name = customerRecord.name;
  const orderRegion = actor.role === "customer" ? customerRecord.region : region || customerRecord.region;
  const demoPrice = Math.round(parsedKg * 1400 + 2500 + (parsedKg * 1400 + 2500) * .18 + 500);
  const order = {
    id,
    customer: name,
    customerId: targetCustomerId,
    product: `${parsedKg} kg LPG cylinder`,
    region: orderRegion,
    kg: parsedKg,
    orderDate: new Date().toISOString(),
    status: "Confirmed",
    created: "Just now",
    initials: name.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase(),
    demoPrice
  };
  const orderDateLabel = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  state.orders.unshift(order);
  state.personalOrders.unshift({
    date: orderDateLabel,
    kg: parsedKg,
    price: `RWF ${demoPrice.toLocaleString("en-US")}`,
    ref: id,
    customerId: targetCustomerId
  });
  state.orderCount += 1;
  state.confirmedKg += parsedKg;
  state.regions[orderRegion] = (state.regions[orderRegion] || 0) + parsedKg;
  customerRecord.orders += 1;
  customerRecord.kg += parsedKg;
  notify({ type: "order-created", order });
  return order;
}

export function updateOrderStatus({ actor, id, nextStatus }) {
  assertRole(actor, ["admin"], "update an order status");
  const allowed = ["Confirmed", "In progress", "Delivered", "Cancelled"];
  if (!allowed.includes(nextStatus)) throw new Error("Choose a valid order status.");
  const order = state.orders.find(item => item.id === id);
  if (!order) throw new Error("The selected order could not be found.");
  if (order.status === "Cancelled" || order.status === "Delivered") {
    throw new Error("Completed or cancelled demo orders cannot be changed.");
  }
  const wasConfirmed = order.status !== "In progress";
  const isConfirmed = nextStatus !== "In progress" && nextStatus !== "Cancelled";
  if (wasConfirmed && !isConfirmed) {
    state.confirmedKg = Math.max(0, state.confirmedKg - order.kg);
    state.regions[order.region] = Math.max(0, (state.regions[order.region] || 0) - order.kg);
  } else if (!wasConfirmed && isConfirmed) {
    state.confirmedKg += order.kg;
    state.regions[order.region] = (state.regions[order.region] || 0) + order.kg;
  }
  order.status = nextStatus;
  notify({ type: "order-updated", order });
  return order;
}

export function setRefillAction(action, actor) {
  assertRole(actor, ["customer"], "manage replenishment");
  if (!["confirmed", "postponed", "declined"].includes(action)) {
    throw new Error("Choose a valid replenishment action.");
  }
  if (state.refillAction !== "suggested") {
    throw new Error("This replenishment suggestion has already been actioned.");
  }
  state.refillAction = action;
  if (action === "confirmed") {
    createOrder({ actor, customerId: actor.customerId, kg: 12 });
  }
  notify({ type: "refill-action", action });
}

export function addRepayment(actor) {
  assertRole(actor, ["admin", "customer"], "record a demo financing repayment");
  const balance = Math.max(0, 48000 - state.repayments.reduce((sum, item) => sum + item.amount, 0));
  if (balance === 0) throw new Error("The illustrative financing balance is already repaid.");
  const amount = Math.min(5000, balance);
  const payment = {
    date: "Nov 11, 2026",
    reference: `OWN-DEMO-${String(state.repayments.length + 1).padStart(3, "0")}`,
    amount
  };
  state.repayments.unshift(payment);
  notify({ type: "repayment-added", payment });
  return payment;
}

export function addSupplier({ actor, name, region, capacity, contact }) {
  assertRole(actor, [...privilegedRoles], "add a supplier");
  const parsedCapacity = Number(capacity);
  if (!name.trim() || !region || !Number.isFinite(parsedCapacity) || parsedCapacity <= 0) {
    throw new Error("Enter a supplier name, region, and a valid monthly capacity.");
  }
  const supplier = {
    id: `SUP-${String(state.suppliers.length + 1).padStart(3, "0")}`,
    name: name.trim(),
    region,
    contact: contact.trim() || "Demo contact",
    capacity: parsedCapacity,
    performance: 100,
    status: "Active"
  };
  state.suppliers.unshift(supplier);
  notify({ type: "supplier-added", supplier });
  return supplier;
}

export function addCustomer({ actor, name, region, phone }) {
  assertRole(actor, [...privilegedRoles], "add a customer");
  if (!name.trim() || !region) throw new Error("Enter a customer name and region.");
  const customer = {
    id: `CUS-${String(280 + state.customers.length + 1).padStart(4, "0")}`,
    name: name.trim(),
    region,
    phone: phone.trim() || "Not provided",
    orders: 0,
    kg: 0,
    status: "New",
    initials: name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase()
  };
  state.customers.unshift(customer);
  notify({ type: "customer-added", customer });
  return customer;
}

export function updatePreference(key, value, actor) {
  assertRole(actor, [...privilegedRoles], "change workspace preferences");
  if (!Object.hasOwn(state.preferences, key) || typeof value !== "boolean") {
    throw new Error("That preference is not available.");
  }
  state.preferences[key] = value;
  notify({ type: "preference-updated", key, value });
}

export function updateWorkspace(workspace, actor) {
  assertRole(actor, [...privilegedRoles], "change workspace settings");
  const { name, region, currency, timezone } = workspace;
  if (!name.trim() || !region || !currency || !timezone) {
    throw new Error("Complete all workspace settings before saving.");
  }
  state.workspace = { name: name.trim(), region, currency, timezone };
  notify({ type: "workspace-updated", workspace: state.workspace });
}

export function updateCustomerProfile({ actor, phone }) {
  assertRole(actor, ["customer"], "change a customer profile");
  const customer = state.customers.find(item => item.id === actor.customerId);
  if (!customer) throw new Error("Your customer profile could not be found.");
  const updatedPhone = String(phone || "").trim();
  if (updatedPhone.length < 6 || updatedPhone.length > 32) {
    throw new Error("Enter a phone value between 6 and 32 characters.");
  }
  customer.phone = updatedPhone;
  notify({ type: "customer-profile-updated", customerId: customer.id });
}

export function resetDemoData(actor) {
  assertRole(actor, ["admin"], "reset demonstration data");
  state = structuredClone(initialData);
  notify({ type: "demo-reset" });
}
