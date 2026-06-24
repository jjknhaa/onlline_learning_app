import { db } from "@/config/db";
import { tutorialsTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // 1. Get the authenticated teacher session from Clerk
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress;

    // 2. Parse the client form data
    const { title, description, videoUrl, chapterId } = await req.json();

    if (!title || !videoUrl) {
      return NextResponse.json({ error: "Missing required video parameters" }, { status: 400 });
    }

    // 3. Insert record row straight into your Drizzle Postgres Table
    const [newVideo] = await db
      .insert(tutorialsTable)
      .values({
        title,
        description,
        videoUrl,
        chapterId: parseInt(chapterId) || 0,
        uploadedBy: email,
      })
      .returning();

    // Return the clean data record directly back to our UI list state tracking arrays
    return NextResponse.json({ success: true, data: newVideo });
  } catch (error) {
    console.error("❌ Database Video Creation Error:", error);
    return NextResponse.json(
      { error: "Failed to write asset record to Neon database cluster" },
      { status: 500 }
    );
  }
}