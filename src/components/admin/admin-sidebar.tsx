
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
import { TikTokLogo } from "../icons/tiktok-logo";
import type { AdminUser } from "@/lib/types";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export function AdminSidebar({ currentUser }: { currentUser: Omit<AdminUser, 'passwordHash'> | null }) {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
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
                         <SidebarMenuButton href="/dashboard" isActive={true} tooltip="Dashboard">
                             <LayoutDashboard />
                            <span>Dashboard</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            {currentUser && (
                <SidebarFooter>
                    <div className="text-sm text-muted-foreground p-2 space-y-2">
                       <p className="font-semibold truncate">{currentUser.email}</p>
                       <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                           <LogOut className="mr-2 h-4 w-4" />
                           Log Out
                       </Button>
                    </div>
                </SidebarFooter>
            )}
        </>
    );
}
