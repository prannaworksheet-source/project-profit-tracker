import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  client: z.string().min(1, "Client name is required").max(100),
  initialBudget: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    },
    {
      message: "Initial budget must be a valid positive number",
    }
  ),
});

export const updateProjectSchema = createProjectSchema.partial();

export const createExpenseSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    {
      message: "Amount must be a valid positive number",
    }
  ),
  category: z.string().min(1, "Category is required").max(50),
  description: z.string().optional(),
  date: z.string().datetime("Invalid date format"),
});

export const updateExpenseSchema = createExpenseSchema.partial().omit({
  projectId: true,
});

export const createInvoiceSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
  invoiceNumber: z.string().min(1, "Invoice number is required").max(50),
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    {
      message: "Amount must be a valid positive number",
    }
  ),
  dueDate: z.string().datetime("Invalid due date format"),
  status: z.enum(["pending", "paid", "overdue", "cancelled"]).default("pending"),
  description: z.string().optional(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial().omit({
  projectId: true,
  invoiceNumber: true,
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;