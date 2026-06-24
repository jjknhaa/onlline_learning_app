import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { courseProgressTable } from "@/config/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
    }

    const { courseId, chapterIndex } = await req.json();

    if (!courseId || chapterIndex === undefined) {
      return NextResponse.json({ success: false, error: "Missing required tracking parameters." }, { status: 400 });
    }

    // 1. Fetch any existing progress snapshot for this user and course
    const currentProgress = await db
      .select()
      .from(courseProgressTable)
      .where(
        and(
          eq(courseProgressTable.userId, userId),
          eq(courseProgressTable.courseId, courseId)
        )
      )
      .then((res) => res[0]);

    let completedList = [];

    if (currentProgress) {
      // Safely parse or handle existing completed chapter indices array
      completedList = Array.isArray(currentProgress.completedChapters) 
        ? currentProgress.completedChapters 
        : [];
      
      // If the chapter isn't already marked as done, append it
      if (!completedList.includes(Number(chapterIndex))) {
        completedList.push(Number(chapterIndex));
      }

      // Update the existing record tracking map
      await db
        .update(courseProgressTable)
        .set({
          completedChapters: completedList,
          updatedAt: new Date()
        })
        .where(eq(courseProgressTable.id, currentProgress.id));
    } else {
      // Create a brand new record for a freshly started course path
      completedList = [Number(chapterIndex)];
      await db.insert(courseProgressTable).values({
        userId: userId,
        courseId: courseId,
        completedChapters: completedList,
      });
    }

    return NextResponse.json({ 
      success: true, 
      completedChapters: completedList 
    });

  } catch (error) {
    console.error("❌ Failed to log chapter completions:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}