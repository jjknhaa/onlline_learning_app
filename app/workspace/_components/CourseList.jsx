"use client"
import React, { useState, useEffect } from 'react'
import Image from "next/image";
import AddNewCourseDialog from './AddNewCourseDialog';
import Link from 'next/link';

function CourseList({ initialCourses = [] }) {
  // Initialize the list state directly with the database prop array
  const [courseList, setCourseList] = useState(initialCourses);

  // Sync state if initial data changes on the server side
  useEffect(() => {
    setCourseList(initialCourses);
  }, [initialCourses]);

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-extrabold text-3xl text-gray-900">Your Courses</h2>
        
        {/* Only show the top right action button if courses already exist */}
        {courseList?.length > 0 && (
          <AddNewCourseDialog refreshData={() => window.location.reload()}>
            {/* 🍏 FIXED: Changed from component <Button> to a clean styled <div> */}
            <div className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm shadow-sm transition-all cursor-pointer text-center select-none">
              + Create New Course
            </div>
          </AddNewCourseDialog>
        )}
      </div>

      {courseList?.length === 0 ? (
        <div className="flex p-12 items-center justify-center flex-col border border-dashed rounded-xl bg-gray-50/50">
          <Image
            src="/online-education.png"
            alt="edu"
            width={100}
            height={100}
            className="opacity-80"
          />
          <h2 className="mt-4 text-xl font-bold text-gray-700">Look like you haven't created any courses yet</h2>
          <p className="text-gray-500 text-sm max-w-sm text-center mt-1 mb-6">
            Generate customized interactive curriculums instantly using the power of Gemini AI.
          </p>
          <AddNewCourseDialog refreshData={() => window.location.reload()}>
            {/* 🍏 FIXED: Changed from component <Button> to a clean styled <div> */}
            <div className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all cursor-pointer text-center select-none">
              + Create your first course
            </div>
          </AddNewCourseDialog>
        </div>
      ) : (
        /* --- DYNAMIC COURSE CARDS GRID GRID --- */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {courseList.map((course) => (
            <Link 
              href={`/course/${course.cid}`} 
              key={course.id}
              className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Banner Image Frame */}
                <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                  <img
                    src={course.bannerUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"}
                    alt={course.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 right-3 text-xs bg-black/60 text-white px-2.5 py-1 rounded-full font-medium backdrop-blur-xs capitalize">
                    {course.level}
                  </span>
                </div>

                {/* Course Metadata Text */}
                <div className="p-5">
                  <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
                    {course.category || "General"}
                  </span>
                  <h3 className="font-bold text-lg text-gray-900 mt-1 line-clamp-1 capitalize">
                    {course.name}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>
              </div>

              {/* Bottom Card Row info details */}
              <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50 flex justify-between items-center text-xs text-gray-500">
                <span className="font-medium">📚 {course.noOfChapters} Chapters</span>
                <span className="text-blue-600 font-semibold group-hover:underline flex items-center gap-1">
                  View Course <span>→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default CourseList;