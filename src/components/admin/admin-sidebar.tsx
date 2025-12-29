
'use client';

import { 
    SidebarContent, 
    SidebarHeader, 
    SidebarMenu, 
    SidebarMenuItem, 
    SidebarMenuButton, 
    SidebarFooter 
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { TikTokLogo } from "../icons/tiktok-logo";

export function AdminSidebar() {
    const { adminLogout } = useAuth();
    const router = useRouter();
    
    const handleLogout = () => {
        adminLogout();
        router.push('/admin/login');
    };

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
