import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ isSubscriber: false, isTeacher: false }, { status: 401 });
    }

    // Lookup user in DB
    const dbUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, userEmail))
      .limit(1);

    if (dbUser.length === 0) {
      return NextResponse.json({ isSubscriber: false, isTeacher: false });
    }

    const userData = dbUser[0];

    return NextResponse.json({
      isSubscriber: userData.subscriptionId !== null,
      isTeacher: userData.role === 'teacher',
      role: userData.role
    });
    
  } catch (error) {
    console.error("🔥 Error fetching user permissions status:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}