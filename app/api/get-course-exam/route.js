import { NextResponse } from "next/server";
import { db } from "@/config/db"; 
import { courseExamsTable, chapterContentTable } from "@/config/schema"; 
import { eq } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY });

export async function POST(req) {
  try {
    const { courseId, courseName, courseLayout } = await req.json();

    if (!courseId) {
      return NextResponse.json({ success: false, message: "Missing required field: courseId" }, { status: 400 });
    }

    // 1. Check if an exam already exists for this course to avoid unnecessary AI re-generation
    const existingExam = await db
      .select()
      .from(courseExamsTable)
      .where(eq(courseExamsTable.courseId, courseId))
      .limit(1);

    if (existingExam.length > 0) {
      return NextResponse.json({
        success: true,
        questions: typeof existingExam[0].questions === "string" 
          ? JSON.parse(existingExam[0].questions) 
          : existingExam[0].questions
      });
    }

    // 2. Fetch the real deep-dive material generated for this course
    const realChapterContentList = await db
      .select()
      .from(chapterContentTable) 
      .where(eq(chapterContentTable.courseId, courseId)); 

    // Compile the database chapters text into a compact context block for the AI model
    let robustCourseMaterialContext = "";
    if (realChapterContentList && realChapterContentList.length > 0) {
      robustCourseMaterialContext = realChapterContentList
        .map((ch, index) => `--- CHAPTER ${index + 1}: ${ch.content || ""}`)
        .join("\n\n");
    } else {
      // Fallback to structural layout strings if chapters content hasn't been accessed yet
      robustCourseMaterialContext = typeof courseLayout === "string" ? courseLayout : JSON.stringify(courseLayout);
    }

    // 3. Setup the strict prompt enforcing questions are ONLY from the context text
    const prompt = `
      You are an expert examination processor. You are writing an exam for students on a course titled "${courseName}".
      Here is the exact study material context:
      =========================================
      ${robustCourseMaterialContext.substring(0, 12000)} 
      =========================================

      CRITICAL RELEVANCE RULE:
      Generate exactly 10 multiple-choice questions (MCQs) strictly sourced from the provided material above.

      Return strictly a valid JSON array matching this template:
      [
        {
          "questionId": "q1",
          "questionText": "Question?",
          "options": ["Choice 1", "Choice 2", "Choice 3", "Choice 4"],
          "correctAnswer": "Choice 1"
        }
      ]
    `;

    // 4. Generate content using Gemini 2.5 Flash with backoff retries & JSON enforcement
    let aiResponse;
    let attempts = 4; 
    let currentDelay = 12000; // Start with 12 seconds to clear the 5 requests/min rule

    while (attempts > 0) {
      try {
        aiResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash", 
          config: { responseMimeType: "application/json" }, 
          contents: prompt,
        });
        break; // Success! Break out of the loop safely
      } catch (geminiError) {
        attempts--;
        if ((geminiError.status === 503 || geminiError.status === 429) && attempts > 0) {
          console.warn(`⚠️ Exam engine busy or rate-limited (${geminiError.status}). Retrying in ${currentDelay / 1000}s...`);
          await new Promise((resolve) => setTimeout(resolve, currentDelay));
          currentDelay *= 2; // Double the wait duration for the next retry attempt
        } else {
          throw geminiError; 
        }
      }
    }

    // FIX: Extracting response text accurately using the new @google/genai schema layout
    const jsonText = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || aiResponse.text;
    
    if (!jsonText) {
      throw new Error("Gemini returned an empty or unparsable response.");
    }

    const parsedQuestions = JSON.parse(jsonText);

    // 5. Cache the generated questions into your database
    await db.insert(courseExamsTable).values({
      courseId: courseId,
      questions: JSON.stringify(parsedQuestions)
    });

    return NextResponse.json({ success: true, questions: parsedQuestions });

  } catch (error) {
    console.error("🔥 Strict Exam Builder Failure:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}