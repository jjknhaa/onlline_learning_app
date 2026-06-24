"use client";

import React, { useState } from "react";
import { UploadCloud, Loader2, CheckCircle2 } from "lucide-react";
import axios from "axios";

function VideoUploadZone({ onUploadComplete }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reject non-video file formats early
    if (!file.type.startsWith("video/")) {
      alert("Please select a valid video file (.mp4, .mov, .webm, etc.)");
      return;
    }

    setLoading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "tutorial_preset"); // 🍏 Verified from dashboard configuration
    formData.append("resource_type", "video");

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dxeylq7g6/video/upload`, // 🍏 Verified Environment Cloud Name
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      );

      const secureUrl = response.data.secure_url;
      setVideoUrl(secureUrl);
      onUploadComplete(secureUrl); // Sends streaming link up to main form state
    } catch (error) {
      console.error("Cloudinary Upload Pipeline Error:", error);
      alert("Failed to upload video to cloud storage. Verify your server is online and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-semibold text-gray-700 mb-1">
        Video File Asset *
      </label>
      
      <div className="border-2 border-dashed border-gray-200 hover:border-purple-400 rounded-xl p-6 transition-colors bg-gray-50/50 flex flex-col items-center justify-center relative min-h-[140px] text-center">
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            <p className="text-sm font-medium text-gray-700">Uploading to cloud storage...</p>
            <div className="w-32 bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-purple-600 h-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">{progress}% completed</span>
          </div>
        ) : videoUrl ? (
          <div className="flex flex-col items-center gap-1.5 text-emerald-600">
            <CheckCircle2 className="w-8 h-8" />
            <p className="text-sm font-semibold">Video Uploaded Successfully!</p>
            <span className="text-[11px] text-gray-400 max-w-[250px] truncate block px-2">
              {videoUrl}
            </span>
          </div>
        ) : (
          <>
            <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-xs font-medium text-gray-600">
              Drag & drop your tutorial or <span className="text-purple-600 underline cursor-pointer">browse files</span>
            </p>
            <p className="text-[10px] text-gray-400 mt-1">Supports standard streaming assets (MP4, MOV, WebM)</p>
            <input 
              type="file" 
              accept="video/*" 
              onChange={handleFileChange} 
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </>
        )}
      </div>
    </div>
  );
}

export default VideoUploadZone;