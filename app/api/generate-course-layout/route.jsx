import { coursesTable } from "@/config/schema";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { db } from "@/config/db"; 
import { currentUser } from "@clerk/nextjs/server";
import crypto from "crypto";

const bannerMapping = {
  coding: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
  programming: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
  math: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop",
  mathematics: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop",
  physics: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
  science: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
  history: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=1200&auto=format&fit=crop",
  business: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
  marketing: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
  design: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=1200&auto=format&fit=crop",
  art: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=1200&auto=format&fit=crop",
};

export async function POST(req) {
  try {
    console.log("--- STARTING COURSE GENERATION API ---");

    // 1. Clerk Authentication
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      console.log("Error: User session not authenticated via Clerk");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch body
    const formData = await req.json(); 
    console.log("Form data parsed correctly:", formData);

    // 3. Setup Gemini Text prompt
    const dynamicPrompt = `
      Create a comprehensive course curriculum based on these parameters:
      Title: ${formData.name}
      Description: ${formData.description || 'Not provided'}
      Chapters: ${formData.noOfChapters}
      Level: ${formData.level}
      Categories: ${formData.category}

      Return strictly a valid JSON object string with keys: "courseTitle", "description", and an array of "chapters".
    `;

    console.log("Sending prompt to Gemini... Please hold...");
    
    // 4. Fire Gemini call with correct SDK layout & automatic backoff retries
    let response;
    let attempts = 4;
    let currentDelay = 12000; // 12 seconds delay to back off properly from 429 errors

    while (attempts > 0) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash', 
          config: { responseMimeType: 'application/json' },
          contents: [{ role: 'user', parts: [{ text: dynamicPrompt }] }],
        });
        break; // Success! Break out of the loop safely
      } catch (geminiError) {
        attempts--;
        if ((geminiError.status === 503 || geminiError.status === 429) && attempts > 0) {
          console.warn(`⚠️ Upstream engine busy (${geminiError.status}). Sleeping connection for ${currentDelay / 1000} seconds... (${attempts} remaining)`);
          await new Promise((resolve) => setTimeout(resolve, currentDelay));
          currentDelay *= 2; // Increase delay length exponentially
        } else {
          throw geminiError; 
        }
      }
    }

    console.log("Gemini responded successfully!");
    
    // FIX: Access text deeply using the correct SDK candidate schema mapping
    const jsonText = response.candidates?.[0]?.content?.parts?.[0]?.text || response.text;
    if (!jsonText) {
      throw new Error("Gemini returned an empty response string.");
    }

    const parsedCourseJson = JSON.parse(jsonText);

    // 5. Compute dynamic image map path
    const selectedCategory = String(formData.category || "").toLowerCase().trim();
    const finalBannerUrl = bannerMapping[selectedCategory] || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop";
    console.log("Selected banner string target url:", finalBannerUrl);

    // 6. DB Safe Insertion Layer
    console.log("Attempting database save query row execution...");
    let result;
    try {
      result = await db.insert(coursesTable).values({
        cid: crypto.randomUUID(),
        name: formData.name,
        description: formData.description || 'Not provided',
        category: formData.category,
        level: formData.level,
        includeVideo: formData.includeVideo || false,
        noOfChapters: Number(formData.noOfChapters) || 1,
        courseJson: parsedCourseJson, 
        bannerUrl: finalBannerUrl, 
        userEmail: userEmail,
      }).returning();
      console.log("Database write verified successful!");
    } catch (dbError) {
      console.error("CRITICAL DATABASE INSERT FAIL:", dbError.message);
      return NextResponse.json({ 
        error: "Database insertion failure. Check if database schema column is fully pushed.", 
        details: dbError.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    console.error("GENERAL API ROUTE MAIN ERROR CRASH:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}