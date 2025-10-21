"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  DialogClose,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { createProjectSchema, type CreateProjectInput } from "@/lib/validations"

export function CreateProjectForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      client: "",
      initialBudget: "",
    },
  })

  async function onSubmit(values: CreateProjectInput) {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create project")
      }

      const result = await response.json()

      toast({
        title: "Success",
        description: "Project created successfully!",
      })

      // Close the dialog and refresh the page
      router.refresh()

      // Reset form
      form.reset()

      // Trigger close of dialog
      const closeButton = document.querySelector("[data-dialog-close]") as HTMLButtonElement
      closeButton?.click()

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create project",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter project name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="client"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client</FormLabel>
              <FormControl>
                <Input placeholder="Enter client name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="initialBudget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial Budget ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </form>
    </Form>
  )
}