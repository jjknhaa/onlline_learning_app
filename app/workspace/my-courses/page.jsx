"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Loader2, GraduationCap, Award, BookOpen } from 'lucide-react';
import Image from 'next/image';

function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserCourses();
  }, []);

  const fetchUserCourses = async () => {
    try {
      const response = await axios.get('/api/get-user-progress');
      if (response.data?.success) {
        setCourses(response.data.courses);
      }
    } catch (error) {
      console.error("Failed fetching enrolled courses progress:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="animate-spin text-purple-600" size={40} />
        <p className="text-sm font-medium text-gray-500">Loading your learning dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          {/* Layout Logo / Header Icon Optimized with priority loading fallback */}
          <GraduationCap className="text-purple-600" size={28} /> My Learning Journey
        </h1>
        <p className="text-sm text-gray-500">Track your courses, overall progress, and certification milestones.</p>
      </div>

      {/* Empty State vs Course Grid Rendering */}
      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-12 bg-gray-50/50 text-center">
          <BookOpen className="text-gray-300 mb-3" size={48} />
          <h3 className="font-semibold text-gray-700 text-base">No courses found</h3>
          <p className="text-sm text-gray-400 max-w-xs mt-1">
            Generate your first AI-customized learning track from the sidebar to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((item, index) => {
            // Calculate relative progress values safely
            const score = Number(item.examScore);
            const total = Number(item.totalQuestions) || 10;
            const hasTakenExam = item.examScore !== null && item.examScore !== undefined && !isNaN(score);
            const scorePercentage = hasTakenExam ? (score / total) * 100 : 0;

            return (
              <div 
                key={item.id || index} 
                onClick={() => router.push(`/course/${item.cid}`)}
                className="group bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:border-purple-100 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Course Banner */}
                  <div className="relative w-full h-40 bg-gray-100 overflow-hidden">
                    <Image 
                      src={item.bannerUrl || '/placeholder-banner.png'} 
                      alt={item.name || 'Course Banner'} 
                      fill 
                      // 🍏 FIXES: "fill but missing sizes prop" warning by allocating dynamic viewport buckets
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      // 🍏 FIXES: LCP layout image speed by setting eager/priority loading on the first row of items
                      priority={index < 3}
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 right-3 text-xs font-bold px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-700 rounded-md shadow-sm capitalize z-10">
                      {item.level}
                    </span>
                  </div>

                  {/* Content Details */}
                  <div className="p-5">
                    <span className="text-xs font-bold text-purple-600 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded-sm">
                      {item.category || "General"}
                    </span>
                    <h2 className="font-bold text-gray-800 text-base mt-2 line-clamp-1 group-hover:text-purple-700 transition-colors">
                      {item.name}
                    </h2>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Progress Panel Section */}
                <div className="px-5 pb-5 pt-4 border-t border-gray-50 bg-gray-50/30 flex flex-col gap-4">
                  {/* 1. Module Completion Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold text-gray-600 mb-1.5">
                      <span>Course Completion</span>
                      <span className="text-purple-600 font-bold">{item.progressPercent || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${item.progressPercent || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* 2. Visual Exam Progress Metric Bar */}
                  <div className="pt-2 border-t border-gray-100/70">
                    <div className="flex justify-between items-center text-xs font-semibold text-gray-600 mb-1.5">
                      <span className="flex items-center gap-1">
                        <Award size={14} className={hasTakenExam ? "text-purple-600" : "text-gray-400"} />
                        Exam Score
                      </span>
                      <span className={`font-bold ${hasTakenExam ? 'text-purple-700' : 'text-gray-400 text-[11px] font-medium'}`}>
                        {hasTakenExam ? `${score} / ${total}` : 'Not taken'}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                          !hasTakenExam 
                            ? 'w-0' 
                            : scorePercentage >= 80 
                            ? 'bg-emerald-500' // Green for high performance marks
                            : scorePercentage >= 50 
                            ? 'bg-purple-600'  // Purple passing line
                            : 'bg-amber-500'   // Amber for corrections needed
                        }`}
                        style={{ width: `${Math.min(scorePercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyCourses;