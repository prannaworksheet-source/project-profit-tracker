import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { db, expenses, projects } from "@/db";
import { requireAuth } from "@/lib/middleware";
import { createExpenseSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    let query = db
      .select({
        ...expenses,
        projectName: projects.name,
      })
      .from(expenses)
      .leftJoin(projects, eq(expenses.projectId, projects.id))
      .where(eq(projects.userId, user.id));

    if (projectId) {
      query = query.where(and(eq(projects.userId, user.id), eq(expenses.projectId, projectId)));
    }

    const userExpenses = await query.orderBy(desc(expenses.date));

    return NextResponse.json({
      success: true,
      data: userExpenses,
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch expenses" },
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
    const validatedData = createExpenseSchema.parse(body);

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

    const newExpense = await db
      .insert(expenses)
      .values({
        ...validatedData,
        amount: validatedData.amount.toString(),
        date: new Date(validatedData.date),
      })
      .returning();

    // Update project's updated_at timestamp
    await db
      .update(projects)
      .set({ updatedAt: new Date() })
      .where(eq(projects.id, validatedData.projectId));

    return NextResponse.json({
      success: true,
      data: newExpense[0],
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

    console.error("Error creating expense:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create expense" },
      { status: 500 }
    );
  }
}