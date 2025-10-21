"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { EditExpenseDialog } from "@/components/edit-expense-dialog"

interface Expense {
  id: string
  amount: string
  category: string
  description: string
  date: string
}

interface ExpensesListProps {
  expenses: Expense[]
  projectId: string
}

function ExpensesListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export function ExpensesList({ expenses: initialExpenses, projectId }: ExpensesListProps) {
  const [expenses, setExpenses] = useState(initialExpenses)
  const [isLoading, setIsLoading] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const { toast } = useToast()

  async function handleDeleteExpense(expenseId: string) {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete expense")
      }

      toast({
        title: "Success",
        description: "Expense deleted successfully!",
      })

      // Remove expense from list
      setExpenses(prev => prev.filter(expense => expense.id !== expenseId))

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete expense",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleEditExpense(expense: Expense) {
    setEditingExpense(expense)
  }

  function handleExpenseUpdated(updatedExpense: Expense) {
    setExpenses(prev =>
      prev.map(expense =>
        expense.id === updatedExpense.id ? updatedExpense : expense
      )
    )
    setEditingExpense(null)
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0)

  if (isLoading && expenses.length === 0) {
    return <ExpensesListSkeleton />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Expenses</h3>
          <p className="text-sm text-muted-foreground">
            Total: ${totalExpenses.toFixed(2)} ({expenses.length} items)
          </p>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground">No expenses recorded yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Add your first expense to start tracking project costs.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    {format(new Date(expense.date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{expense.category}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {expense.description || "-"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${parseFloat(expense.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleEditExpense(expense)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the expense.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteExpense(expense.id)}
                                disabled={isLoading}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {editingExpense && (
        <EditExpenseDialog
          expense={editingExpense}
          isOpen={true}
          onClose={() => setEditingExpense(null)}
          onUpdate={handleExpenseUpdated}
        />
      )}
    </div>
  )
}