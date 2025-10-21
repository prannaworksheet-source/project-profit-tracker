import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user, session } from "@/db";
import { eq } from "drizzle-orm";

export async function getCurrentUser(request: NextRequest) {
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    const result = await db
      .select({
        user: user,
        session: session,
      })
      .from(session)
      .innerJoin(user, eq(session.userId, user.id))
      .where(eq(session.token, sessionToken))
      .limit(1);

    if (result.length === 0 || result[0].session.expiresAt < new Date()) {
      return null;
    }

    return result[0].user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return user;
}