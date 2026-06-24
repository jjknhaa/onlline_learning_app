import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { courseProgressTable } from "@/config/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req) {
  try {
    const body = await req.json();
    
    // 🔍 This will print EXACTLY what parameters are arriving in your terminal logs
    console.log("📥 RECEIVED IN UPDATE-EXAM-SCORE API:", body);

    const { courseId, userId, score, totalQuestions } = body;

    // Softened fallback check to pinpoint the missing key
    if (!courseId || !userId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Validation Error", 
          received: { courseId: courseId || "MISSING", userId: userId || "MISSING" } 
        },
        { status: 400 }
      );
    }

    // Update matching user progress parameters
    const updatedRecord = await db
      .update(courseProgressTable)
      .set({
        examScore: score,
        totalQuestions: totalQuestions || 10,
        isCompleted: true,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(courseProgressTable.courseId, courseId),
          eq(courseProgressTable.userId, userId)
        )
      )
      .returning();

    // If a tracking row wasn't present, safely insert it dynamically
    if (updatedRecord.length === 0) {
      console.log("⚠️ No existing progress entry found. Creating fallback status record row.");
      await db.insert(courseProgressTable).values({
        userId,
        courseId,
        examScore: score,
        totalQuestions: totalQuestions || 10,
        isCompleted: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Permanent evaluation score metrics updated successfully."
    });

  } catch (error) {
    console.error("🔥 Score Updater Error Tracking Pipeline Failure:", error);
    return NextResponse.json(
      { success: false, message: "Internal update error", error: error.message },
      { status: 500 }
    );
  }
}