"use client";
import React, { useState } from "react";
import axios from "axios";
import { CreditCard, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { useSearchParams } from "next/navigation";

function BillingPage() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  
  const paymentStatus = searchParams.get("payment");
  const errorStatus = searchParams.get("error");

  const handleBkashCheckout = async () => {
    try {
      setLoading(true);

      // Call your newly created backend create-payment API route
      const response = await axios.post("/api/bkash/create");

      if (response.data?.success && response.data?.url) {
        // Hand off control directly to the secure bKash simulator viewport frame
        window.location.href = response.data.url;
      } else {
        alert("bKash gateway setup failed. Check server log output.");
      }
    } catch (error) {
      console.error("Failed handling client redirect:", error);
      alert("Something went wrong connecting to payment gateway routers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto mt-12 bg-white border border-gray-100 shadow-sm rounded-2xl">
      <div className="flex flex-col gap-1 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Premium Pro Access</h2>
        <p className="text-sm text-gray-400">Unlock infinite AI generations, custom tracks, and verified course tracking metrics.</p>
      </div>

      <div className="my-6 p-4 bg-purple-50/50 rounded-xl border border-purple-100/40 text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 block mb-1">One-Time Payment</span>
        <div className="text-4xl font-black text-purple-700 flex items-center justify-center gap-1">
          ৳ 500 <span className="text-sm font-normal text-gray-400">/ lifetime</span>
        </div>
      </div>

      {/* Dynamic Conditional Status Banner Blocks */}
      {paymentStatus === "success" && (
        <div className="mb-4 p-3.5 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-xl flex items-start gap-2.5 border border-emerald-100">
          <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Payment Captured!</p>
            <p className="text-emerald-700/80 mt-0.5">Your premium features have been unlocked inside your local database row.</p>
          </div>
        </div>
      )}

      {errorStatus && (
        <div className="mb-4 p-3.5 bg-rose-50 text-rose-700 text-xs font-medium rounded-xl flex items-start gap-2.5 border border-rose-100">
          <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Transaction Cancelled</p>
            <p className="text-rose-700/80 mt-0.5">The check session was aborted or failed verification parameters. No balance was deducted.</p>
          </div>
        </div>
      )}

      <button
        onClick={handleBkashCheckout}
        disabled={loading}
        className="w-full py-3.5 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-200 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-pink-100 disabled:shadow-none"
      >
        {loading ? (
          <Loader2 className="animate-spin text-gray-400" size={18} />
        ) : (
          <CreditCard size={18} />
        )}
        {loading ? "Routing to bKash..." : "Checkout with bKash"}
      </button>
    </div>
  );
}

export default BillingPage;