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
import { EditInvoiceDialog } from "@/components/edit-invoice-dialog"

interface Invoice {
  id: string
  invoiceNumber: string
  amount: string
  status: string
  dueDate: string
  description?: string
}

interface InvoicesListProps {
  invoices: Invoice[]
  projectId: string
}

function InvoicesListSkeleton() {
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
              <TableHead>Invoice #</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "paid":
      return "default"
    case "pending":
      return "secondary"
    case "overdue":
      return "destructive"
    case "cancelled":
      return "outline"
    default:
      return "secondary"
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "paid":
      return "text-green-700 bg-green-100"
    case "pending":
      return "text-yellow-700 bg-yellow-100"
    case "overdue":
      return "text-red-700 bg-red-100"
    case "cancelled":
      return "text-gray-700 bg-gray-100"
    default:
      return "text-gray-700 bg-gray-100"
  }
}

export function InvoicesList({ invoices: initialInvoices, projectId }: InvoicesListProps) {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [isLoading, setIsLoading] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const { toast } = useToast()

  async function handleDeleteInvoice(invoiceId: string) {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete invoice")
      }

      toast({
        title: "Success",
        description: "Invoice deleted successfully!",
      })

      // Remove invoice from list
      setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId))

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete invoice",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleEditInvoice(invoice: Invoice) {
    setEditingInvoice(invoice)
  }

  function handleInvoiceUpdated(updatedInvoice: Invoice) {
    setInvoices(prev =>
      prev.map(invoice =>
        invoice.id === updatedInvoice.id ? updatedInvoice : invoice
      )
    )
    setEditingInvoice(null)
  }

  const totalRevenue = invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + parseFloat(invoice.amount), 0)

  const pendingRevenue = invoices
    .filter(invoice => invoice.status === 'pending')
    .reduce((sum, invoice) => sum + parseFloat(invoice.amount), 0)

  if (isLoading && invoices.length === 0) {
    return <InvoicesListSkeleton />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Invoices</h3>
          <p className="text-sm text-muted-foreground">
            Paid: ${totalRevenue.toFixed(2)} | Pending: ${pendingRevenue.toFixed(2)} ({invoices.length} total)
          </p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground">No invoices created yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Create your first invoice to start tracking project revenue.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell>
                    ${parseFloat(invoice.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusVariant(invoice.status)}
                      className={getStatusColor(invoice.status)}
                    >
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
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
                          onClick={() => handleEditInvoice(invoice)}
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
                                This action cannot be undone. This will permanently delete the invoice.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteInvoice(invoice.id)}
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

      {editingInvoice && (
        <EditInvoiceDialog
          invoice={editingInvoice}
          isOpen={true}
          onClose={() => setEditingInvoice(null)}
          onUpdate={handleInvoiceUpdated}
        />
      )}
    </div>
  )
}