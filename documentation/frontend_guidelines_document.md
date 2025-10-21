# Frontend Guideline Document

This document outlines the frontend architecture, design principles, and key technologies for the Project Profit & Loss Tracker application. It is written in everyday language, so anyone—regardless of technical background—can understand how the frontend is set up and why it works the way it does.

## 1. Frontend Architecture

### Overview
- **Framework**: Next.js (App Router) with React and TypeScript. Next.js gives us fast page loads, SEO-friendly server-rendered pages, and client-side interactivity where it matters.
- **UI Library**: Shadcn/ui supplies ready-made components like cards, tables, dialogs, and forms that fit together seamlessly.
- **Styling**: Tailwind CSS provides utility-first classes for rapid, consistent styling.
- **Theming**: `next-themes` makes switching between light and dark mode easy.

### How It Supports Scalability, Maintainability, and Performance
- **File-Based Routing**: Pages and API routes live in the `app/` folder. Adding new features is as simple as creating new files and folders—no complex config required.
- **Server vs. Client Components**: Static or lightly dynamic pages are server components (fast loads), while interactive parts (forms, modals, tables) are client components (rich UX).
- **TypeScript**: Catches errors early and makes the codebase self-documenting, which is essential for a financial app.
- **Component-Based Structure**: Reusable components reduce duplication and keep the codebase organized.

## 2. Design Principles

1. **Usability**: Every feature should be straightforward. Forms use clear labels and validations. Tables and charts present data in an instantly understandable way.
2. **Accessibility**: Components follow ARIA standards. Color contrasts are sufficient. Keyboard navigation and screen-reader support are built in via Shadcn/ui.
3. **Responsiveness**: The layout adapts fluidly across desktop, tablet, and mobile, thanks to Tailwind’s responsive utilities.
4. **Consistency**: Colors, typography, spacing, and component behaviors stay uniform across the app.

How We Apply Them:
- **Forms & Validation**: Inputs clearly indicate required fields and errors.
- **Navigation**: A consistent header and sidebar guide users through projects, expenses, and invoices.
- **Feedback**: Loading spinners, success messages, and error prompts all use the same component styles.

## 3. Styling and Theming

### Styling Approach
- **Tailwind CSS**: Utility classes like `p-4`, `bg-white`, and `text-gray-700` let us style elements directly in the markup.
- **BEM-Lite Naming**: For custom CSS modules (if used), we follow a simplified BEM approach (e.g., `.modal__header`, `.button--primary`).
- **No Pre-Processor Needed**: Tailwind’s built-in features cover most needs without SASS.

### Theming
- **Light & Dark Modes**: Controlled via `next-themes`. We define two sets of CSS variables (`:root` and `.dark`) for colors and swap them based on user preference.

### Visual Style
- **Style**: Modern flat design with gentle shadows and rounded corners. Occasional glassmorphism touches (semi-transparent panels) add depth without clutter.

### Color Palette
- Primary: #3B82F6 (blue)
- Secondary: #10B981 (green)
- Accent: #F59E0B (amber)
- Background (light): #F9FAFB
- Background (dark): #1F2937
- Text (light): #111827
- Text (dark): #D1D5DB

### Fonts
- **Primary**: Inter (system-font fallback). It’s clean and highly legible for dashboards and tables.

## 4. Component Structure

- **`components/ui/`**: Houses all shared UI elements from Shadcn/ui plus small custom wrappers (e.g., a `CurrencyInput`).
- **Feature Folders**: Under `components/project/`, we keep project-specific pieces like `ProjectForm.tsx`, `ExpenseModal.tsx`, and `InvoiceTable.tsx`.
- **Why Component-Based?**
  - Reuse speeds up development.
  - Isolating concerns makes testing and maintenance easier.
  - Small, focused components are easier to update or swap out in the future.

## 5. State Management

- **Local State**: React’s `useState` and `useReducer` handle form inputs, dialog open/close state, and small UI flags.
- **Data Fetching & Caching**: We recommend using a lightweight library like SWR or React Query to fetch from our Next.js API Routes, cache results, and keep components in sync.
- **Context API**: Used sparingly, for global concerns like theme and authenticated user info.

## 6. Routing and Navigation

- **File-Based Routing**: Every file in `app/` becomes a route. For instance, `app/dashboard/projects/[id]/page.tsx` renders a project’s detail view.
- **Linking**: Use Next.js’ `<Link>` component for client-side transitions, which prefetches pages for speed.
- **Dynamic Routes**: Bracket notation (`[id]`) makes it easy to build pages for any project, expense, or invoice by ID.
- **Sidebar & Breadcrumbs**: A fixed sidebar on desktop (collapsible on mobile) and breadcrumb nav within project pages help users know where they are.

## 7. Performance Optimization

- **Code Splitting**: Next.js automatically splits code by route. We can further use `dynamic()` to lazy-load heavy components (like charts).
- **Image Optimization**: Use Next.js `<Image>` for remote or local assets. It serves appropriately sized images with modern formats.
- **Tailwind Purge**: Removes unused CSS in production, keeping stylesheets small.
- **Server Components**: Serving as much as possible from the server reduces bundle sizes for client code.
- **Caching API Calls**: SWR/React Query caches and re-uses data, minimizing network requests.

## 8. Testing and Quality Assurance

- **Unit Tests**: Jest + React Testing Library for components and utility functions (e.g., profit/loss calculations in `lib/calculations.ts`).
- **Integration Tests**: Test API routes using Jest and Supertest or a similar framework, ensuring endpoints create, read, update, and delete data correctly.
- **End-to-End Tests**: Playwright or Cypress automate user flows—creating a project, logging an expense, marking an invoice paid—to catch regressions in real usage.
- **Type Safety**: TypeScript plus Zod for validating API inputs and form data prevents invalid data from reaching our database.
- **Linting & Formatting**: ESLint with recommended React and TypeScript rules, Prettier for consistent code style.

## 9. Conclusion and Overall Frontend Summary

The Project Profit & Loss Tracker frontend is built for clarity, speed, and reliability. Its key strengths include:
- A **Next.js + TypeScript** foundation for fast, SEO-friendly pages and type safety.
- **Tailwind CSS** and **Shadcn/ui** for consistent, beautiful UIs with minimal custom CSS.
- A **component-based structure** that encourages reuse and easy maintenance.
- Thoughtful **design principles**—usability, accessibility, responsiveness—applied everywhere.
- **Performance optimizations** like code splitting, image handling, and caching.
- A robust **testing strategy** to ensure data correctness and a bug-free experience.

Together, these guidelines ensure the frontend remains organized, scalable, and easy for both developers and non-technical stakeholders to understand.