# ADR 0009: Unified Graceful Shutdown and Process Safety Nets

**Date**: 2026-05-30
**Status**: Accepted

## Context
Node.js processes can terminate unexpectedly due to `uncaughtException`, `unhandledRejection`, or intentional system signals like `SIGTERM` and `SIGINT`. Historically, unhandled exceptions might be ignored (leaving the process in a zombie state) or force-killed immediately (dropping in-flight HTTP requests and corrupting database transactions).

## Decision
We will implement a unified `shutdown(reason: string)` function in `server.ts` that orchestrates a safe teardown sequence across all termination vectors. This function will be triggered by:
- `SIGTERM` / `SIGINT` (Load balancer or container orchestration shutdown)
- `uncaughtException` (Synchronous failures)
- `unhandledRejection` (Asynchronous failures)

The sequence will strictly follow:
1. Close the Express HTTP server to stop accepting new requests.
2. Disconnect the Prisma database client gracefully.
3. Flush the Sentry queue to ensure fatal errors are reported.
4. Exit the process (`process.exit(1)` for exceptions, `process.exit(0)` for signals).

### Shutdown Timeout
The `shutdown()` function must implement a maximum timeout (e.g., 10 seconds). If the graceful sequence does not complete within that window — for example, if Prisma hangs on disconnect or Sentry flush stalls — the process must force-exit via `setTimeout(() => process.exit(1), 10000).unref()`. Without this timeout, a hung shutdown leaves a zombie process that Railway or Kubernetes will eventually SIGKILL anyway, but only after the full platform-level grace period expires. The `.unref()` call ensures the timeout timer itself does not prevent the process from exiting if everything completes cleanly before it fires.

## Consequences
**Positive:** Guarantees that in-flight requests and database transactions complete safely before the process dies. Consolidating the logic into a single `shutdown()` function ensures identical safety guarantees regardless of why the process is stopping, demonstrating robust production readiness.
**Negative:** Requires careful coordination with Kubernetes/Railway liveness probes to ensure the termination grace period aligns with our internal shutdown timer.
