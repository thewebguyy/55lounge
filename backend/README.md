# Servia Backend API Engine

An Express.js and TypeScript API engine hardened for high concurrency, strict security, and zero-downtime deployments.

---

## Technical Architecture Deep Dive

### 1. Concurrency Control: Serializable Transactions
To prevent reservation slot overallocation during peak bookings, Servia rejects optimistic or pessimistic locking in favor of **Serializable Transaction Isolation** (the highest SQL isolation level).
- **The Problem**: Simultaneous write requests checking capacity (e.g., `SUM(partySize)`) can read the same state before inserting new rows, causing double-allocation.
- **The Solution**: Wrap capacity checking and slot reservation inserts inside a transaction block using Prisma's implicit database serializability checks.
- **Retry Handling**: If PostgreSQL detects a serialization conflict (ErrorCode `P2034`), the API intercepts it and translates it to a `409 Concurrency Conflict` status code, inviting clients to retry dynamically.

### 2. Idempotent Payment Webhooks
Webhook delivery is inherently unreliable and can fire multiple times. Servia's Paystack webhook handler guarantees that order state changes occur exactly once:
- **Signature Verification**: Validates Paystack payloads using HMAC-SHA512 with the secret key.
- **Database Mutex**: Checks if the order is already in a non-pending state inside an atomic transaction. If a webhook attempts to process an already confirmed or completed order, the request returns a `200 OK` immediately without re-processing, preventing duplicate delivery.

### 3. JWT Dual-Token Authentication
Servia implements a self-contained auth system that protects sessions against token theft:
- **Access Tokens**: Short-lived (15 minutes) passed in the `Authorization` header.
- **Refresh Tokens**: Long-lived (7 days) stored in a secure, `HttpOnly`, `SameSite=Strict`, `Secure` cookie.
- **Token Theft Detection**: Refresh tokens are stored as bcrypt hashes in the database. During a refresh request, the token is compared. If a refresh token is reused or doesn't match, Servia triggers a security lockout by clearing the user's active session entirely to prevent unauthorized reuse.

### 4. Unified Graceful Shutdown & Process Safety
The server listens for termination signals (`SIGINT`, `SIGTERM`) and process crashes (`uncaughtException`, `unhandledRejection`) to execute a unified teardown process:
1. **Server Close**: Rejects new incoming HTTP requests.
2. **Prisma Disconnection**: Disconnects from PostgreSQL to clean up pooled connections.
3. **Sentry Flush**: Flushes the local telemetry buffer to Sentry.
4. **Safety Timeout**: Registers a `10-second` timeout using `.unref()`. If clean teardown stalls (e.g., database hanging), the process force-exits to avoid leaving resource-leaking zombie processes.

---

## Quality Gates & Coverage

We enforce strict quality control using Jest:
- **Business Logic Enforced**: In [jest.config.js](jest.config.js), the service layer (`src/services`) is gated at a **70% minimum coverage** requirement.
- **CI Test Database**: The GitHub Actions runner mounts a live PostgreSQL 15 service container. All integration and concurrency tests are executed against a real database rather than unreliable mocks.
