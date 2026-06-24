import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, email } = body;

        console.log("Received in API:", { name, email });

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Check if user exists
        const existingUsers = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email));

        if (existingUsers.length === 0) {
            // Insert new user
            const result = await db.insert(usersTable).values({
                name: name || "Unnamed User",
                email: email,
            });

            console.log("✅ New user created:", result);
            return NextResponse.json({ 
                success: true, 
                message: "User created successfully",
                data: result 
            });
        } 

        // User already exists
        console.log("User already exists:", existingUsers[0]);
        return NextResponse.json(existingUsers[0]);

    } catch (error) {
        console.error("❌ API Error:", error);
        return NextResponse.json({ 
            error: "Internal server error",
            message: error.message 
        }, { status: 500 });
    }
}