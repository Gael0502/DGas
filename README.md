# DirectGas

DirectGas connects LPG consumer demand with supplier planning and regional market intelligence. This product preview demonstrates role-specific workspaces for platform administrators, factories and suppliers, and customers.

## Run locally

On Windows, start the application server:

```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```

Open [http://localhost:4174](http://localhost:4174). The sign-in page provides quick access to each workspace.

## Product preview

- **Factory Intelligence Centre:** regional demand, forecasts, incoming orders, demand history, reports and supply planning.
- **Smart replenishment:** customer-controlled refill suggestions and order confirmation.
- **Transparent pricing:** editable assumptions with a complete customer price breakdown.
- **DirectGas Own:** cylinder financing progress, tracked separately from gas purchases.
- **Shared demand signal:** customer-confirmed orders update the factory and management workspaces.

All records and planning figures are illustrative and stored in the browser. Supplier connections, payments, messaging and physical delivery are not enabled. Licensed operators remain responsible for LPG handling and fulfilment.

This preview uses client-side account and role controls and is not production authentication. Do not enter real customer information; a production service must enforce authentication, authorization and data protection on a trusted backend.
