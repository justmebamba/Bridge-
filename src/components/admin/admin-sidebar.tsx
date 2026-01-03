
'use client';

import { 
    SidebarContent, 
    SidebarHeader, 
    SidebarMenu, 
    SidebarMenuItem, 
    SidebarMenuButton, 
} from "@/components/ui/sidebar";
import { LayoutDashboard } from "lucide-react";
import { TikTokLogo } from "../icons/tiktok-logo";

export function AdminSidebar() {
    return (
        <>
            <SidebarHeader>
                 <div className="flex items-center space-x-2">
                    <TikTokLogo className="h-7 w-7 text-foreground" />
                    <span className="font-semibold text-lg">Admin</span>
                 </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                         <SidebarMenuButton href="/dashboard" isActive={true} tooltip="Dashboard">
                             <LayoutDashboard />
                            <span>Dashboard</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
        </>
    );
}
