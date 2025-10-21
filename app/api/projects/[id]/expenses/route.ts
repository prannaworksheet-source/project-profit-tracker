import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { db, expenses, projects } from "@/db";
import { requireAuth } from "@/lib/middleware";
import { createExpenseSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    // Verify user owns the project
    const projectCheck = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, params.id), eq(projects.userId, user.id)))
      .limit(1);

    if (projectCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    const projectExpenses = await db
      .select()
      .from(expenses)
      .where(eq(expenses.projectId, params.id))
      .orderBy(desc(expenses.date));

    return NextResponse.json({
      success: true,
      data: projectExpenses,
    });
  } catch (error) {
    console.error("Error fetching project expenses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch project expenses" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    // Verify user owns the project
    const projectCheck = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, params.id), eq(projects.userId, user.id)))
      .limit(1);

    if (projectCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = createExpenseSchema.parse({
      ...body,
      projectId: params.id, // Override with project ID from URL
    });

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
      .where(eq(projects.id, params.id));

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

    console.error("Error creating project expense:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create project expense" },
      { status: 500 }
    );
  }
}