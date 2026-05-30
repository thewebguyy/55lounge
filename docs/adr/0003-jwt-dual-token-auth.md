# ADR 0003: JWT Dual-Token Authentication with HTTP-only Refresh Cookie

**Date**: 2026-05-30
**Status**: Accepted
**Related**: ADR-0002

## Context
To secure the 55Lounge Operations Platform, we need a mechanism to authenticate users and authorize API access (RBAC for operators/admins). The platform consists of a Next.js frontend and a separate Express backend. We needed to choose an authentication architecture that balances scalability, security against XSS/CSRF, and explicit control over the session lifecycle without relying on third-party dependencies (like Auth0).

## Decision
We will implement a custom JWT-based dual-token architecture:
1. **Access Token**: Short-lived (e.g., 15 minutes) JWT sent via the `Authorization: Bearer <token>` header.
2. **Refresh Token**: Long-lived (e.g., 7 days) opaque or JWT string used to obtain a new Access Token when it expires.

**Storage Mechanics:**
- The Access Token is stored in memory on the client.
- The Refresh Token is stored in a `Secure`, `HttpOnly`, `SameSite=Strict` cookie with `Path=/api/v1/auth/refresh`.
- The Refresh Token is hashed via `bcrypt` before being stored in the database.

## Consequences

**Positive:**
- **Stateless API:** The backend can verify access tokens without a database lookup, allowing the API to scale horizontally.
- **XSS Protection:** By storing the refresh token in an HTTP-only cookie, malicious JavaScript cannot read it, securing long-lived access.
- **Data Leak Protection:** Storing only a bcrypt hash of the refresh token ensures that if the database is compromised, attackers cannot immediately impersonate active sessions.
- **Portfolio Value:** Building issuance, rotation, and cryptographic hashing from scratch demonstrates a concrete understanding of application security.

**Negative:**
- Increased complexity compared to a monolithic server-side session.
- Token revocation requires maintaining a blocklist or rotating the refresh token and waiting for the short-lived access token to expire.

> **Revocation Strategy (current):** On logout, the refresh token hash is deleted from the `User` record, immediately invalidating that session. Access tokens are not actively revoked — they expire naturally within their 15-minute window. This is an accepted tradeoff documented here so future engineers understand why a compromised access token has a maximum 15-minute blast radius.

## Alternatives Considered
- **Server-Side Sessions (Redis/Cookie):** Considered, but rejected to maintain pure statelessness in the Express API and align with standard SPA/API patterns.
- **Third-Party Auth (Auth0/Firebase):** Rejected because delegating this layer hides the developer's understanding of security fundamentals (hashing, JWT mechanics, cookie attributes).
- **Single Long-Lived Token:** Rejected due to extreme security risk. If a long-lived token is stolen (e.g., from local storage), the attacker maintains indefinite access.
- **JSON Payload for Refresh Token:** Rejected because storing long-lived tokens in LocalStorage or JavaScript memory leaves them highly vulnerable to XSS attacks.
