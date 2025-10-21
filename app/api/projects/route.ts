import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { db, projects } from "@/db";
import { requireAuth } from "@/lib/middleware";
import { createProjectSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, user.id))
      .orderBy(desc(projects.updatedAt));

    return NextResponse.json({
      success: true,
      data: userProjects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch projects" },
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
    const validatedData = createProjectSchema.parse(body);

    const newProject = await db
      .insert(projects)
      .values({
        ...validatedData,
        initialBudget: validatedData.initialBudget.toString(),
        userId: user.id,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newProject[0],
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

    console.error("Error creating project:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create project" },
      { status: 500 }
    );
  }
}