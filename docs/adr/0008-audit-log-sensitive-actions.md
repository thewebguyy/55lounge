# ADR 0008: Audit Log for Sensitive Operator Actions

**Date**: 2026-05-30
**Status**: Accepted

## Context
Operators have access to sensitive business data, including aggregate financial analytics and customer order histories. To maintain data governance and compliance readiness, the system must track who accesses or modifies this sensitive information, and when.

## Decision
We will implement an append-only `AuditLog` table (`id`, `userId`, `action`, `metadata`, `createdAt`). As a foundational step, we will log every time an operator queries the Analytics Dashboard, storing the requested date range in the JSONB `metadata` field. This establishes the pattern for all future sensitive operator actions.

## Consequences
**Positive:** Provides a verifiable trail of data access, deterring internal abuse and satisfying baseline compliance requirements for business data governance. It demonstrates proactive security thinking before a breach or audit occurs.

**Negative:** The `AuditLog` table will grow infinitely over time, consuming database storage. This is an acceptable tradeoff for V1; future milestones can introduce a cron job to archive or rotate logs older than 90 days if storage becomes a constraint.

> **Append-Only Enforcement:** The `AuditLog` table must never have `UPDATE` or `DELETE` operations performed against it by application code. This is enforced by convention in V1 — the `AuditLogRepository` exposes only a `create` method, with no `update` or `delete` methods defined. A future hardening step would enforce this at the database level via a PostgreSQL row-level security policy or trigger that rejects mutations, making the append-only guarantee structural rather than conventional.
