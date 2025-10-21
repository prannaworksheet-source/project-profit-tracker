# Security Guidelines for Project Profit & Loss Tracker

This document provides security requirements and best practices tailored to the **Project Profit & Loss Tracker**—a full-stack Next.js application with PostgreSQL, Drizzle ORM, Shadcn/ui, and `better-auth`. These guidelines align with industry-standard security principles and cover authentication, data protection, input validation, API hardening, infrastructure, and deployment.

---
## 1. Core Security Principles

1. **Security by Design**: Embed security from day one—design your models, APIs, and UI with threats in mind.
2. **Least Privilege**: Grant minimal permissions to users, services, and database roles.
3. **Defense in Depth**: Layer controls (firewalls, WAF, input validation, output encoding) to avoid single points of failure.
4. **Input Validation & Output Encoding**: Treat all inputs as untrusted; validate on server with Zod and escape or encode outputs in HTML/JSON responses.
5. **Fail Securely**: Handle errors gracefully; never leak stack traces or sensitive data to clients or logs.
6. **Secure Defaults**: Use safe default configurations (e.g., `HttpOnly`/`Secure` cookies, strict CSP, disabled debug in production).
7. **Keep Security Simple**: Favor clear, maintainable patterns over complex home-grown solutions.

---
## 2. Authentication & Access Control

### 2.1 User Authentication
- Use `better-auth` or a comparable library configured to:
  - Enforce strong password policy: minimum length (12+), complexity (uppercase, numeric, special), expiration as needed.
  - Hash passwords with Argon2 or bcrypt + unique salt per user.
  - Protect endpoints against brute-force (rate limit login attempts).

### 2.2 Session Management
- Use secure, signed cookies with:
  - `HttpOnly` and `Secure` flags
  - `SameSite=Strict` or `Lax` to mitigate CSRF on mutating requests
- Enforce both idle timeout (e.g., 15–30 minutes) and absolute timeout (e.g., 24 hours).
- Invalidate session server-side on logout or password change.
- Prevent session fixation: always issue new session ID after authentication.

### 2.3 Role-Based Access Control (RBAC)
- Define roles (e.g., Admin, Project Manager, Viewer).
- Protect every API route and page server-side by checking the user’s role before any business logic executes.
- Never trust client-submitted roles or IDs—derive from session or JWT claims.

### 2.4 Multi-Factor Authentication (MFA)
- For sensitive actions (e.g., exporting financial reports), encourage or require MFA (TOTP or SMS/email OTP).

---
## 3. Input Handling & Processing

### 3.1 Server-Side Validation
- Use Zod schemas in both API routes and client forms to validate:
  - Project fields: `name` (nonempty string), `budget` (positive number)
  - Expense fields: `amount` (positive numeric), `date` (ISO date), `description` (max length)
  - Invoice fields: `amount`, `dueDate`, `status` (enum)
- Reject any requests that fail schema validation before database interaction.

### 3.2 Preventing Injection Attacks
- Use Drizzle ORM’s parameterized queries exclusively—never interpolate user input into raw SQL.
- For PostgreSQL stored procedures or custom SQL, use prepared statements.

### 3.3 XSS & Output Encoding
- Encode dynamic content in React components by default. Avoid `dangerouslySetInnerHTML` unless sanitized.
- Implement a strict Content Security Policy (CSP) via `next.config.js` and HTTP headers:
  - `default-src 'self'`
  - `script-src 'self' 'sha256-…'`
  - `style-src 'self' 'unsafe-inline'` (if Tailwind inline styles needed)

### 3.4 CSRF Protection
- Use `csrf` tokens for all state-changing API routes.
- For Next.js API Routes, integrate `next-csrf` or equivalent middleware.

### 3.5 File Uploads (if applicable)
- Validate file type, size, and content client- and server-side.
- Store uploads outside the webroot and serve via signed URLs if needed.
- Sanitize filenames to prevent path traversal.

---
## 4. Data Protection & Privacy

### 4.1 Encryption in Transit & at Rest
- Enforce HTTPS/TLS 1.2+ on every endpoint (frontend, API, DB connections).
- Enable TLS between Next.js server and PostgreSQL.
- For highly sensitive fields (e.g., PII), consider AES-256 field-level encryption.

### 4.2 Secrets Management
- Do **not** commit secrets to source control. Load sensitive config (DB credentials, JWT signing keys) from environment variables or a vault (e.g., AWS Secrets Manager).
- Rotate keys and credentials periodically.

### 4.3 Logging & Error Handling
- Log security-relevant events (login success/failure, role changes, data exports) to a secure audit log.
- Mask PII in logs.
- For errors in production, return generic messages ("Unexpected error occurred") and capture details internally.

---
## 5. API & Service Security

### 5.1 Rate Limiting & Throttling
- Apply IP-based rate limiting (e.g., `express-rate-limit` or Vercel Edge config) on login, project creation, expense/invoice endpoints.

### 5.2 CORS Configuration
- Allow only trusted origins (your application domain) for API calls.
- Enable only needed methods (e.g., GET, POST, PUT, DELETE).

### 5.3 API Versioning & Data Exposure
- Prefix routes with `/api/v1/`.
- Return only necessary fields in JSON responses—avoid sending full user/password hashes.

### 5.4 HTTP Methods & Status Codes
- Use proper verbs (POST for creation, PUT/PATCH for updates, DELETE for removal).
- Return standard HTTP status codes (200, 201, 400, 401, 403, 404, 429, 500).

---
## 6. Web Application Security Hygiene

- Set secure HTTP headers via Next.js `headers()`:
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: no-referrer-when-downgrade`
- Secure cookies (see Session Management).
- Avoid storing tokens or PII in `localStorage` or `sessionStorage`.
- Use Subresource Integrity (SRI) for any CDN-loaded scripts.

---
## 7. Infrastructure & Deployment

### 7.1 Docker Hardening
- Use minimal base images (Alpine or `node:slim`).
- Run containers as non‐root users.
- Audit final image for vulnerabilities with tools like `Trivy`.

### 7.2 CI/CD & Secrets
- Integrate static analysis and dependency scanning (e.g., Snyk, GitHub Dependabot).
- Store environment variables in CI/CD secrets store—never echo them in logs.
- Disable debug flags in production builds.

### 7.3 Hosting & Configuration
- On Vercel, enforce HTTPS redirects and set secure headers.
- Limit open ports to 80/443.
- Keep dependencies up to date; review security advisories for Next.js, React, Drizzle, Tailwind.

---
## 8. Dependency Management

- Maintain `package-lock.json` for deterministic installs.
- Remove unused dependencies to shrink attack surface.
- Regularly run SCA tools to detect vulnerable packages.

---
## 9. Testing & Monitoring

- Write unit tests for business logic (profit/loss calculations) in `lib/calculations.ts`.
- Create integration tests for API endpoints validating authentication, authorization, and input schemas.
- Implement end-to-end tests (Cypress/Playwright) simulating user flows: login, create project, add expense.
- Monitor logs and set up alerts for abnormal behaviors (e.g., repeated 401s, high error rates).

---
## Conclusion
By following these guidelines, the Project Profit & Loss Tracker will be built with security woven into every layer—from the database schema and API routes to the UI and deployment pipeline. Regularly review and iterate on these practices to adapt to emerging threats and maintain a robust security posture.