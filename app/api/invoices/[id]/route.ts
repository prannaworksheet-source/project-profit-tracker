import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db, invoices, projects } from "@/db";
import { requireAuth } from "@/lib/middleware";
import { updateInvoiceSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    const invoice = await db
      .select({
        ...invoices,
        projectName: projects.name,
      })
      .from(invoices)
      .leftJoin(projects, eq(invoices.projectId, projects.id))
      .where(and(eq(invoices.id, params.id), eq(projects.userId, user.id)))
      .limit(1);

    if (invoice.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: invoice[0],
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    const body = await request.json();
    const validatedData = updateInvoiceSchema.parse(body);

    // Verify user owns the invoice through project
    const invoiceCheck = await db
      .select()
      .from(invoices)
      .leftJoin(projects, eq(invoices.projectId, projects.id))
      .where(and(eq(invoices.id, params.id), eq(projects.userId, user.id)))
      .limit(1);

    if (invoiceCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invoice not found or access denied" },
        { status: 404 }
      );
    }

    const updatedInvoice = await db
      .update(invoices)
      .set({
        ...validatedData,
        ...(validatedData.amount && {
          amount: validatedData.amount.toString(),
        }),
        ...(validatedData.dueDate && {
          dueDate: new Date(validatedData.dueDate),
        }),
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, params.id))
      .returning();

    // Update project's updated_at timestamp
    await db
      .update(projects)
      .set({ updatedAt: new Date() })
      .where(eq(projects.id, invoiceCheck[0].invoices.projectId));

    return NextResponse.json({
      success: true,
      data: updatedInvoice[0],
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    // Verify user owns the invoice through project
    const invoiceCheck = await db
      .select()
      .from(invoices)
      .leftJoin(projects, eq(invoices.projectId, projects.id))
      .where(and(eq(invoices.id, params.id), eq(projects.userId, user.id)))
      .limit(1);

    if (invoiceCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invoice not found or access denied" },
        { status: 404 }
      );
    }

    await db.delete(invoices).where(eq(invoices.id, params.id));

    // Update project's updated_at timestamp
    await db
      .update(projects)
      .set({ updatedAt: new Date() })
      .where(eq(projects.id, invoiceCheck[0].invoices.projectId));

    return NextResponse.json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}