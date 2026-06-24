"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2, CheckCircle2 } from 'lucide-react';
import Markdown from 'react-markdown'; 

function ContentDisplay({ chapter, chapterIndex, totalChapters, courseId }) {
  const [loading, setLoading] = useState(false);
  const [dbContent, setDbContent] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (chapter) {
      fetchOrGenerateChapterContent();
    }
  }, [chapter, chapterIndex]);

  const fetchOrGenerateChapterContent = async () => {
    setLoading(true);
    setDbContent("");
    try {
      // FIX: Robust property normalization to guarantee backend strings are never undefined
      const targetChapterName = chapter?.chapterName || chapter?.chapter_name || chapter?.title || `Chapter ${chapterIndex + 1}`;
      const targetTopicDetails = chapter?.topics || chapter?.subtopics || chapter?.content || [];

      const response = await axios.post('/api/get-chapter-content', {
        courseId: courseId,
        chapterIndex: Number(chapterIndex),
        chapterName: targetChapterName,
        topicDetails: targetTopicDetails
      });

      if (response.data?.success) {
        // Handle cases where SQL layers return wrapped arrays or standalone object sets
        const contentPayload = response.data.data;
        setDbContent(typeof contentPayload === 'object' ? contentPayload.content : contentPayload);
      }
    } catch (error) {
      console.error("Error loading chapter contents:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handles pushing chapter completion milestones to backend
  const handleChapterCompletion = async (targetRoute) => {
    try {
      await axios.post('/api/update-chapter-progress', {
        courseId: courseId,
        chapterIndex: chapterIndex
      });
    } catch (error) {
      console.error("Failed to sync structural completion records:", error);
    } finally {
      // Seamlessly advance the user to the destination view
      router.push(targetRoute);
    }
  };

  if (!chapter) {
    return (
      <div className="flex items-center justify-center h-64 border border-dashed rounded-2xl bg-gray-50/50 text-gray-400 font-medium">
        Select a chapter from the sidebar menu to begin learning.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-full justify-between">
      <div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider bg-purple-50 px-2.5 py-1 rounded-md inline-block">
            Module {chapterIndex + 1} of {totalChapters}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
            <CheckCircle2 size={14} /> Auto-saves Progress
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center my-20 gap-3">
            <Loader2 className="animate-spin text-purple-600" size={36} />
            <p className="text-sm text-gray-500 font-medium animate-pulse">
              AI is writing out full lessons, explanations, and answers...
            </p>
          </div>
        ) : (
          <div className="prose prose-purple max-w-none mt-6 bg-white border border-gray-100 p-6 rounded-xl shadow-xs text-sm leading-relaxed text-gray-800">
            <Markdown>{dbContent}</Markdown>
          </div>
        )}
      </div>

      {/* Foot Navigation Controls */}
      <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-100">
        {chapterIndex > 0 ? (
          <Link
            href={`/course/${courseId}?chapter=${chapterIndex - 1}`}
            className="border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all text-gray-700"
          >
            ← Previous Chapter
          </Link>
        ) : (
          <div />
        )}

        {chapterIndex < totalChapters - 1 ? (
          <button
            onClick={() => handleChapterCompletion(`/course/${courseId}?chapter=${chapterIndex + 1}`)}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-xs cursor-pointer"
          >
            Next Chapter →
          </button>
        ) : (
          <button
            onClick={() => handleChapterCompletion(`/course/${courseId}/exam`)}
            className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-all shadow-xs cursor-pointer animate-bounce"
          >
            Take Final Exam 🎉
          </button>
        )}
      </div>
    </div>
  );
}

export default ContentDisplay;