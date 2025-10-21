# Project Profit & Loss Tracker – Project Requirements Document (PRD)

## 1. Project Overview

The **Project Profit & Loss Tracker** is a full-stack web application that helps freelancers, small businesses, and project managers track the financial health of individual projects from start to finish. It centralizes budgeting, expense logging, invoice management, and real-time profit & loss calculations in one place. By replacing error-prone spreadsheets and scattered receipts with a modern, user-friendly dashboard, it provides accurate insights into each project’s bottom line and cash flow trends.

This tool is being built to empower users with transparent, up-to-date financial data so they can make smarter decisions about resource allocation, pricing, and cost control. Key objectives for version 1.0 include: secure user authentication, project creation with assigned budgets, expense and invoice tracking, a dynamic dashboard that calculates net profit/loss, and basic charts for cash flow visualization. Success will be measured by the application’s ease of use, accuracy of financial calculations, and responsiveness under typical usage.

## 2. In-Scope vs. Out-of-Scope

### In-Scope (Version 1.0)
- **User Authentication**: Secure sign-up, sign-in, and session management (better-auth).
- **Project Management**: Create, view, update, and delete projects (name, client, initial budget).
- **Expense Tracking**: Log expenses (amount, category, date, description) tied to a project.
- **Invoice Management**: Create and manage invoices (amount, due date, status: Draft/Sent/Paid).
- **Dashboard & Reporting**: Display per-project profit/loss summaries and cash flow charts.
- **Data Visualizations**: Basic line chart for cash flow over time and bar/pie charts for expense breakdown.
- **Theming**: Light and dark modes via `next-themes`.
- **API Layer**: Next.js API routes for all CRUD operations, with input validation (Zod) and standardized JSON responses.
- **Database**: PostgreSQL schema defined in Drizzle ORM for projects, expenses, and invoices.
- **Containerization & Deployment**: Docker setup for local dev; deployment on Vercel.

### Out-of-Scope (Later Phases)
- Role-based access control (e.g., admin vs. project manager).
- Export to CSV/PDF or integrations with external accounting software.
- Multi-currency support and exchange-rate conversions.
- Notification or reminder system for invoice due dates.
- Mobile-optimized native apps or offline support.
- Double-entry accounting features and tax calculations.

## 3. User Flow

A new user lands on the public homepage and clicks “Sign Up.” They register with an email and password, then are redirected to the main dashboard. The dashboard lists all existing projects (empty at first) with a “Create Project” button. Clicking this opens a form modal where they enter project name, client, and initial budget. Upon submission, the project appears in the dashboard as a card showing budget and a placeholder for profit/loss.

From the dashboard, the user selects a project to view its detail page. Here they see summary cards (Total Revenue, Total Expenses, Net Profit) and a cash flow chart. An “Add Expense” button opens a modal form to log amount, date, category, and description. Similarly, “Add Invoice” opens a form for invoice details and status. Submitting either form posts to the appropriate API route, updates the database, and instantly recalculates and re-renders the dashboard metrics and charts.

## 4. Core Features

- **Authentication Module**: 
  - Sign up, sign in/out, session handling with secure cookies.
- **Project CRUD**: 
  - Create, read, update, delete projects with budget fields.
- **Expense Tracking**: 
  - Form modal for logging expense details linked to a project.
- **Invoice Management**: 
  - Form modal for creating and updating invoice status.
- **Dashboard & P/L Calculation**: 
  - Aggregates expenses and paid invoices to compute net profit/loss.
- **Data Visualization**: 
  - Line chart (cash flow over time), pie/bar charts (expense categories).
- **API Layer**: 
  - Next.js API routes (`/api/projects`, `/api/projects/[id]/expenses`, `/api/invoices`).
  - Input validation with Zod; unified success/error JSON schema.
- **Database Schema**: 
  - Drizzle ORM models for `projects`, `expenses`, and `invoices` with relations.
- **UI & Theming**: 
  - Shadcn / Tailwind CSS components, dark/light mode toggle.

## 5. Tech Stack & Tools

- **Frontend**: Next.js (App Router), React, TypeScript, Shadcn/ui, Tailwind CSS, `next-themes`.
- **Backend**: Next.js API Routes (Node.js, TypeScript).
- **Authentication**: better-auth.
- **Database**: PostgreSQL, Drizzle ORM for type-safe schemas and queries.
- **Validation**: Zod for request and form schema enforcement.
- **Charts**: Recharts (or similar React charting library).
- **Testing**: Jest, React Testing Library (unit); Playwright or Cypress (end-to-end).
- **Dev Env**: Docker (Node, Postgres); VS Code with Cursor/Windsurf plugins (optional).
- **Deployment**: Vercel for hosting front and back ends.

## 6. Non-Functional Requirements

- **Performance**: <2 sec initial page load on 3G; API responses <200 ms under normal load.
- **Security**: 
  - Enforce HTTPS only, secure cookies, salted + hashed passwords.
  - OWASP Top 10 compliance, input sanitization with Zod.
- **Scalability**: 
  - Stateless API routes, database indexing on foreign keys.
- **Usability**: 
  - WCAG AA accessible, responsive design for desktop/tablet.
- **Reliability**: 
  - 99.9% uptime guaranteed by Vercel/Postgres provider.

## 7. Constraints & Assumptions

- **Hosting**: Must run on Vercel; Node 18+ runtime.
- **Database Access**: PostgreSQL cluster available and reachable from Vercel or Docker.
- **Library Availability**: Recharts and Zod licenses are compatible with MIT.
- **User Environment**: Modern evergreen browsers (Chrome, Firefox, Safari, Edge).
- **Data Volume**: Initial MVP expects <5,000 records; no heavy scaling needed yet.

## 8. Known Issues & Potential Pitfalls

- **SSR vs. CSR for Charts**: Recharts may require dynamic import to prevent server-side rendering errors. Use `next/dynamic`.
- **ORM Migrations**: Drizzle’s migration tooling is still evolving. Plan for manual schema sync or alternative migration scripts.
- **Modal Hydration**: Shadcn/ui modals can cause hydration mismatches if server/client markup differs. Ensure Client Components wrap all interactive parts.
- **API Rate Limits**: Vercel’s free tier has rate limits. Consider caching or API throttling for heavy workflows.
- **Time Zone Handling**: Date fields for expenses/invoices must account for user time zones. Use UTC storage with local display.

---

This PRD provides a crystal-clear roadmap for building the Project Profit & Loss Tracker MVP. Every feature, flow, and technical decision is laid out so that subsequent documents—such as the Tech Stack specification, frontend guidelines, and backend structure—can be generated without ambiguity.