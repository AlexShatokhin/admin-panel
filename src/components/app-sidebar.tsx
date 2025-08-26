"use client"

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { RoleEnum } from "@/types/RoleEnum"
import { LayoutList, LogOutIcon, Logs, Users, User } from "lucide-react"
import { signOut } from "next-auth/react"
import { Skeleton } from "./ui/skeleton"

const items = [
    { title: "Tasks", url: "/dashboard/tasks", icon: LayoutList, levels: [RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.WORKER] },
    { title: "Workers", url: "/dashboard/workers", icon: Users, levels: [RoleEnum.ADMIN, RoleEnum.MANAGER] },
    { title: "Logs", url: "/dashboard/logs", icon: Logs, levels: [RoleEnum.ADMIN] },
]

export function AppSidebar({name, role = RoleEnum.WORKER, loading} : {name: string | undefined, role?: RoleEnum, loading: boolean}) {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <div className="border-b p-4 flex items-center gap-3">
                    <div className="rounded-full border-2 p-2"><User /></div>
                    {loading ? <Skeleton className="w-32 h-4 bg-foreground" /> : <span>Hello, <strong>{name}</strong></span>}
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {
                                loading ? 
                                items.map((_, index) => (
                                    <SidebarMenuItem key={index}>
                                        <SidebarMenuButton>
                                            <a className="flex items-center gap-2" href="">
                                                <Skeleton className="w-4 rounded-full h-4 bg-foreground" />
                                                <Skeleton className="w-24 h-4 bg-foreground" />
                                            </a>                                        
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                                :
                                items.filter(item => item.levels.includes(role)).map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <a href={item.url}>
                                                <item.icon />
                                                {item.title}
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                            }                         
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenuButton onClick={() => signOut()} asChild>
                    <a href="/login">
                        <LogOutIcon />
                        <span>Exit</span>
                    </a>
                </SidebarMenuButton>
            </SidebarFooter>
        </Sidebar>
    )
}