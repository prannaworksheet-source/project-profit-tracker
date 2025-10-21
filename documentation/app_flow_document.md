# App Flow Document for Project Profit & Loss Tracker

## Onboarding and Sign-In/Sign-Up

When a new user first visits the Project Profit & Loss Tracker, they arrive at a clean landing page that highlights the core value of the app and offers buttons to sign up or sign in. Clicking the sign-up button brings up a full-screen form where the user enters their name, email, and password. After submitting the form, the application sends a confirmation email and prompts the user to verify their address. Once verification is complete, the user is automatically logged in and taken to their dashboard. If an existing user clicks "Sign In," they see a form for email and password. Upon successful entry, they are redirected to the main dashboard. A "Forgot Password" link under the sign-in form allows users to request a password reset. They provide their email address, receive a reset link, and follow it to set a new password. After resetting, the user can log in as normal. Signing out is available in the header menu on every page, and when clicked, it ends the session and returns the user to the landing page.

## Main Dashboard or Home Page

After logging in, the user lands on the dashboard. The top of the page features a header with the app logo, a theme toggle for light or dark mode, and the user’s avatar which opens an account menu when clicked. On the left, a vertical sidebar offers navigation to the Dashboard overview, Projects list, Invoices, Expenses, and Settings. The central area displays a summary card for total revenue, total costs, and net profit. Below those cards, there is a cash flow chart that shows the trend over time. At the bottom of the main dashboard, the user finds a table listing all projects with their current budgets and profit or loss figures. Clicking on any project row directs the user to that project’s detail page.

## Detailed Feature Flows and Page Transitions

### Project Budgeting Flow

From the Projects list, the user sees an "Add Project" button. Clicking it opens a modal dialog containing a form with fields for project name, client name, and initial budget. The user enters those details and clicks "Save." The app sends a POST request to the `/api/projects` endpoint, where the backend validates the data using Zod, creates a new project record via Drizzle ORM, and returns the created project. The modal closes, and the new project appears immediately in the Projects list on the dashboard. The user may click the project name to go to the project detail page.

### Project Detail and Expense Tracking Flow

On the project detail page, a header shows the project name, client, initial budget, and a summary of current profit or loss. A date filter control lets the user narrow records by date range, updating charts and tables in real time. Below the header, the page is split into two tabs labeled "Expenses" and "Invoices." In the "Expenses" tab, an "Add Expense" button opens a modal form where the user enters expense amount, date, category, and description. After submission, the app calls the `/api/projects/[id]/expenses` endpoint, stores the new expense, and refreshes the table to include the entry. The profit/loss summary at the top updates automatically. Expenses can be edited or deleted by clicking the action icons next to each row, triggering inline edit forms or confirmation dialogs.

### Invoice Management Flow

Switching to the "Invoices" tab displays a table of existing invoices. The user clicks "Add Invoice" to open a modal with fields for invoice amount, due date, and status selector defaulting to "Draft." Submitting invokes the `/api/invoices` API to create the invoice. Once saved, the invoice row appears in the list. The user can change an invoice status from "Draft" to "Sent" or "Paid" by clicking a status badge in the table, which triggers an update request to `/api/invoices/[id]` and updates the badge color and project summary accordingly. For overdue invoices, the app highlights the row in a warning color.

### Cash Flow and P&L Calculation Integration

Throughout both tabs, the profit and loss figures at the top are recalculated on every data change. When a user adds, edits, or deletes an expense or invoice, the frontend calls a shared calculation function in `lib/calculations.ts`. This function aggregates income from paid invoices and subtracts total expenses, returning current net profit or loss. A chart component then re-renders to show updated cash flow over the selected date range.

## Settings and Account Management

Users access settings by clicking their avatar in the header and choosing "Settings." The Settings page offers sections for Profile, Preferences, and Notifications. In Profile, users update their name or email and click "Save" to send a PATCH request to `/api/user`. In Preferences, users toggle between light and dark themes, which persists in their account settings and applies across the app. Notifications settings let them subscribe to email reminders for upcoming invoice due dates or budget alerts. A "Change Password" button on this page opens a form where the user enters current and new passwords before submitting to an endpoint that validates and updates credentials. After any changes, a confirmation message appears, and the user can click "Back to Dashboard" at the top to return to the main view.

## Error States and Alternate Paths

If a user submits invalid form data—such as a non-numeric expense amount or missing project name—the form highlights the offending fields in red and displays clear error text describing the issue. When the backend API detects invalid input or a server error, an error toast appears at the top right, and the form remains open for correction. In the event of network loss, a persistent banner appears across the top of every page indicating offline mode. Actions that require connectivity are disabled until the connection returns. If a user attempts to navigate to a project that does not exist or to which they lack permission, the app redirects them to a friendly 404 page explaining that the project was not found or access is denied, with a button to go back to the dashboard.

## Conclusion and Overall App Journey

A typical user starts by signing up with an email address, verifies their account, and lands on the dashboard. They create a project by specifying its name, client, and budget. From there, they log expenses and invoices in dedicated sections, each action reflecting immediately in the real-time profit and loss summary. The interactive dashboard and detailed project pages keep financial data organized and visible at a glance. Users manage their profile and preferences through a clear settings workflow, and any errors are communicated promptly so they can keep working without confusion. Overall, the application guides users from initial onboarding through daily expense tracking and cash flow analysis in a seamless, intuitive experience.