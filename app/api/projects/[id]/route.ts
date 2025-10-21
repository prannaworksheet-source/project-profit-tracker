import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db, projects } from "@/db";
import { requireAuth } from "@/lib/middleware";
import { updateProjectSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    const project = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, params.id), eq(projects.userId, user.id)))
      .limit(1);

    if (project.length === 0) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project[0],
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch project" },
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
    const validatedData = updateProjectSchema.parse(body);

    const existingProject = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, params.id), eq(projects.userId, user.id)))
      .limit(1);

    if (existingProject.length === 0) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    const updatedProject = await db
      .update(projects)
      .set({
        ...validatedData,
        ...(validatedData.initialBudget && {
          initialBudget: validatedData.initialBudget.toString(),
        }),
        updatedAt: new Date(),
      })
      .where(and(eq(projects.id, params.id), eq(projects.userId, user.id)))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedProject[0],
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

    console.error("Error updating project:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update project" },
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

    const existingProject = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, params.id), eq(projects.userId, user.id)))
      .limit(1);

    if (existingProject.length === 0) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    await db
      .delete(projects)
      .where(and(eq(projects.id, params.id), eq(projects.userId, user.id)));

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete project" },
      { status: 500 }
    );
  }
}