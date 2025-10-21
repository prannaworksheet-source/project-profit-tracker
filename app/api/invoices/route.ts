import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { db, invoices, projects } from "@/db";
import { requireAuth } from "@/lib/middleware";
import { createInvoiceSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");

    let query = db
      .select({
        ...invoices,
        projectName: projects.name,
      })
      .from(invoices)
      .leftJoin(projects, eq(invoices.projectId, projects.id))
      .where(eq(projects.userId, user.id));

    if (projectId) {
      query = query.where(and(eq(projects.userId, user.id), eq(invoices.projectId, projectId)));
    }

    if (status) {
      query = query.where(and(eq(projects.userId, user.id), eq(invoices.status, status)));
    }

    const userInvoices = await query.orderBy(desc(invoices.createdAt));

    return NextResponse.json({
      success: true,
      data: userInvoices,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    const body = await request.json();
    const validatedData = createInvoiceSchema.parse(body);

    // Verify user owns the project
    const projectCheck = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, validatedData.projectId), eq(projects.userId, user.id)))
      .limit(1);

    if (projectCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // Check for duplicate invoice number
    const existingInvoice = await db
      .select()
      .from(invoices)
      .where(eq(invoices.invoiceNumber, validatedData.invoiceNumber))
      .limit(1);

    if (existingInvoice.length > 0) {
      return NextResponse.json(
        { success: false, error: "Invoice number already exists" },
        { status: 400 }
      );
    }

    const newInvoice = await db
      .insert(invoices)
      .values({
        ...validatedData,
        amount: validatedData.amount.toString(),
        dueDate: new Date(validatedData.dueDate),
      })
      .returning();

    // Update project's updated_at timestamp
    await db
      .update(projects)
      .set({ updatedAt: new Date() })
      .where(eq(projects.id, validatedData.projectId));

    return NextResponse.json({
      success: true,
      data: newInvoice[0],
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

    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}