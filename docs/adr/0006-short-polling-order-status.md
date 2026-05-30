# ADR 0006: Short Polling over WebSockets for Real-Time Order Status V1

**Date**: 2026-05-30
**Status**: Accepted

## Context
Operators need to know when new orders arrive, and customers need to track the status of their order in real-time. We must decide on the mechanism for delivering these real-time updates from the Express backend to the Next.js frontend. The options considered were WebSockets (`socket.io`), Server-Sent Events (SSE), and Short Polling (interval-based HTTP requests).

## Decision
We will implement **Short Polling** for V1, utilizing a 15-second `setInterval` loop on both the customer tracking page and the operator dashboard.

## Consequences

**Positive:**
- **Zero Infrastructure Overhead:** Requires no stateful connections, load balancer tweaks (e.g., sticky sessions), or dedicated WebSocket servers. It relies entirely on our existing stateless Express API layer.
- **Simplicity:** Extremely fast to implement and highly reliable. Connection drops are naturally handled by the next polling cycle without complex reconnection logic.
- **Appropriate Scale:** A 15-second interval strikes the balance between perceived responsiveness and database load. For a single restaurant's order volume, querying active orders every 15 seconds is trivial for PostgreSQL.

**Negative:**
- Latency can be up to 15 seconds.
- Inefficient at high scale due to continuous HTTP overhead, even when no state has changed.

**Revisiting Criteria:**
This decision will be revisited, and WebSockets/SSE will be evaluated, when concurrent active orders exceed 100, or operator feedback indicates that a 15-second latency is unacceptable for kitchen operations.

> **Implementation Note:** The polling `setInterval` must be cleared on component unmount to prevent memory leaks and ghost requests from unmounted React components. This is enforced via the `useEffect` cleanup function on both the operator dashboard and customer tracking page.

## Edge Case: Cancelled Orders
As part of the fulfillment lifecycle (`PENDING` → `CONFIRMED` → `PREPARING` → `READY` → `COMPLETED`), operators can cancel orders. 
If an order is cancelled while in `PENDING` state (e.g., fraudulent behavior detected before payment settles), we must ensure that a delayed Paystack Webhook does not accidentally resurrect it. The webhook idempotency handler explicitly guards against overriding a `CANCELLED` status. Furthermore, an order that reaches `COMPLETED` cannot be rolled back to `CANCELLED`.
