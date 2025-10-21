import { notFound } from "next/navigation"
import { ProjectSummary } from "@/components/project-summary"
import { ProjectTabs } from "@/components/project-tabs"

async function getProject(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/projects/${id}`, {
      cache: "no-store"
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error("Failed to fetch project")
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error("Error fetching project:", error)
    return null
  }
}

async function getProjectExpenses(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/projects/${id}/expenses`, {
      cache: "no-store"
    })

    if (!response.ok) {
      throw new Error("Failed to fetch project expenses")
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error("Error fetching project expenses:", error)
    return []
  }
}

async function getProjectInvoices(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/invoices?projectId=${id}`, {
      cache: "no-store"
    })

    if (!response.ok) {
      throw new Error("Failed to fetch project invoices")
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error("Error fetching project invoices:", error)
    return []
  }
}

export default async function ProjectPage({
  params
}: {
  params: { id: string }
}) {
  const [project, expenses, invoices] = await Promise.all([
    getProject(params.id),
    getProjectExpenses(params.id),
    getProjectInvoices(params.id)
  ])

  if (!project) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <ProjectSummary project={project} expenses={expenses} invoices={invoices} />
      <ProjectTabs
        project={project}
        projectId={params.id}
        expenses={expenses}
        invoices={invoices}
      />
    </div>
  )
}