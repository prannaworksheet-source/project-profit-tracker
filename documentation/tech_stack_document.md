# Tech Stack Document for Project Profit & Loss Tracker

This document explains, in everyday terms, the key technologies chosen to build the Project Profit & Loss Tracker. Each section outlines why we picked certain tools and how they fit together to deliver a reliable, user-friendly application.

## Frontend Technologies

We use a modern front-end setup to ensure a smooth, responsive user experience:

- **Next.js (App Router)**
  - Handles both server-rendered pages (fast loading, good for SEO) and client-side interactivity (dynamic forms and data tables).
- **TypeScript**  
  - Brings type safety to our code, helping catch errors early—especially important when dealing with financial numbers.
- **Shadcn/ui Components**  
  - Provides ready-made UI blocks like cards, tables, dialogs, and forms. This speeds up development and keeps the interface consistent.
- **Tailwind CSS**  
  - A utility-first styling framework that lets us build and adjust layouts quickly without leaving our HTML/JSX.
- **next-themes**  
  - Adds light and dark mode support, so users can pick their preferred theme.
- **Recharts (or similar chart library)**  
  - Renders interactive charts and graphs for cash flow and profit/loss visualizations.

## Backend Technologies

On the server side, we focus on reliability and clear data handling:

- **Next.js API Routes**  
  - Hosts all our backend logic, such as creating projects, logging expenses, and updating invoices. Requests go to endpoints like `/api/projects` or `/api/projects/[id]/expenses`.
- **better-auth**  
  - Manages user sign-up, sign-in, and secure sessions, ensuring only authorized access to sensitive financial data.
- **PostgreSQL**  
  - A robust relational database for storing structured data: projects, budgets, expenses, and invoices.
- **Drizzle ORM**  
  - A type-safe layer that maps our database tables to code objects, making queries and schema updates safer and more straightforward.
- **Zod**  
  - Validates incoming data (forms and API requests) against defined schemas, preventing invalid entries (like non-numeric amounts) from reaching the database.

## Infrastructure and Deployment

We choose tools that keep development smooth and production deployment reliable:

- **Docker**  
  - Containerizes the entire application, ensuring every developer works in the same environment and reducing "it works on my machine" issues.
- **Vercel**  
  - Hosts the application with built-in continuous deployment. Every time code is pushed to the main branch, Vercel automatically builds and publishes the latest version.
- **Git & GitHub**  
  - Houses the source code with version control, enabling collaborative development, code reviews, and rollbacks if needed.
- **CI/CD Pipelines**  
  - Automatically run tests (unit, integration, end-to-end) on every pull request to catch issues before merging.

## Third-Party Integrations

We rely on a few well-established libraries to extend functionality:

- **Recharts**  
  - For creating interactive bar charts, line graphs, and pie charts to visualize financial trends.
- **Playwright or Cypress**  
  - For end-to-end testing, simulating user flows like creating a project or adding an expense.

*(Currently, there are no external payment processors or analytics services integrated. These can be added in the future as needed.)*

## Security and Performance Considerations

To protect data and keep the app snappy:

- **Authentication & Authorization**  
  - `better-auth` ensures secure login flows and session management.
- **Data Validation**  
  - `Zod` schemas validate all inputs at the API boundary, blocking invalid or malicious data.
- **Server vs. Client Components**  
  - We use Server Components for static or read-only pages (fast and minimal client bundle) and Client Components for interactive features (forms, modals, tables).
- **Caching & Incremental Rendering**  
  - Next.js features like ISR (Incremental Static Regeneration) and built-in caching help deliver frequently accessed data quickly.
- **Code Splitting & Tree Shaking**  
  - Next.js automatically splits code per page and removes unused JavaScript, keeping downloads small.
- **Secure Deployment**  
  - Vercel provides HTTPS by default, and environment variables are kept secret during builds.

## Conclusion and Overall Tech Stack Summary

We’ve chosen a cohesive set of technologies that work together to meet the goals of the Project Profit & Loss Tracker:

- **User Experience & Interface:** Next.js + TypeScript + Shadcn/ui + Tailwind CSS + next-themes
- **Data & Business Logic:** Next.js API Routes + better-auth + PostgreSQL + Drizzle ORM + Zod
- **Deployment & Reliability:** Docker + Vercel + Git/GitHub + automated CI/CD
- **Testing & Visualization:** Playwright/Cypress + Recharts

This stack prioritizes clarity, maintainability, and performance. It ensures that both the developer experience and the end-user experience remain smooth as you extend the app with budgeting, expense logging, invoice management, and real-time profit/loss reporting.