"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Book,
  Compass,
  PencilRuler,
  CreditCard,
  Video,
  User,
  Lock, // 🍏 Added Lock Icon
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import AddNewCourseDialog from "./AddNewCourseDialog";

const SideBarOptions = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/workspace" },
  { title: "My learning", icon: Book, path: "/workspace/my-courses" },
  { title: "Explore courses", icon: Compass }, //, path: "/workspace/explore"
  { title: "AI tools", icon: PencilRuler }, //, path: "/workspace/ai-tools"
  { title: "Billing", icon: CreditCard, path: "/workspace/billing" },
  { title: "Tutorials", icon: Video, path: "/workspace/tutorials", requiresAccess: true }, // 🍏 Flagged feature
  { title: "Profile", icon: User, path: "/workspace/profile" },
];

function AppSidebar() {
  const path = usePathname();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch access rights on sidebar mount
  useEffect(() => {
    async function checkPermissions() {
      try {
        const response = await axios.get("/api/user/status");
        // Access is granted if they paid OR if they are a teacher
        if (response.data.isSubscriber || response.data.isTeacher) {
          setHasAccess(true);
        }
      } catch (err) {
        console.error("Failed to parse status checks", err);
      } finally {
        setLoading(false);
      }
    }
    checkPermissions();
  }, [path]); // Re-verify on navigation state re-evaluations

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Image 
          src="/logo.svg" 
          alt="logo" 
          width={130} 
          height={120} 
          style={{ height: 'auto' }} 
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <AddNewCourseDialog>
            <div className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors text-center cursor-pointer shadow-sm">
              Create New Course
            </div>
          </AddNewCourseDialog>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {SideBarOptions.map((item, index) => {
                const isActive = path === item.path;
                // If it requires access, and the user hasn't met the requirements, block it
                const isLocked = item.requiresAccess && !hasAccess && !loading;

                return (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton
                      disabled={isLocked}
                      onClick={() => {
                        if (isLocked) {
                          // Redirect unverified users straight to billing page
                          router.push("/workspace/billing?reason=locked");
                        } else {
                          router.push(item.path);
                        }
                      }}
                      className={`flex items-center justify-between gap-3 text-sm px-3 py-2 rounded-md transition w-full
                        ${isActive ? "bg-purple-50 text-primary font-medium" : "hover:bg-gray-100"}
                        ${isLocked ? "opacity-60 cursor-not-allowed text-gray-400 hover:bg-transparent" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </div>
                      
                      {/* Show lock badge if user doesn't possess authorization parameters */}
                      {isLocked && <Lock className="w-4 h-4 text-amber-500" />}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}

export default AppSidebar;