import React from 'react';
import Link from 'next/link';

function ChapterSidebar({ chapters = [], courseId, activeIdx }) {
  return (
    <aside className="w-80 border-r bg-white h-full flex flex-col shadow-sm">
      {/* Header Info Area */}
      <div className="p-6 border-b">
        <Link href="/workspace" className="text-xs font-bold text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
        <h2 className="font-extrabold text-xl text-gray-900 mt-2">Course Index</h2>
        <p className="text-xs text-gray-400 mt-0.5">Track your modular learning progress</p>
      </div>

      {/* Scrollable Chapter Navigation Mapping */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5">
        {chapters.map((ch, index) => {
          const isActive = index === activeIdx;
          return (
            <Link
              key={index}
              href={`/course/${courseId}?chapter=${index}`}
              className={`flex items-start gap-3 p-3.5 rounded-xl text-sm transition-all border ${
                isActive
                  ? "bg-purple-50 border-purple-200 text-purple-700 font-semibold shadow-xs"
                  : "border-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                isActive ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="line-clamp-2 capitalize leading-snug">
                  {ch?.chapterName || ch?.title || `Chapter ${index + 1}`}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

export default ChapterSidebar;