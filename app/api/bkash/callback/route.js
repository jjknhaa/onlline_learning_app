import { NextResponse } from "next/server";
import axios from "axios";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema"; // 👈 FIXED: Changed userTable to usersTable
import { like } from "drizzle-orm";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentID = searchParams.get("paymentID");
    const status = searchParams.get("status");

    if (status !== "success") {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/workspace/billing?error=payment_failed`);
    }

    // 1. Renew validation state token
    const authResponse = await axios.post(
      "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant",
      {
        app_key: process.env.BKASH_APP_KEY,
        app_secret: process.env.BKASH_APP_SECRET,
      },
      {
        headers: {
          username: process.env.BKASH_USERNAME,
          password: process.env.BKASH_PASSWORD,
        },
      }
    );

    const idToken = authResponse.data?.id_token;

    // 2. Finalize dynamic balance deduction transfer execution
    const executeResponse = await axios.post(
      "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/execute",
      { paymentID },
      {
        headers: {
          Authorization: idToken,
          "X-APP-Key": process.env.BKASH_APP_KEY,
        },
      }
    );

    if (executeResponse.data?.transactionStatus === "Completed") {
      const cleanRef = executeResponse.data.payerReference;
      const txId = executeResponse.data.trxID; 

      console.log(`🍏 Dynamically updating subscription status for base string matching reference user username: ${cleanRef}`);

      // Update database profile row with premium access string
      await db
        .update(usersTable) // 👈 FIXED: Changed userTable to usersTable
        .set({ subscriptionId: `bkash_${txId}` }) 
        .where(like(usersTable.email, `${cleanRef}%`)); // 👈 FIXED: Changed userTable to usersTable

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/workspace/billing?payment=success`);
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/workspace/billing?error=verification_failed`);
  } catch (error) {
    console.error("🔥 Dynamic Verification Callback Error:", error.response?.data || error.message);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/workspace/billing?error=fatal_error`);
  }
}