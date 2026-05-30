# ADR 0007: Serializable Transaction Isolation for Reservation Concurrency

**Date**: 2026-05-30
**Status**: Accepted

## Context
The reservation system introduces a critical concurrency challenge: overbooking. If multiple customers attempt to book the last available seats for the same time slot at the exact same millisecond, the backend must correctly reject the overlapping requests. We must also define how time slots are modeled to calculate capacity efficiently.

## Decision
1. **Fixed Slot Model:** Reservations are constrained to fixed hourly buckets (e.g., 18:00, 19:00, 20:00). Capacity is checked strictly against the exact slot, simplifying the availability model compared to continuous-time overlapping windows.
2. **Concurrency Control:** We will use PostgreSQL Serializable Transactions (`$transaction({ isolationLevel: 'Serializable' })`) to prevent overbooking, rather than application-side locks or optimistic versioning.

## Consequences

**Positive:**
- **Data Integrity:** The database's native MVCC engine guarantees that concurrent transactions execute as if they were serial. If a concurrent transaction mutates the capacity sum we read, our transaction aborts, perfectly preventing overbooking without complex manual locking logic.
- **Simplicity:** The fixed slot model drastically reduces the complexity of SQL queries required to sum existing party sizes.

**Negative:**
- **Transaction Abort Rate:** Serializable isolation leads to a higher rate of transaction aborts under extreme contention. 
- **Error Handling:** When a serialization failure occurs, Prisma throws error code `P2034`. The service layer must explicitly catch this exact error code and convert it into a `409 Conflict` (`AppError('Fully booked', 409)`). If unhandled, it surfaces as a `500 Internal Server Error`, creating a poor UX.

> **P2034 Retry Consideration:** Under extreme contention, serialization failures may occur even when capacity is available — the transaction aborts not because the slot is full, but because a concurrent write was detected. The current implementation returns `409` for both cases (full capacity and serialization conflict), which is acceptable for V1. A future improvement would distinguish between the two: `409 Fully Booked` versus `503 Service Temporarily Unavailable, please retry` for pure serialization conflicts. This distinction is documented here for future engineers.

## Alternatives Considered
- **Optimistic Locking (`@updatedAt` / Versioning):** Rejected. While fast, it pushes the complexity of retry logic into the application layer, and is difficult to model for capacity SUMs rather than single-row updates.
- **Pessimistic Locking (`SELECT ... FOR UPDATE`):** Rejected. It requires explicit `Table` or `TimeSlot` inventory rows in the database to lock against. By using Serializable transactions, we can lock based on the aggregate `SUM` of the reservations without needing pre-seeded inventory rows.
