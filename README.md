# DirectGas three-role demonstration

The app is a dependency-free browser application organized as ES modules. This workspace has no Node.js/npm runtime, so the existing runnable architecture was preserved instead of introducing a React/Vite toolchain that could not be started or validated here.

## Run locally on Windows

```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```

Open [http://localhost:4174/login](http://localhost:4174/login). To choose another port, pass `-Port 4300`.

The PowerShell static server serves each protected route directly and falls back to the app entry point.

## Demo accounts

All three demo accounts use `DirectGasDemo2026!`:

| Role | Email | Home |
|---|---|---|
| Admin | `admin@directgas.rw` | `/admin/dashboard` |
| Factory / Supplier | `factory@directgas.rw` | `/factory/dashboard` |
| Customer | `customer@directgas.rw` | `/customer/dashboard` |

Use the quick-access account buttons on the sign-in page for the competition demo.

## Factory Intelligence Centre

The Factory role has dedicated Overview, Regional Demand, Demand Forecasting, Incoming Orders, Demand History, Supply Overview, Reports, and Account Settings pages. Region, forecast horizon, and demand-category filters update the applicable views. Reports can be exported as CSV and contain regional totals and order references only; factory screens do not expose customer names, phone numbers, or personal order history.

Confirmed demand comes from customer-submitted demo orders. Predicted demand is modeled independently across 7-, 30-, and 90-day horizons. Illustrative available and committed supply records can trigger allocation or supply-gap planning alerts; these figures are not verified stock or delivery commitments.

## Shared data and security

Confirmed demonstration orders persist in browser local storage and update the admin and factory views. Factory views contain aggregated order reference, region, quantity, date and status only; customer names, phone numbers and personal order history are not rendered for that role. Customer order, profile and financing pages are scoped to the signed-in customer demo account. Only admin views can update order status and manage supplier/customer demo records.

Login credentials are hard-coded, and role checks run in frontend JavaScript. This is demo authentication—not production security. Do not enter real personal data. Production authentication and authorization must be enforced by a backend. The app has no real supplier, payment, messaging, or delivery integration.

To restore the initial sample data, sign in as Admin, open **Settings & accounts**, and choose **Reset demo data**. This resets shared demo records but does not sign out the current account.
