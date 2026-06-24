"use client"
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useUser } from '@clerk/nextjs'; 
import { Loader2, CheckCircle2, AlertTriangle, ArrowRight, Award, RefreshCw } from 'lucide-react';

function CourseExamPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const { user } = useUser(); 
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [examFinished, setExamFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    if (courseId) {
      loadOrCreateExam();
    }
  }, [courseId]);

  const loadOrCreateExam = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const examResponse = await axios.post('/api/get-course-exam', {
        courseId: courseId,
        courseName: "Your Generated Course Track", 
        courseLayout: [] 
      });

      if (examResponse.data?.success) {
        setQuestions(examResponse.data.questions || []);
      } else {
        throw new Error("Backend response marked success as false");
      }
    } catch (error) {
      console.error("Failed compiling hyper-focused final evaluation tracking metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (optionString) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;
    
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.questionId]: optionString
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitExam = async () => {
    setSubmitting(true);
    try {
      let correctCount = 0;
      questions.forEach((q) => {
        if (selectedAnswers[q.questionId] === q.correctAnswer) {
          correctCount++;
        }
      });

      const userIdentifier = user?.primaryEmailAddress?.emailAddress;

      if (!userIdentifier) {
        alert("Authentication error: Could not verify your profile email.");
        return;
      }

      const response = await axios.post('/api/update-exam-score', {
        courseId: courseId,
        userId: userIdentifier, 
        score: correctCount,
        totalQuestions: questions.length
      });

      if (response.data?.success) {
        setFinalScore(correctCount);
        setExamFinished(true);
      }
    } catch (error) {
      console.error("Failed updating permanent user dashboard records status row:", error);
      alert("Something went wrong saving your score. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50/50 gap-4">
        <Loader2 className="animate-spin text-purple-600" size={44} />
        <div className="text-center">
          <h3 className="text-base font-semibold text-gray-800">Analyzing Your Stored Chapters...</h3>
          <p className="text-xs text-gray-400 max-w-xs mt-0.5">Gemini is gathering your exact database course text to compile custom matching questions.</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50/50 p-6 text-center">
        <AlertTriangle className="text-amber-500 mb-2" size={40} />
        <h3 className="text-base font-bold text-gray-800">Exam Blueprint Out of Sync</h3>
        <p className="text-xs text-gray-500 max-w-sm mt-1">We couldn't parse structured questions directly tied to your database topics. Let's try re-reading the data matrix track.</p>
        <button onClick={loadOrCreateExam} className="mt-4 flex items-center gap-2 border px-4 py-2 text-xs font-semibold rounded-lg bg-white shadow-xs hover:bg-gray-50 cursor-pointer">
          <RefreshCw size={14} /> Retry Mapping Stored Data
        </button>
      </div>
    );
  }

  if (examFinished) {
    const passed = finalScore >= 5;
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-gray-100 rounded-2xl shadow-md p-8 text-center flex flex-col items-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${passed ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'} mb-4`}>
            <Award size={36} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Complete!</h1>
          <p className="text-sm text-gray-500 mt-1">Based directly on your generated module materials:</p>
          
          <div className="my-6 px-6 py-4 bg-gray-50 border border-gray-100/80 rounded-xl w-full">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Final Score</span>
            <h2 className="text-4xl font-black text-gray-800 mt-1">
              {finalScore} <span className="text-xl text-gray-400 font-medium">/ 10</span>
            </h2>
            <p className={`text-xs font-semibold mt-2 ${passed ? 'text-emerald-600' : 'text-amber-600'}`}>
              {passed ? "🎉 Dynamic Track Successfully Verified!" : "⚠️ Review your material and try again to score 50% or above."}
            </p>
          </div>

          <button 
            onClick={() => router.push('/workspace/my-courses')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors cursor-pointer shadow-xs"
          >
            Return to Dashboard Layout
          </button>
        </div>
      </div>
    );
  }

  // FIX: Added optional chaining fallbacks to safeguard render processing loops
  const currentQuestion = questions[currentQuestionIndex] || {};
  const userSelectedChoice = currentQuestion.questionId ? selectedAnswers[currentQuestion.questionId] : undefined;
  const optionsList = currentQuestion.options || [];

  return (
    <div className="min-h-screen bg-gray-50/40 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
        
        <div className="bg-purple-600 px-6 py-4 text-white flex justify-between items-center">
          <div>
            <h2 className="font-bold text-base leading-tight">Course Content Examination</h2>
            <p className="text-xs text-purple-100/90 mt-0.5">Questions are generated strictly from your studied chapters text.</p>
          </div>
          <span className="text-xs font-bold bg-purple-700 border border-purple-400/30 px-3 py-1.5 rounded-lg tracking-wider">
            QUESTION {currentQuestionIndex + 1} OF {questions.length}
          </span>
        </div>

        <div className="p-6">
          <h3 className="font-semibold text-gray-800 text-base leading-snug mb-5">
            {currentQuestion.questionText || "Loading assessment prompt..."}
          </h3>

          <div className="flex flex-col gap-3">
            {optionsList.map((option, idx) => {
              const isSelected = userSelectedChoice === option;
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all cursor-pointer flex items-center justify-between group
                    ${isSelected 
                      ? 'border-purple-600 bg-purple-50/60 font-medium text-purple-900 shadow-xs' 
                      : 'border-gray-200 hover:bg-gray-50/80 text-gray-700'
                    }`}
                >
                  <span>{option}</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors
                    ${isSelected ? 'border-purple-600 bg-purple-600 text-white' : 'border-gray-300 group-hover:border-gray-400'}`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <button
            disabled={currentQuestionIndex === 0 || submitting}
            onClick={handlePrevious}
            className="px-4 py-2 border rounded-lg text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            ← Previous
          </button>

          {currentQuestionIndex < questions.length - 1 ? (
            <button
              disabled={!userSelectedChoice}
              onClick={handleNext}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition-all disabled:bg-purple-300 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer shadow-xs"
            >
              Next Question <ArrowRight size={14} />
            </button>
          ) : (
            <button
              disabled={Object.keys(selectedAnswers).length < questions.length || submitting}
              onClick={handleSubmitExam}
              className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all disabled:bg-emerald-300 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={14} /> Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} /> Submit Final Assessment
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default CourseExamPage;