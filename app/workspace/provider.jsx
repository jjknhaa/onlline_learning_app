'use client';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react"
import AppSidebar from "./_components/AppSidebar";

import AppHeader from "./_components/AppHeader";
function WorkspaceProvider({children}){
    return(
        <SidebarProvider>
            <AppSidebar />
            <SidebarTrigger/>
            <div className="w-full">
                
                
                <div className="p-10">
                {children}
                </div>
                </div>
        
        </SidebarProvider>
    )
}
export default WorkspaceProvider;