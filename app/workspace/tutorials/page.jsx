"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Video, Plus, Film, Loader2, User, Clock } from "lucide-react";
import VideoUploadZone from "../_components/VideoUploadZone"; // 🍏 Safe relative import from your _components folder

function TutorialsPage() {
  const [videos, setVideos] = useState([]);
  const [isTeacher, setIsTeacher] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState(""); // Managed cleanly via your upload zone component callbacks
  const [chapterId, setChapterId] = useState("0");

  useEffect(() => {
    async function initPage() {
      try {
        setLoading(true);
        // Force fetch fresh states from server pools to handle role switching cleanly
        const [statusRes, videosRes] = await Promise.all([
          axios.get("/api/user/status"),
          axios.get("/api/videos/list")
        ]);
        
        setIsTeacher(statusRes.data.isTeacher);
        setVideos(videosRes.data.data || []);
      } catch (err) {
        console.error("Failed loading page initialization values:", err);
      } finally {
        setLoading(false);
      }
    }
    initPage();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !videoUrl) return alert("Please fill out the title and ensure the video has completed uploading.");

    setSubmitting(true);
    try {
      const res = await axios.post("/api/videos/create", {
        title,
        description,
        videoUrl,
        chapterId,
      });

      if (res.data.success) {
        // Prepend the new video instantly to the array list state
        setVideos([res.data.data, ...videos]);
        setShowModal(false);
        setTitle("");
        setDescription("");
        setVideoUrl("");
        setChapterId("0");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to catalog video to database");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <p className="text-sm text-gray-500">Loading tutorials vault...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Video className="w-6 h-6 text-purple-600" /> Video Tutorials
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isTeacher ? "Manage and publish your video tutorials." : "Watch premium video lectures."}
          </p>
        </div>

        {isTeacher && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Tutorial Video
          </button>
        )}
      </div>

      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl border border-dashed text-center">
          <Film className="w-12 h-12 text-gray-300 mb-3" />
          <h3 className="text-base font-medium text-gray-700">No videos available</h3>
          <p className="text-xs text-gray-400 mt-1">There are no tutorials cataloged in the system yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((vid) => (
            <div key={vid.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              {/* Native cloud content video stream container */}
              <video src={vid.videoUrl} controls className="w-full aspect-video bg-black object-contain" />
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 mb-2">
                    Chapter {vid.chapterId}
                  </span>
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{vid.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{vid.description}</p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-400 border-t pt-3">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" /> {vid.uploadedBy?.split("@")[0] || "Instructor"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {vid.createdAt ? new Date(vid.createdAt).toLocaleDateString() : "Just now"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Upload Course Material</h2>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Video Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Introduction to Next.js"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="What is this video about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 text-gray-900 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Chapter Association ID</label>
                <input
                  type="number"
                  min="0"
                  value={chapterId}
                  onChange={(e) => setChapterId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 text-gray-900"
                />
              </div>

              {/* Integration with your custom Cloudinary dropzone asset wrapper */}
              <VideoUploadZone onUploadComplete={(url) => setVideoUrl(url)} />

              <div className="flex justify-end gap-3 border-t pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !videoUrl}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium text-xs transition disabled:opacity-50 flex items-center gap-1"
                >
                  {submitting ? "Publishing..." : "Publish Video"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TutorialsPage;