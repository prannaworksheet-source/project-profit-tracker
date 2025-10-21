import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react"

interface Project {
  id: string
  name: string
  client: string
  initialBudget: string
  createdAt: string
  updatedAt: string
}

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
}

interface ProjectSummaryProps {
  project: Project
  expenses: Expense[]
  invoices: Invoice[]
}

export function ProjectSummary({ project, expenses, invoices }: ProjectSummaryProps) {
  const initialBudget = parseFloat(project.initialBudget) || 0

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0)

  // Calculate total revenue (only paid invoices)
  const totalRevenue = invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + parseFloat(invoice.amount), 0)

  // Calculate pending revenue
  const pendingRevenue = invoices
    .filter(invoice => invoice.status === 'pending')
    .reduce((sum, invoice) => sum + parseFloat(invoice.amount), 0)

  // Calculate net profit
  const netProfit = totalRevenue - totalExpenses
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

  // Budget utilization
  const budgetUtilization = initialBudget > 0 ? (totalExpenses / initialBudget) * 100 : 0
  const remainingBudget = initialBudget - totalExpenses

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)

  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString))

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Initial Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(initialBudget)}</div>
          <p className="text-xs text-muted-foreground">
            Created on {formatDate(project.createdAt)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <Badge variant={budgetUtilization > 100 ? "destructive" : "secondary"}>
            {budgetUtilization.toFixed(1)}% used
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">
            {remainingBudget >= 0
              ? `${formatCurrency(remainingBudget)} remaining`
              : `${formatCurrency(Math.abs(remainingBudget))} over budget`
            }
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          {pendingRevenue > 0 && (
            <Badge variant="outline">
              {formatCurrency(pendingRevenue)} pending
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            From {invoices.filter(i => i.status === 'paid').length} paid invoices
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          <Badge
            variant={netProfit >= 0 ? "default" : "destructive"}
            className="gap-1"
          >
            {netProfit >= 0 ? (
              <IconTrendingUp className="size-3" />
            ) : (
              <IconTrendingDown className="size-3" />
            )}
            {profitMargin.toFixed(1)}%
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(Math.abs(netProfit))}
          </div>
          <p className="text-xs text-muted-foreground">
            {netProfit >= 0 ? "Profit" : "Loss"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}