import { NextResponse } from "next/server";
import axios from "axios";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req) {
  try {
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized user session" }, { status: 401 });
    }

    // Standard character cleanup for bKash safety limits
    const safePayerReference = userEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").substring(0, 15);

    console.log("---------------- bKash Tokenized Handshake ----------------");
    console.log("📧 Target User Email:", userEmail);

    // 1. Request dynamic access token from Tokenized Endpoint
    let authResponse;
    try {
      authResponse = await axios.post(
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
    } catch (authError) {
      console.error("❌ Tokenized Auth Failed:", authError.response?.data || authError.message);
      return NextResponse.json({ success: false, error: "Gateway Handshake Blocked" }, { status: 400 });
    }

    const idToken = authResponse.data?.id_token;

    if (!idToken) {
      console.error("❌ Token parsed successfully but returned empty body response.", authResponse.data);
      return NextResponse.json({ success: false, error: "Empty Access Payload" }, { status: 400 });
    }

    // 2. Generate Payment Page Session Link
    const paymentResponse = await axios.post(
      "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create",
      {
        mode: "0011", 
        payerReference: safePayerReference,
        callbackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/bkash/callback`,
        amount: "500", 
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: "INV" + Math.floor(Math.random() * 10000000) // bKash Tokenized requires a unique invoice string
      },
      {
        headers: {
          Authorization: idToken,
          "X-APP-Key": process.env.BKASH_APP_KEY,
        },
      }
    );

    if (paymentResponse.data && paymentResponse.data.bkashURL) {
      console.log("🍏 Gateway initialized successfully. Redirect URL built:", paymentResponse.data.bkashURL);
      return NextResponse.json({ success: true, url: paymentResponse.data.bkashURL });
    }

    console.error("❌ Payment confirmation validation error:", paymentResponse.data);
    return NextResponse.json({ success: false, error: "Payment initiation structural issue" }, { status: 400 });

  } catch (error) {
    console.error("🔥 Global System Error Exception:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}