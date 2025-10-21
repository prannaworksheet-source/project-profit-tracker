import { Expense, Invoice } from "@/db"

export interface FinancialMetrics {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  budgetUtilization: number
  remainingBudget: number
  pendingRevenue: number
  overdueRevenue: number
}

export interface CashFlowData {
  date: string
  income: number
  expenses: number
  netCashFlow: number
  cumulativeBalance: number
}

export interface ExpenseCategoryData {
  category: string
  amount: number
  percentage: number
  count: number
}

export interface MonthlyFinancialData {
  month: string
  revenue: number
  expenses: number
  profit: number
  profitMargin: number
}

/**
 * Calculate comprehensive financial metrics for a project
 */
export function calculateFinancialMetrics(
  initialBudget: string,
  expenses: Expense[],
  invoices: Invoice[]
): FinancialMetrics {
  const budget = parseFloat(initialBudget) || 0

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0)

  // Calculate revenue by status
  const paidInvoices = invoices.filter(invoice => invoice.status === 'paid')
  const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending')
  const overdueInvoices = invoices.filter(invoice => invoice.status === 'overdue')

  const totalRevenue = paidInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.amount), 0)
  const pendingRevenue = pendingInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.amount), 0)
  const overdueRevenue = overdueInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.amount), 0)

  // Calculate profit metrics
  const netProfit = totalRevenue - totalExpenses
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

  // Calculate budget metrics
  const budgetUtilization = budget > 0 ? (totalExpenses / budget) * 100 : 0
  const remainingBudget = budget - totalExpenses

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    budgetUtilization,
    remainingBudget,
    pendingRevenue,
    overdueRevenue
  }
}

/**
 * Generate cash flow data over time
 */
export function generateCashFlowData(
  expenses: Expense[],
  invoices: Invoice[],
  startDate?: Date,
  endDate?: Date
): CashFlowData[] {
  const start = startDate || new Date(Math.min(
    ...expenses.map(e => new Date(e.date).getTime()),
    ...invoices.map(i => new Date(i.createdAt).getTime())
  ))

  const end = endDate || new Date(Math.max(
    ...expenses.map(e => new Date(e.date).getTime()),
    ...invoices.map(i => new Date(i.createdAt).getTime())
  ))

  const cashFlowMap = new Map<string, CashFlowData>()

  // Initialize all dates in range
  const currentDate = new Date(start)
  while (currentDate <= end) {
    const dateKey = currentDate.toISOString().split('T')[0]
    cashFlowMap.set(dateKey, {
      date: dateKey,
      income: 0,
      expenses: 0,
      netCashFlow: 0,
      cumulativeBalance: 0
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Add expenses
  expenses.forEach(expense => {
    const dateKey = new Date(expense.date).toISOString().split('T')[0]
    const data = cashFlowMap.get(dateKey)
    if (data) {
      data.expenses += parseFloat(expense.amount)
    }
  })

  // Add paid invoices as income
  invoices
    .filter(invoice => invoice.status === 'paid')
    .forEach(invoice => {
      const dateKey = new Date(invoice.createdAt).toISOString().split('T')[0]
      const data = cashFlowMap.get(dateKey)
      if (data) {
        data.income += parseFloat(invoice.amount)
      }
    })

  // Calculate net cash flow and cumulative balance
  let cumulativeBalance = 0
  Array.from(cashFlowMap.values())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .forEach(data => {
      data.netCashFlow = data.income - data.expenses
      cumulativeBalance += data.netCashFlow
      data.cumulativeBalance = cumulativeBalance
    })

  return Array.from(cashFlowMap.values())
}

/**
 * Analyze expenses by category
 */
export function analyzeExpenseCategories(expenses: Expense[]): ExpenseCategoryData[] {
  const categoryMap = new Map<string, { amount: number; count: number }>()

  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0)

  expenses.forEach(expense => {
    const category = expense.category || 'Other'
    const amount = parseFloat(expense.amount)
    const current = categoryMap.get(category) || { amount: 0, count: 0 }
    categoryMap.set(category, {
      amount: current.amount + amount,
      count: current.count + 1
    })
  })

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
      count: data.count
    }))
    .sort((a, b) => b.amount - a.amount)
}

/**
 * Generate monthly financial data for charts
 */
export function generateMonthlyFinancialData(
  expenses: Expense[],
  invoices: Invoice[],
  months: number = 12
): MonthlyFinancialData[] {
  const monthlyData = new Map<string, MonthlyFinancialData>()

  // Initialize months
  const now = new Date()
  for (let i = months - 1; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = month.toISOString().slice(0, 7) // YYYY-MM
    monthlyData.set(monthKey, {
      month: month.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      revenue: 0,
      expenses: 0,
      profit: 0,
      profitMargin: 0
    })
  }

  // Add expenses to monthly data
  expenses.forEach(expense => {
    const monthKey = expense.date.slice(0, 7) // Extract YYYY-MM from date string
    const data = monthlyData.get(monthKey)
    if (data) {
      data.expenses += parseFloat(expense.amount)
    }
  })

  // Add invoices to monthly data
  invoices
    .filter(invoice => invoice.status === 'paid')
    .forEach(invoice => {
      const monthKey = invoice.createdAt.slice(0, 7) // Extract YYYY-MM from date string
      const data = monthlyData.get(monthKey)
      if (data) {
        data.revenue += parseFloat(invoice.amount)
      }
    })

  // Calculate profit and margin for each month
  monthlyData.forEach(data => {
    data.profit = data.revenue - data.expenses
    data.profitMargin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0
  })

  return Array.from(monthlyData.values())
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Calculate project health score (0-100)
 */
export function calculateProjectHealthScore(
  initialBudget: string,
  expenses: Expense[],
  invoices: Invoice[]
): number {
  const metrics = calculateFinancialMetrics(initialBudget, expenses, invoices)

  let score = 100

  // Deduct points for being over budget
  if (metrics.budgetUtilization > 100) {
    score -= Math.min(40, (metrics.budgetUtilization - 100) * 0.5)
  }

  // Deduct points for negative profit margin
  if (metrics.profitMargin < 0) {
    score -= Math.min(30, Math.abs(metrics.profitMargin) * 0.5)
  }

  // Deduct points for high overdue amount
  if (metrics.overdueRevenue > 0) {
    const overdueRatio = metrics.overdueRevenue / (metrics.totalRevenue + metrics.overdueRevenue)
    score -= Math.min(20, overdueRatio * 100)
  }

  // Bonus points for good profit margin
  if (metrics.profitMargin > 20) {
    score += Math.min(10, (metrics.profitMargin - 20) * 0.2)
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}