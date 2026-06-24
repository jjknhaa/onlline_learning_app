import { 
  pgTable, 
  serial, 
  varchar, 
  integer, 
  json, 
  boolean, 
  timestamp, 
  text 
} from "drizzle-orm/pg-core";

// 1. Users Table
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  subscriptionId: varchar(),
  role: varchar({ length: 50 }).default('student').notNull() // 🍏 Handles permissions ('student' | 'teacher')
});

// 2. Courses Table
export const coursesTable = pgTable("courses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  cid: varchar().notNull(),
  name: varchar(),
  description: varchar(),
  noOfChapters: integer().notNull(),
  includeVideo: boolean().default(false),
  level: varchar().notNull(),
  category: varchar(),
  courseJson: json(),
  userEmail: varchar('userEmail').references(() => usersTable.email).notNull(),
  bannerUrl: varchar().default('/placeholder-banner.png') 
});

// 3. Chapter Content Table
export const chapterContentTable = pgTable('chapterContent', {
  id: serial('id').primaryKey(),
  courseId: varchar('courseId').notNull(),                 // Links back to coursesTable.cid
  chapterId: integer('chapterId').notNull(),                // e.g., 0 for Chapter 1, 1 for Chapter 2
  content: text('content').notNull(),                       // The massive AI-generated answers text
  videoUrl: varchar('videoUrl')                             // Optional video suggestion placeholder
});

// 4. Course Progress Table
export const courseProgressTable = pgTable("course_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),       // Clerk User ID
  courseId: varchar("course_id").notNull(),   // The unique course CID
  completedChapters: json("completed_chapters").default([]), // Array of indices: [0, 1, 2]
  isCompleted: boolean("is_completed").default(false),
  examScore: integer("exam_score").default(-1), // -1 means exam not taken yet
  totalQuestions: integer("total_questions").default(10),
  updatedAt: timestamp("updated-at").defaultNow(),
});

// 5. Course Exams Table
export const courseExamsTable = pgTable("course_exams", {
  id: serial("id").primaryKey(),
  courseId: varchar("course_id").notNull().unique(),
  questions: json("questions").notNull(),     // Holds the array of 10 generated MCQs
  createdAt: timestamp("created_at").defaultNow(),
});

// 6. Video Tutorials Table
export const tutorialsTable = pgTable("tutorials", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  description: text(),
  videoUrl: varchar().notNull(), // Stores the CDN cloud storage link (e.g., Cloudinary or S3)
  chapterId: integer().default(0),
  uploadedBy: varchar().references(() => usersTable.email).notNull(), // Links directly to the uploading teacher
  createdAt: timestamp("created_at").defaultNow()
});