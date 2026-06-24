import { db } from "@/config/db";
import { tutorialsTable } from "@/config/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Select all video rows, ordering newest uploads first
    const data = await db
      .select()
      .from(tutorialsTable)
      .orderBy(desc(tutorialsTable.id));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("❌ Database Video List Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load tutorials" },
      { status: 500 }
    );
  }
}