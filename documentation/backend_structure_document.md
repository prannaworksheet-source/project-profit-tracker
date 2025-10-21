# Backend Structure Document

This document outlines the backend setup for the Project Profit & Loss Tracker. It explains how the server side is organized, how data is stored and accessed, and how everything is hosted and secured. No prior technical knowledge is assumed.

## 1. Backend Architecture

Overall, the backend is built using Next.js API Routes and a type-safe ORM, organized for clarity and future growth.

• Framework and Design Patterns:
  - Next.js API Routes act as the backend server: each route handles a specific business task (for example, creating a project or logging an expense).
  - Drizzle ORM provides a database-first approach: schemas defined in code keep the database structure in sync with the application logic.
  - Separation of concerns: API route handlers focus on request validation and response formatting, while core calculations (like profit/loss) live in their own utility files.

• Support for Scalability, Maintainability, and Performance:
  - Serverless functions (on Vercel) automatically scale based on traffic, so you only pay for what you use.
  - Clear folder structure (`/app/api/`, `/lib/`, `/db/`, `/components/`) makes it easy for new developers to find and update code.
  - TypeScript throughout the stack catches errors at build time, reducing runtime crashes and simplifying maintenance.

## 2. Database Management

The application uses a relational (SQL) database to store structured financial data.

• Database Technology:
  - PostgreSQL database (hosted by a cloud provider).
  - Drizzle ORM for connecting the application code to the database in a type-safe way.

• Data Structure and Access:
  - Data is organized into tables (projects, expenses, invoices). Each table has clearly defined fields and relationships.
  - CRUD operations (Create, Read, Update, Delete) are handled with simple Drizzle queries inside API routes.
  - Input validation with Zod (a schema validation library) ensures only correct data reaches the database.

## 3. Database Schema

Below is a human-friendly overview of the database tables and their key fields, followed by the SQL statements you would run to create them.

Tables and Fields (in everyday language):

• projects
  - A unique identifier
  - Project name (text)
  - Client name (text)
  - Initial budget (decimal)
  - Timestamps for when each record is created and updated

• expenses
  - A unique identifier
  - Link to the project it belongs to
  - Expense amount (decimal)
  - Category (text)
  - Date of the expense
  - Description (text)
  - Timestamps

• invoices
  - A unique identifier
  - Link to the project it belongs to
  - Invoice amount (decimal)
  - Status (Draft, Sent, Paid)
  - Due date
  - Timestamps

SQL Schema (PostgreSQL):

```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  client TEXT,
  initial_budget NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  category TEXT,
  expense_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT CHECK(status IN ('Draft','Sent','Paid')) NOT NULL,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 4. API Design and Endpoints

The backend exposes a set of RESTful endpoints under `/api/`. Each one handles a specific piece of business logic:

• Projects Endpoints:
  - GET `/api/projects`: List all projects.
  - POST `/api/projects`: Create a new project (requires name, client, initial budget).
  - GET `/api/projects/[id]`: Get details for one project.
  - PUT `/api/projects/[id]`: Update project information.
  - DELETE `/api/projects/[id]`: Remove a project (and its related data).

• Expenses Endpoints:
  - GET `/api/projects/[id]/expenses`: List all expenses for a project.
  - POST `/api/projects/[id]/expenses`: Add a new expense (amount, category, date, description).
  - PUT `/api/expenses/[expenseId]`: Update an existing expense.
  - DELETE `/api/expenses/[expenseId]`: Delete an expense.

• Invoices Endpoints:
  - GET `/api/projects/[id]/invoices`: List all invoices for a project.
  - POST `/api/projects/[id]/invoices`: Create a new invoice (amount, status, due date).
  - PUT `/api/invoices/[invoiceId]`: Update invoice details.
  - DELETE `/api/invoices/[invoiceId]`: Delete an invoice.

Each endpoint:
  - Validates input via Zod schemas.
  - Uses Drizzle ORM to interact with the database.
  - Returns a clear JSON response indicating success or error.

## 5. Hosting Solutions

The application backend is hosted in the cloud for ease of deployment and scaling.

• Cloud Provider and Platform:
  - Vercel for serverless functions (API routes) and static assets.
  - PostgreSQL database hosted on a managed cloud database service (e.g., PlanetScale, AWS RDS, or Supabase).

• Benefits:
  - Reliability: Uptime SLAs ensure the app is available.
  - Scalability: Serverless functions automatically scale with demand.
  - Cost-effectiveness: Pay-as-you-go model avoids idle server costs.
  - Developer experience: Simple deployments with a Git push.

## 6. Infrastructure Components

Key building blocks that support performance and user experience:

• Load Balancing:
  - Handled automatically by the cloud platform, distributing requests across serverless instances.

• Caching:
  - Edge caching of static assets and responses where appropriate (set via HTTP headers).
  - Option to add a Redis instance for caching frequent database queries and session data.

• Content Delivery Network (CDN):
  - Vercel’s built-in CDN delivers static files and API responses from servers closest to the user, reducing latency.

• Containerization:
  - Docker for local development ensures everyone works in the same environment.

## 7. Security Measures

Multiple layers protect data and user accounts:

• Authentication & Authorization:
  - `better-auth` library handles user sign-up, sign-in, and session management.
  - Role checks can be added to API routes to limit access (for example, only project owners can edit).  

• Data Encryption:
  - TLS (HTTPS) encrypts data in transit between users and the server.
  - The managed database service typically encrypts data at rest.

• Input Validation & Sanitization:
  - Zod schemas validate and sanitize all incoming data to prevent SQL injection and malformed requests.

• Secure Configuration:
  - Environment variables for secrets (database credentials, API keys) are never checked into source control.
  - CORS policies restrict API access to approved origins.

## 8. Monitoring and Maintenance

Keeping the backend healthy and up-to-date involves several practices:

• Performance Monitoring & Logging:
  - Vercel’s built-in analytics give response times and error rates.
  - Error tracking with a service like Sentry captures exceptions in real time.

• Database Health:
  - Regular automated backups of the PostgreSQL database.
  - Use Drizzle migrations to apply schema changes safely.

• Continuous Integration / Deployment (CI/CD):
  - Every code change goes through automated tests (unit tests, integration tests).
  - Successful tests trigger a deployment to a staging environment for final review.

• Routine Updates:
  - Keep dependencies (Next.js, Drizzle ORM, etc.) up to date to receive security fixes and performance improvements.

## 9. Conclusion and Overall Backend Summary

The backend for the Project Profit & Loss Tracker is built for clarity, security, and growth:

• Next.js API Routes and Drizzle ORM provide a type-safe, maintainable structure.
• PostgreSQL stores your projects, expenses, and invoices in a relational model with clear relationships.
• RESTful endpoints, protected by validation and authentication, make data access predictable.
• Hosting on Vercel and a managed database ensures reliability, automatic scaling, and cost savings.
• Infrastructure components (caching, CDN, load balancing) work together to deliver a fast user experience.
• Security measures and monitoring practices keep both data and users safe.

This setup supports the project’s goals of accurate financial tracking, real-time profit/loss calculation, and smooth user interactions—all while laying a strong foundation for future enhancements.