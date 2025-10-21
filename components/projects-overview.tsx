"use client"

import { IconTrendingDown, IconTrendingUp, IconPlus } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreateProjectForm } from "@/components/create-project-form"

interface ProjectStats {
  totalProjects: number
  totalBudget: number
  totalRevenue: number
  totalExpenses: number
  netProfit: number
}

export function ProjectsOverview() {
  // This would be fetched from API in a real implementation
  const stats: ProjectStats = {
    totalProjects: 8,
    totalBudget: 125000,
    totalRevenue: 95000,
    totalExpenses: 72000,
    netProfit: 23000
  }

  const profitMargin = stats.totalRevenue > 0 ? (stats.netProfit / stats.totalRevenue) * 100 : 0

  return (
    <div className="flex items-center justify-between">
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:grid-cols-2 @xl/main:grid-cols-4 @5xl/main:grid-cols-4">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Projects</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stats.totalProjects}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">
              Active projects this period
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              ${stats.totalRevenue.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp className="size-4" />
                +8.2%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Revenue trending up <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              From paid invoices
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Expenses</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              ${stats.totalExpenses.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingDown />
                -3.1%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Expenses down <IconTrendingDown className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Cost optimization working
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Net Profit</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              ${stats.netProfit.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant={profitMargin >= 20 ? "default" : "outline"}>
                {profitMargin >= 20 ? (
                  <IconTrendingUp />
                ) : (
                  <IconTrendingDown />
                )}
                {profitMargin.toFixed(1)}%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {profitMargin >= 20 ? "Healthy profit margin" : "Margin needs improvement"}
              {profitMargin >= 20 ? (
                <IconTrendingUp className="size-4" />
              ) : (
                <IconTrendingDown className="size-4" />
              )}
            </div>
            <div className="text-muted-foreground">
              Profit margin: {profitMargin.toFixed(1)}%
            </div>
          </CardFooter>
        </Card>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" className="gap-2">
            <IconPlus className="size-4" />
            New Project
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Add a new project to start tracking its budget, expenses, and invoices.
            </DialogDescription>
          </DialogHeader>
          <CreateProjectForm />
        </DialogContent>
      </Dialog>
    </div>
  )
}