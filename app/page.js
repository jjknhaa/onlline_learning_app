import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center px-6">
      
      {/* User Profile Icon with Sign Out */}
      <div className="absolute top-6 right-6">
        <UserButton/>
      </div>

      {/* Welcome Card */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-10 max-w-2xl text-center text-white">
        
        <div className="flex justify-center mb-6">
          <div className="bg-white/20 p-4 rounded-full">
            <Sparkles className="w-10 h-10" />
          </div>
        </div>

        <h1 className="text-5xl font-bold mb-4">
          Welcome to Your Learning Platform
        </h1>

        <p className="text-lg text-white/80 mb-8">
          Create courses, manage your workspace, and learn smarter with AI tools.
        </p>

        <Link href="/workspace">
          <Button className="px-8 py-6 text-lg rounded-full bg-white text-purple-700 hover:bg-gray-100 shadow-lg">
            Go to Workspace
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </div>
    </main>
  );
}