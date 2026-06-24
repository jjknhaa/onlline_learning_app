import React from "react";
import { UserButton } from "@clerk/nextjs";

function WelcomeBanner() {
  return (
    <div className="relative p-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl shadow-xl">
      
      {/* Top Right User Button */}
      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-1 rounded-full border border-white/30 shadow-lg hover:scale-110 transition-all duration-300">
        <UserButton afterSignOutUrl="/" />
      </div>

      <h2 className="font-bold text-3xl mb-3">
        Welcome to Learning Platform
      </h2>

      <p className="text-lg text-white/90">
        Learn, Create and Explore your favourite courses
      </p>
    </div>
  );
}

export default WelcomeBanner;