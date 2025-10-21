"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"
import {
  calculateFinancialMetrics,
  generateCashFlowData,
  analyzeExpenseCategories,
  generateMonthlyFinancialData,
  formatCurrency,
  calculateProjectHealthScore
} from "@/lib/financial-calculations"

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
  createdAt: string
}

interface Project {
  id: string
  name: string
  client: string
  initialBudget: string
}

interface ProjectAnalyticsProps {
  project: Project
  expenses: Expense[]
  invoices: Invoice[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

export function ProjectAnalytics({ project, expenses, invoices }: ProjectAnalyticsProps) {
  const financialMetrics = useMemo(() =>
    calculateFinancialMetrics(project.initialBudget, expenses, invoices),
    [project.initialBudget, expenses, invoices]
  )

  const cashFlowData = useMemo(() =>
    generateCashFlowData(expenses, invoices),
    [expenses, invoices]
  )

  const expenseCategories = useMemo(() =>
    analyzeExpenseCategories(expenses),
    [expenses]
  )

  const monthlyData = useMemo(() =>
    generateMonthlyFinancialData(expenses, invoices),
    [expenses, invoices]
  )

  const healthScore = useMemo(() =>
    calculateProjectHealthScore(project.initialBudget, expenses, invoices),
    [project.initialBudget, expenses, invoices]
  )

  const pieChartData = expenseCategories.map(category => ({
    name: category.category,
    value: category.amount,
    percentage: category.percentage
  }))

  // Prepare data for cash flow chart (last 30 days)
  const last30DaysCashFlow = cashFlowData
    .slice(-30)
    .map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      income: item.income,
      expenses: item.expenses,
      netCashFlow: item.netCashFlow
    }))

  return (
    <div className="space-y-6">
      {/* Health Score Card */}
      <Card>
        <CardHeader>
          <CardTitle>Project Health Score</CardTitle>
          <CardDescription>
            Overall project health based on budget, profitability, and payment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold">
              {healthScore}
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    healthScore >= 80 ? 'bg-green-500' :
                    healthScore >= 60 ? 'bg-yellow-500' :
                    healthScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${healthScore}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {healthScore >= 80 ? 'Excellent' :
                 healthScore >= 60 ? 'Good' :
                 healthScore >= 40 ? 'Fair' : 'Poor'} project health
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="cashflow" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="categories">Expense Categories</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="cashflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Analysis</CardTitle>
              <CardDescription>
                Income vs expenses over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={last30DaysCashFlow}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      name="Income"
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stackId="2"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      name="Expenses"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Cash Flow</CardTitle>
              <CardDescription>
                Net cash flow trend
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={last30DaysCashFlow}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="netCashFlow"
                      stroke="#8884d8"
                      name="Net Cash Flow"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown by Category</CardTitle>
              <CardDescription>
                Total expenses: {formatCurrency(financialMetrics.totalExpenses)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenseCategories.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{category.category}</span>
                      <span className="text-sm text-muted-foreground">
                        ({category.count} items)
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(category.amount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {category.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Financial Trends</CardTitle>
              <CardDescription>
                Revenue, expenses, and profit over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                    <Bar dataKey="expenses" fill="#82ca9d" name="Expenses" />
                    <Bar dataKey="profit" fill="#ffc658" name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profit Margin Trends</CardTitle>
              <CardDescription>
                Monthly profit margin percentage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="profitMargin"
                      stroke="#8884d8"
                      name="Profit Margin %"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Revenue:</span>
                  <span className="font-medium">{formatCurrency(financialMetrics.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Expenses:</span>
                  <span className="font-medium">{formatCurrency(financialMetrics.totalExpenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Profit:</span>
                  <span className={`font-medium ${financialMetrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(financialMetrics.netProfit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Profit Margin:</span>
                  <span className="font-medium">{financialMetrics.profitMargin.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Initial Budget:</span>
                  <span className="font-medium">{formatCurrency(parseFloat(project.initialBudget))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Spent:</span>
                  <span className="font-medium">{formatCurrency(financialMetrics.totalExpenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining:</span>
                  <span className={`font-medium ${financialMetrics.remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(financialMetrics.remainingBudget)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Utilization:</span>
                  <span className="font-medium">{financialMetrics.budgetUtilization.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Paid Invoices:</span>
                  <span className="font-medium">{formatCurrency(financialMetrics.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Revenue:</span>
                  <span className="font-medium">{formatCurrency(financialMetrics.pendingRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Overdue Amount:</span>
                  <span className="font-medium text-red-600">{formatCurrency(financialMetrics.overdueRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Invoices:</span>
                  <span className="font-medium">{invoices.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}