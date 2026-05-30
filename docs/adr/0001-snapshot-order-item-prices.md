# ADR 0001: Snapshot Order Item Prices at Purchase Time

**Date**: 2026-05-30
**Status**: Accepted
**Supersedes**: N/A
**Related**: ADR-0003 (Payment Intent creation), ADR-0005 (Refund calculation policy)

## Context
When a customer places an order, the system must record the items purchased and their corresponding prices to calculate the total order amount. A naive implementation might simply store a foreign key to the `menu_items` table and dynamically calculate the order total by joining with the `menu_items` table whenever the order is viewed.

However, menu item prices are mutable. An operator may increase or decrease the price of an item due to inflation, supply chain changes, or promotional events. If an order dynamically references the current menu item price, any historical orders containing that item will instantly appear to have a different total amount than what the customer actually paid at the time of checkout. This would corrupt financial reporting, analytics, customer receipts, and refund calculations.

## Decision
We will defensively snapshot the price of each menu item at the exact moment of order creation.

The `order_items` table will include a `price_at_purchase` integer field (representing the price in the smallest currency unit, e.g., Kobo for NGN).

When an order is created, the backend service will read the current price from the `menu_items` table and copy it into the `order_items.price_at_purchase` field. All subsequent calculations for the order total will strictly use this snapshot value, ignoring any future mutations to `menu_items.price`.

## Consequences

**Positive:**
- **Data Integrity:** Historical financial data integrity is guaranteed.
- **Accurate Receipts:** Customer receipts remain accurate indefinitely.
- **Operational Freedom:** Operators can safely update menu prices at any time without fear of side effects on past orders or analytics.

**Negative:**
- **Data Duplication:** Minor data duplication is introduced (storing the price in both `menu_items` and `order_items`). This is an acceptable and standard trade-off for immutable financial records.
- **Service Complexity:** The order creation service requires slightly more logic to fetch, map, and persist the current prices during the checkout transaction.

## Alternatives Considered
- **Dynamic join to `menu_items.price`:** Rejected because price mutations would instantly corrupt the calculated total of all historical orders containing the modified item.
- **Storing a price version/history table:** Considered, but rejected as over-engineered for this scope; a point-in-time snapshot on the `order_items` record is simpler and perfectly sufficient for financial auditing.
