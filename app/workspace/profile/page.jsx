"use client";

import React, { useEffect, useState } from "react";
import { UserProfile } from "@clerk/nextjs";
import axios from "axios";
import { Shield, CreditCard, Award, CheckCircle, Loader2, User } from "lucide-react";

function ProfilePage() {
  const [dbStatus, setDbStatus] = useState({ isSubscriber: false, isTeacher: false, role: "student" });
  const [loading, setLoading] = useState(true);

  // Fetch live database status for roles and subscriptions
  useEffect(() => {
    async function getStatus() {
      try {
        const res = await axios.get("/api/user/status");
        setDbStatus(res.data);
      } catch (err) {
        console.error("Error loading account status tags:", err);
      } finally {
        setLoading(false);
      }
    }
    getStatus();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Summary section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-6 h-6 text-purple-600" /> Account Settings
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage your identity, profile picture, account access tags, and subscriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Custom Account Status Badges Display */}
        <div className="space-y-4 lg:col-span-1">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
              Account Metadata Info
            </h3>

            {loading ? (
              <div className="flex items-center gap-2 py-4">
                <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                <span className="text-xs text-gray-400">Verifying security badges...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {/* 1. System Role Badge */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-medium text-gray-700">Platform Role</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs
                    ${dbStatus.isTeacher 
                      ? "bg-amber-50 text-amber-700 border border-amber-200" 
                      : "bg-blue-50 text-blue-700 border border-blue-200"}`}
                  >
                    {dbStatus.role}
                  </span>
                </div>

                {/* 2. Platform Access tier Status */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-medium text-gray-700">Access Tier</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs
                    ${(dbStatus.isSubscriber || dbStatus.isTeacher)
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                      : "bg-gray-100 text-gray-600"}`}
                  >
                    {(dbStatus.isSubscriber || dbStatus.isTeacher) ? "Unlocked Premium" : "Free Plan"}
                  </span>
                </div>

                {/* 3. Payment Context Log tracking info */}
                {dbStatus.isSubscriber && (
                  <div className="p-3 rounded-lg bg-purple-50/50 border border-purple-100 space-y-1">
                    <div className="flex items-center gap-2 text-purple-700">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-xs font-semibold">bKash Active Subscription</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono mt-1 select-all bg-white p-1.5 rounded border border-purple-50">
                      ID: {dbStatus.subscriptionId || "Active Token Tokenized"}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium mt-1">
                      <CheckCircle className="w-3 h-3" /> Fully Verified Handshake
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Native Clerk complete editing system interface */}
        <div className="lg:col-span-2 shadow-sm rounded-xl overflow-hidden border border-gray-100 bg-white custom-clerk-profile">
          <UserProfile 
            routing="hash"
            appearance={{
              elements: {
                rootBox: "w-full max-w-none",
                cardBox: "shadow-none border-none w-full max-w-none",
                navbar: "hidden md:flex bg-gray-50/50 border-r border-gray-100 p-4",
                scrollBox: "p-4 md:p-6",
                pageScrollBox: "p-0",
                headerTitle: "text-lg font-bold text-gray-900",
                headerSubtitle: "text-xs text-gray-500",
                profileSectionTitleText: "text-sm font-semibold text-purple-700",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;