
'use client';

import { 
    SidebarContent, 
    SidebarHeader, 
    SidebarMenu, 
    SidebarMenuItem, 
    SidebarMenuButton, 
    SidebarFooter 
} from "@/components/ui/sidebar";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { TikTokLogo } from "../icons/tiktok-logo";
import type { AdminUser } from "@/lib/types";

async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
}

export function AdminSidebar({ user }: { user?: Omit<AdminUser, 'passwordHash'> }) {
    const router = useRouter();

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
