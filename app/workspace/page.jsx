import React from "react";
import WelcomeBanner from "./_components/WelcomeBanner";
import CourseList from "./_components/CourseList";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { eq, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

async function Workspace() {
  // 1. Get the authenticated user's email
  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  let initialCourses = [];
  
  if (userEmail) {
    // 2. Fetch courses belonging to the user, sorting latest first
    initialCourses = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.userEmail, userEmail))
      .orderBy(desc(coursesTable.id)); // Shows your newest creations first!
  }

  return (
    <div className="p-10">
      <WelcomeBanner />
      {/* 3. Send data down to the Client Component */}
      <CourseList initialCourses={initialCourses} />
    </div>
  );
}

export default Workspace;