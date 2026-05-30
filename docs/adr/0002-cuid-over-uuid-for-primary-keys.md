# ADR 0002: Use CUIDs over UUIDs for Primary Keys

**Date**: 2026-05-30
**Status**: Accepted

## Context
Primary keys are required for all database entities. For a consumer-facing platform like Servia, IDs are often exposed in URLs (e.g., `/orders/[id]`, `/reservations/[id]`). We needed to decide on an ID generation strategy that balances database performance, security against enumeration, and aesthetics/usability in public URLs.

## Decision
We will use CUIDs (Collision Resistant Unique Identifiers) for all primary keys in the database via Prisma's `cuid()` default function.

## Consequences

**Positive:**
- **URL Safety:** CUIDs are naturally URL-safe and shorter/cleaner looking than UUIDs, improving the aesthetic of customer-facing links (e.g., an order tracking link).
- **Sortability:** CUIDs are monotonically increasing (time-based), leading to better database index insertion performance and natural chronological sorting compared to random UUIDs (v4).
- **Security:** Like UUIDs, CUIDs are non-sequential, preventing ID enumeration attacks (e.g., guessing order IDs).

**Negative:**
- Slightly longer generation time than auto-increment integers, though practically negligible for this scale.

## Alternatives Considered
- **Auto-increment Integers:** Rejected due to extreme vulnerability to ID enumeration (Insecure Direct Object Reference). A competitor could easily deduce our daily order volume.
- **UUIDv4:** Considered, but rejected because they are completely random (causing index fragmentation on inserts) and visually cluttered in URLs due to hyphens and length.
