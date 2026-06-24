"use client"
import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Sparkle, Loader2 } from "lucide-react"
import axios from 'axios'
import { useRouter } from 'next/navigation' 

function AddNewCourseDialog({ children, refreshData }) {
  const [open, setOpen] = useState(false) 
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    includeVideo: false,
    noOfChapters: 1,
    category: '',
    level: ''
  })

  const router = useRouter() 

  const onHandleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const onGenerate = async () => {
    if (!formData.name || !formData.level || !formData.category) {
      alert("Please fill out Name, Difficulty Level, and Category fields.")
      return
    }

    setLoading(true)
    console.log("Sending Data to backend:", formData)

    try {
      const result = await axios.post('/api/generate-course-layout', formData)
      console.log("Generated Data Response Payload:", result.data)
      
      if (result.data?.success && result.data?.data?.[0]?.cid) {
        const newCourseCid = result.data.data[0].cid;
        
        if (refreshData) {
          refreshData();
        }
        
        setOpen(false);
        router.push(`/course/${newCourseCid}`);
      }
    } catch (error) {
      console.error("Error creating course:", error)
      alert("Something went wrong while generating the course layout. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* 🍏 FIXED: Removed the invalid asChild prop for clean Base UI execution */}
      <DialogTrigger>
        {children}
      </DialogTrigger>

      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Create New Course using AI</DialogTitle>
          <DialogDescription>
            Fill the details below to generate your customized course layout.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">

          <div>
            <label className="text-sm font-medium">Course name</label>
            <input
              placeholder="e.g., Learn Next.js from Scratch"
              onChange={(e) =>
                onHandleInputChange("name", e.target.value)
              }
              className="border rounded-md p-2 w-full mt-1 text-sm outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Course description (optional)</label>
            <textarea
              placeholder="Tell the AI what topics or project goals you want targeted..."
              onChange={(e) =>
                onHandleInputChange("description", e.target.value)
              }
              className="border rounded-md p-2 w-full mt-1 text-sm h-20 resize-none outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium">No. of chapters</label>
            <input
              type="number"
              min={1}
              max={15}
              value={formData.noOfChapters}
              onChange={(e) =>
                onHandleInputChange("noOfChapters", Number(e.target.value))
              }
              className="border rounded-md p-2 w-full mt-1 text-sm outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center gap-3 py-2">
            <Switch
              checked={formData.includeVideo}
              onCheckedChange={(checked) =>
                onHandleInputChange("includeVideo", checked)
              }
            />
            <label className="text-sm font-medium text-gray-700">Include video layout suggestions</label>
          </div>

          <div>
            <label className="text-sm font-medium">Difficulty level</label>
            <div className="mt-1">
              <Select
                onValueChange={(value) =>
                  onHandleInputChange("level", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>
            <input
              placeholder="e.g., Coding, Math, Physics, History"
              onChange={(e) =>
                onHandleInputChange("category", e.target.value)
              }
              className="border rounded-md p-2 w-full mt-1 text-sm outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            
            <Button
              onClick={onGenerate}
              disabled={loading}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white disabled:bg-purple-400"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Structuring Course...
                </>
              ) : (
                <>
                  <Sparkle size={18} />
                  Generate Course
                </>
              )}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddNewCourseDialog