# ADR 0005: Paystack Server-to-Server Payment Initialization

**Date**: 2026-05-30
**Status**: Accepted

## Context
We need to integrate Paystack for payment processing on the 55Lounge platform. There are multiple ways to initialize a Paystack transaction, including client-side popup SDKs (Paystack Inline) and Server-to-Server intent creation. We must select the architecture that maximizes security, data integrity, and reliability.

## Decision
We will use a Server-to-Server payment initialization flow, avoiding client-side payment creation. 
The flow is:
1. Frontend requests an Order Intent from our backend.
2. Backend creates an `Order` (`PENDING`) and calls Paystack via server-side API to initialize the transaction.
3. Backend returns the `authorization_url` to the Frontend.
4. Frontend redirects the user to Paystack to complete the payment.
5. A Paystack Webhook (hitting a raw body parsed endpoint) acts as the sole source of truth to mark the `Order` as `CONFIRMED`.

## Consequences

**Positive:**
- **Zero Client Trust:** The frontend cannot spoof the `totalAmount` because the backend recalculates the cart total based on the database `MenuItem.price` before requesting the intent from Paystack.
- **Secret Protection:** The Paystack Secret Key never touches the frontend or the browser.
- **Reliability (Source of Truth):** Webhooks guarantee that network drops during the customer's redirect back to our site won't result in unfulfilled "paid" orders. 
- **Idempotency:** The webhook handler will check if the order is already `CONFIRMED` before processing, gracefully handling Paystack's retry mechanisms.

**Negative:**
- Requires more infrastructure than the simple Paystack Inline popup (requires a public webhook URL and raw body signature verification middleware).

> **Webhook Failure Recovery:** If our backend is temporarily unavailable when Paystack fires the webhook, Paystack will retry on an exponential backoff schedule. Because the handler is idempotent, retries are safe. However, operators should monitor for orders stuck in `PENDING` status beyond 30 minutes as a signal that webhook delivery may have failed — this will be addressed in the Milestone 8 observability work.

## Alternatives Considered
- **Client-Side Initialization (Paystack Inline):** Rejected because it places too much trust in the client, making it possible for a malicious actor to alter the transaction amount before initialization.
- **Redirect URL as Source of Truth:** Rejected. Relying on the user returning to `/orders/success` to verify the transaction is fragile; users often close the tab immediately after the payment succeeds on the gateway.
