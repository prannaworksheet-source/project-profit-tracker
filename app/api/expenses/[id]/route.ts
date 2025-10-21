import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db, expenses, projects } from "@/db";
import { requireAuth } from "@/lib/middleware";
import { updateExpenseSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    const expense = await db
      .select({
        ...expenses,
        projectName: projects.name,
      })
      .from(expenses)
      .leftJoin(projects, eq(expenses.projectId, projects.id))
      .where(and(eq(expenses.id, params.id), eq(projects.userId, user.id)))
      .limit(1);

    if (expense.length === 0) {
      return NextResponse.json(
        { success: false, error: "Expense not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: expense[0],
    });
  } catch (error) {
    console.error("Error fetching expense:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch expense" },
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
    const validatedData = updateExpenseSchema.parse(body);

    // Verify user owns the expense through project
    const expenseCheck = await db
      .select()
      .from(expenses)
      .leftJoin(projects, eq(expenses.projectId, projects.id))
      .where(and(eq(expenses.id, params.id), eq(projects.userId, user.id)))
      .limit(1);

    if (expenseCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: "Expense not found or access denied" },
        { status: 404 }
      );
    }

    const updatedExpense = await db
      .update(expenses)
      .set({
        ...validatedData,
        ...(validatedData.amount && {
          amount: validatedData.amount.toString(),
        }),
        ...(validatedData.date && {
          date: new Date(validatedData.date),
        }),
      })
      .where(eq(expenses.id, params.id))
      .returning();

    // Update project's updated_at timestamp
    await db
      .update(projects)
      .set({ updatedAt: new Date() })
      .where(eq(projects.id, expenseCheck[0].expenses.projectId));

    return NextResponse.json({
      success: true,
      data: updatedExpense[0],
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

    console.error("Error updating expense:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update expense" },
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

    // Verify user owns the expense through project
    const expenseCheck = await db
      .select()
      .from(expenses)
      .leftJoin(projects, eq(expenses.projectId, projects.id))
      .where(and(eq(expenses.id, params.id), eq(projects.userId, user.id)))
      .limit(1);

    if (expenseCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: "Expense not found or access denied" },
        { status: 404 }
      );
    }

    await db.delete(expenses).where(eq(expenses.id, params.id));

    // Update project's updated_at timestamp
    await db
      .update(projects)
      .set({ updatedAt: new Date() })
      .where(eq(projects.id, expenseCheck[0].expenses.projectId));

    return NextResponse.json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}