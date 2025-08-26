"use client"

import { AppSidebar } from "@/components/app-sidebar";
import PageTitle from "@/components/page-title";
import { SidebarProvider } from "@/components/ui/sidebar";
import usePageTitle from "@/hooks/use-page-title";
import { RoleEnum } from "@/types/RoleEnum";
import { useSession } from "next-auth/react";

export default function Layout ({children}: {children: React.ReactNode}) {
    const {data: session, status} = useSession();
    const title = usePageTitle();
    console.log(session);
    return (
        <SidebarProvider>
            <AppSidebar loading={status === "loading"} name={session?.user?.name} role={session?.user?.role as RoleEnum | undefined} />
            <main>
                <PageTitle>{title}</PageTitle>
                <div className="px-6 py-4">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    )
}