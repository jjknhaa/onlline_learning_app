import React from 'react';
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ChapterSidebar from "./_components/ChapterSidebar";
import ContentDisplay from "./_components/ContentDisplay";

// Next.js dynamic routing extracts URL parameters cleanly
async function CourseViewPage({ params, searchParams }) {
  // Resolve both dynamic route params and URL search queries
  const { courseId } = await params;
  const resolvedSearchParams = await searchParams;
  
  // Pick active chapter index from URL query parameter '?chapter=X', fallback to index 0
  const activeChapterIndex = Number(resolvedSearchParams?.chapter || 0);

  // 1. Fetch specific course by its unique client UUID string
  const courseRecord = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.cid, courseId))
    .then(res => res[0]);

  // If no matching course layout is found in PostgreSQL, throw a clean 404
  if (!courseRecord) {
    return notFound();
  }

  // 2. Extract curriculum JSON object safely from database row
  const rawData = courseRecord.courseJson;
  const courseData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
  const chapters = courseData?.chapters || [];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Left-Side Navigation */}
      <ChapterSidebar 
        chapters={chapters} 
        courseId={courseId} 
        activeIdx={activeChapterIndex} 
      />

      {/* Main Screen Content Display */}
      <main className="flex-1 overflow-y-auto p-8 md:p-12">
        <ContentDisplay 
          chapter={chapters[activeChapterIndex]} 
          chapterIndex={activeChapterIndex}
          totalChapters={chapters.length}
          courseId={courseId}
        />
      </main>
    </div>
  );
}

// Make absolutely certain this line matches exactly:
export default CourseViewPage;