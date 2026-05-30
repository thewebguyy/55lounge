# ADR 0004: Soft Deletes via `deletedAt` Timestamp over Boolean Flag

**Date**: 2026-05-30
**Status**: Accepted

## Context
When an operator deletes a menu item, we cannot simply execute a hard SQL `DELETE`. A hard delete would violate foreign key constraints for historical `OrderItem` records (an order from last year shouldn't break because we stopped selling a specific cocktail). Therefore, a "soft delete" strategy is required to preserve data integrity while hiding the item from the public catalog.

## Decision
We will implement soft deletes using a nullable `deletedAt` timestamp (`DateTime?`) on the `MenuItem` table, rather than a boolean `isArchived` or `isDeleted` flag. 

## Consequences

**Positive:**
- **Auditability:** A timestamp provides both the signal (null = active, non-null = deleted) and the audit trail (exactly when the operator removed it) in a single field.
- **Data Integrity:** Historical orders retain their relationship to the original menu item, preventing cascading data loss.
- **Authorization Separation:** Public endpoints (`GET /api/v1/menu`) can trivially filter `where: { deletedAt: null }`, while protected operator endpoints (`GET /api/v1/admin/menu`) can return all items, exposing the `deletedAt` field so operators have context on past catalog states.

**Negative:**
- Every public query against the table must explicitly include `where: { deletedAt: null }` to prevent deleted items from leaking into the customer UI. (Prisma does not have global default scopes, so this requires developer discipline).

## Alternatives Considered
- **Hard Delete (`DELETE FROM`):** Rejected because it corrupts historical financial and order records.
- **Boolean Flag (`isArchived: Boolean`):** Rejected because it provides the signal but loses the "when". In an operations platform, knowing *when* a menu item was pulled is critical for auditing disputes or tracking seasonal availability.
