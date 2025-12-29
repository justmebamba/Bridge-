
'use client';

import { 
    Sidebar, 
    SidebarContent, 
    SidebarHeader, 
    SidebarMenu, 
    SidebarMenuItem, 
    SidebarMenuButton, 
    SidebarFooter 
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, LogOut, Settings, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { TikTokForBusinessLogo } from "../icons/tiktok-for-business-logo";

export function AdminSidebar() {
    const { adminLogout, adminUser } = useAuth();
    const router = useRouter();
    
    const handleLogout = () => {
        adminLogout();
        router.push('/admin/login');
    };

    return (
        <>
            <SidebarHeader>
                 <TikTokForBusinessLogo className="h-6 text-foreground" />
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                         <SidebarMenuButton href="/admin" isActive={true} tooltip="Dashboard">
                             <LayoutDashboard />
                            <span>Dashboard</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                 <SidebarMenu>
                    <SidebarMenuItem>
                         <SidebarMenuButton onClick={handleLogout} tooltip="Log Out">
                             <LogOut />
                            <span>Log Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </>
    );
}
