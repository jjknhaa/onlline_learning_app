import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { chapterContentTable } from "@/config/schema";
import { GoogleGenAI } from "@google/genai";
import { and, eq } from "drizzle-orm";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req) {
  try {
    const { courseId, chapterIndex, chapterName, topicDetails } = await req.json();

    // Relaxed check: Only enforce courseId and chapterIndex to avoid breaking on initial client load
    if (!courseId || chapterIndex === undefined) {
      return NextResponse.json({ success: false, error: "Missing mandatory payload fields: courseId or chapterIndex." }, { status: 400 });
    }

    // Cache Optimization Layer
    const existingContent = await db
      .select()
      .from(chapterContentTable)
      .where(and(eq(chapterContentTable.courseId, courseId), eq(chapterContentTable.chapterId, Number(chapterIndex))))
      .then((res) => res[0]);

    if (existingContent) {
      console.log(`🤖 Content Cache Hit for Chapter ${chapterIndex}!`);
      return NextResponse.json({ success: true, data: existingContent });
    }

    const fallbackChapterName = chapterName || `Chapter ${Number(chapterIndex) + 1}`;
    console.log(`✨ Cache Miss. Requesting Gemini 2.5 to generate material for: ${fallbackChapterName}`);

    const prompt = `
      You are an expert tutor. Write a comprehensive, highly detailed textbook-style guide for the following chapter: "${fallbackChapterName}".
      Focus intensely on teaching these subtopics and completely breaking down any concepts or answers:
      ${topicDetails ? JSON.stringify(topicDetails) : 'General curriculum objectives for this chapter segment.'}

      CRITICAL REQUIREMENTS:
      - Provide full explanations, complete clear answers, detailed examples, and fully written functional code blocks.
      - Format your output strictly in clean Markdown format with subheadings (##, ###), bullet points, and code blocks.
    `;

    // ⚡ 2.5 Flash execution track with automated backoff retries
    let aiResponse;
    let attempts = 4; 
    let currentDelay = 12000; // Start with 12 seconds to clear free tier limitations safely

    while (attempts > 0) {
      try {
        aiResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash", 
          contents: prompt,
        });
        break; 
      } catch (geminiError) {
        attempts--;
        if ((geminiError.status === 503 || geminiError.status === 429) && attempts > 0) {
          console.warn(`⚠️ Free tier limits hit (${geminiError.status}). Retrying in ${currentDelay / 1000}s...`);
          await new Promise((resolve) => setTimeout(resolve, currentDelay));
          currentDelay *= 2; 
        } else {
          throw geminiError; 
        }
      }
    }

    // FIX: Parse text out deeply using correct candidate indexing properties
    const generatedMarkdownText = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || aiResponse.text;
    
    if (!generatedMarkdownText) {
      throw new Error("Gemini returned an empty response layout.");
    }

    const insertedRow = await db.insert(chapterContentTable).values({
      courseId: courseId,
      chapterId: Number(chapterIndex),
      content: generatedMarkdownText,
    }).returning();

    return NextResponse.json({ success: true, data: insertedRow[0] });

  } catch (error) {
    console.error("❌ Failed to generate chapter content:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}