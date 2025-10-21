
-- Create projects table
CREATE TABLE IF NOT EXISTS "projects" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "initial_budget" DECIMAL(15,2) NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for projects
CREATE INDEX IF NOT EXISTS "projects_user_id_idx" ON "projects"("user_id");

-- Create expenses table
CREATE TABLE IF NOT EXISTS "expenses" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
    FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE
);

-- Create indexes for expenses
CREATE INDEX IF NOT EXISTS "expenses_project_id_idx" ON "expenses"("project_id");
CREATE INDEX IF NOT EXISTS "expenses_date_idx" ON "expenses"("date");

-- Create invoices table
CREATE TABLE IF NOT EXISTS "invoices" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "invoice_number" TEXT NOT NULL UNIQUE,
    "amount" DECIMAL(15,2) NOT NULL,
    "due_date" TIMESTAMP NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "description" TEXT,
    "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL,
    FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE
);

-- Create indexes for invoices
CREATE INDEX IF NOT EXISTS "invoices_project_id_idx" ON "invoices"("project_id");
CREATE INDEX IF NOT EXISTS "invoices_status_idx" ON "invoices"("status");
CREATE INDEX IF NOT EXISTS "invoices_due_date_idx" ON "invoices"("due_date");
