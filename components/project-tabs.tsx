"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExpensesList } from "@/components/expenses-list"
import { InvoicesList } from "@/components/invoices-list"
import { ProjectAnalytics } from "@/components/project-analytics"
import { Button } from "@/components/ui/button"
import { IconPlus } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreateExpenseForm } from "@/components/create-expense-form"
import { CreateInvoiceForm } from "@/components/create-invoice-form"

interface Expense {
  id: string
  amount: string
  category: string
  description: string
  date: string
}

interface Invoice {
  id: string
  amount: string
  status: string
  dueDate: string
  invoiceNumber: string
  description?: string
}

interface Project {
  id: string
  name: string
  client: string
  initialBudget: string
}

interface ProjectTabsProps {
  project: Project
  projectId: string
  expenses: Expense[]
  invoices: Invoice[]
}

export function ProjectTabs({ project, projectId, expenses, invoices }: ProjectTabsProps) {
  return (
    <Tabs defaultValue="expenses" className="space-y-4">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2">
                <IconPlus className="size-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogDescription>
                  Record a new expense for this project.
                </DialogDescription>
              </DialogHeader>
              <CreateExpenseForm projectId={projectId} />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <IconPlus className="size-4" />
                Add Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>
                  Create a new invoice for this project.
                </DialogDescription>
              </DialogHeader>
              <CreateInvoiceForm projectId={projectId} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <TabsContent value="expenses" className="space-y-4">
        <ExpensesList expenses={expenses} projectId={projectId} />
      </TabsContent>

      <TabsContent value="invoices" className="space-y-4">
        <InvoicesList invoices={invoices} projectId={projectId} />
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4">
        <ProjectAnalytics
          project={project}
          expenses={expenses}
          invoices={invoices}
        />
      </TabsContent>
    </Tabs>
  )
}