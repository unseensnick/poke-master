"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "./theme-provider";

const data = {
    navMain: [
        {
            title: "Navigation",
            items: [
                {
                    title: "Home",
                    url: "/",
                },
                {
                    title: "Explore",
                    url: "/explore",
                },
                {
                    title: "Battle",
                    url: "/battle",
                },
                {
                    title: "Team",
                    url: "/team",
                },
            ],
        },
    ],
};

export function AppSidebar({ ...props }) {
    const pathname = usePathname();

    return (
        <Sidebar
            className="top-[--header-height] h-[calc(100svh-var(--header-height))]"
            {...props}
        >
            <SidebarContent data-slot="sidebar-content" className="p-4">
                {data.navMain.map((item) => (
                    <SidebarGroup key={item.title}>
                        {/* Only show a label on mobile */}
                        <div className="md:hidden">
                            <SidebarGroupLabel className="text-sidebar-foreground font-bold mb-2 justify-between ">
                                {item.title}
                                <ThemeToggle />
                            </SidebarGroupLabel>
                        </div>

                        <SidebarGroupContent>
                            <SidebarMenu>
                                {item.items.map((item) => {
                                    const isActive = pathname === item.url;
                                    return (
                                        <SidebarMenuItem
                                            key={item.title}
                                            className="mb-2"
                                        >
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive}
                                                className={`w-full py-2 px-4 rounded-md transition-colors ${
                                                    isActive
                                                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                                                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                                                }`}
                                            >
                                                <Link href={item.url}>
                                                    {item.title}
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarRail className="border-sidebar-border" />
        </Sidebar>
    );
}
