"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { IconExternalLink, IconTrendingUp, IconTrendingDown } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface Project {
  id: string
  name: string
  client: string
  initialBudget: string
  createdAt: string
  updatedAt: string
  _count?: {
    expenses: number
    invoices: number
  }
  _sum?: {
    expenses: { amount: string | null }
    invoices: { amount: string | null }
  }
}

interface ProjectWithMetrics extends Project {
  totalExpenses: number
  totalRevenue: number
  netProfit: number
  profitMargin: number
}

function ProjectCardSkeleton() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardFooter className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-8 w-20" />
      </CardFooter>
    </Card>
  )
}

function ProjectCard({ project }: { project: ProjectWithMetrics }) {
  const isProfitable = project.netProfit >= 0

  return (
    <Card className="@container/card hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{project.name}</CardTitle>
        <CardDescription>{project.client}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Budget:</span>
            <span className="text-sm">${parseFloat(project.initialBudget).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isProfitable ? "default" : "destructive"} className="gap-1">
              {isProfitable ? (
                <IconTrendingUp className="size-3" />
              ) : (
                <IconTrendingDown className="size-3" />
              )}
              {isProfitable ? "Profit" : "Loss"}
            </Badge>
            <span className="text-sm font-medium">
              ${Math.abs(project.netProfit).toLocaleString()}
            </span>
          </div>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={`/dashboard/projects/${project.id}`}>
            View <IconExternalLink className="ml-2 size-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export function ProjectsGrid() {
  const [projects, setProjects] = useState<ProjectWithMetrics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      const response = await fetch("/api/projects")
      if (!response.ok) {
        throw new Error("Failed to fetch projects")
      }

      const data = await response.json()

      // Transform projects with calculated metrics
      const projectsWithMetrics = data.data.map((project: any) => {
        const totalExpenses = project._sum?.expenses?.amount
          ? parseFloat(project._sum.expenses.amount)
          : 0
        const totalRevenue = project._sum?.invoices?.amount
          ? parseFloat(project._sum.invoices.amount)
          : 0
        const netProfit = totalRevenue - totalExpenses
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

        return {
          ...project,
          totalExpenses,
          totalRevenue,
          netProfit,
          profitMargin
        }
      })

      setProjects(projectsWithMetrics)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">Failed to load projects</p>
        <Button onClick={fetchProjects} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">No projects found</p>
        <p className="text-sm text-muted-foreground">
          Create your first project to start tracking budgets and expenses.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}