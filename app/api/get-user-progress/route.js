import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { courseProgressTable, coursesTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server"; // 🍏 Use currentUser for full profile retrieval
import { eq, and } from "drizzle-orm";

export async function GET(req) {
  try {
    // 1. Fetch the complete profile data securely from Clerk
    const user = await currentUser();
    
    if (!user || !user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized access: Invalid session" }, { status: 401 });
    }

    // Safely extract the primary email address
    const userEmail = user.primaryEmailAddress?.emailAddress || "";

    if (!userEmail) {
      console.error("❌ Clerk Error: No primary email found for authenticated user ID:", user.id);
      return NextResponse.json({ success: false, error: "No email address linked to this profile account." }, { status: 400 });
    }

    console.log(`📡 Fetching synchronized records for email: ${userEmail}`);

    // 2. Query the PostgreSQL database using Drizzle
    const userCourses = await db
      .select({
        course: coursesTable,
        progress: courseProgressTable
      })
      .from(coursesTable)
      .leftJoin(
        courseProgressTable,
        and(
          eq(courseProgressTable.courseId, coursesTable.cid),
          eq(courseProgressTable.userId, userEmail) // Matches your exam submit identification strategy
        )
      )
      .where(eq(coursesTable.userEmail, userEmail));

    // 3. Map records to calculate completion percentages
    const updatedCourses = userCourses.map(({ course, progress }) => {
      const completedCount = progress?.completedChapters?.length || 0;
      const totalChapters = course.noOfChapters || 1;
      
      const calculatedPercentage = Math.min(
        Math.round((completedCount / totalChapters) * 100), 
        100
      );

      return {
        ...course,
        progressPercent: calculatedPercentage,
        totalQuestions: progress?.totalQuestions ?? 10,
        // Set to null if missing so frontend card uses its fallback UI state cleanly
        examScore: progress?.examScore !== null && progress?.examScore !== undefined ? progress.examScore : null,
        isCompleted: progress?.isCompleted ?? false
      };
    });

    return NextResponse.json({ success: true, courses: updatedCourses });
  } catch (error) {
    console.error("🔥 Error running unified progress lookup wrapper query:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}