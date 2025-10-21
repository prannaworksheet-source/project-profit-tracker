import {
    pgTable,
    text,
    decimal,
    timestamp,
    uuid,
    index
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const projects = pgTable("projects", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    client: text("client").notNull(),
    initialBudget: decimal("initial_budget", { precision: 15, scale: 2 }).notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull(),
}, (table) => ({
    userIdIdx: index("projects_user_id_idx").on(table.userId),
}));

export const expenses = pgTable("expenses", {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
        .notNull()
        .references(() => projects.id, { onDelete: "cascade" }),
    amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
    category: text("category").notNull(),
    description: text("description"),
    date: timestamp("date").notNull(),
    createdAt: timestamp("created_at")
        .defaultNow()
        .notNull(),
}, (table) => ({
    projectIdIdx: index("expenses_project_id_idx").on(table.projectId),
    dateIdx: index("expenses_date_idx").on(table.date),
}));

export const invoices = pgTable("invoices", {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
        .notNull()
        .references(() => projects.id, { onDelete: "cascade" }),
    invoiceNumber: text("invoice_number").notNull().unique(),
    amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
    dueDate: timestamp("due_date").notNull(),
    status: text("status").notNull().default("pending"), // pending, paid, overdue, cancelled
    description: text("description"),
    createdAt: timestamp("created_at")
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull(),
}, (table) => ({
    projectIdIdx: index("invoices_project_id_idx").on(table.projectId),
    statusIdx: index("invoices_status_idx").on(table.status),
    dueDateIdx: index("invoices_due_date_idx").on(table.dueDate),
}));

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;