"use client";

import { NavMenu } from "@/components/nav-menu";
import { SearchForm } from "@/components/search-form";
import { ThemeToggle } from "@/components/theme-provider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function SiteHeader() {
    const isMobile = useIsMobile();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 w-full items-center justify-between px-3 sm:px-6">
                {/* Logo and Title Section - Fixed Width */}
                <div
                    className="flex items-center flex-shrink-0"
                    style={{ minWidth: "180px" }}
                >
                    <div className="relative mr-2 flex-shrink-0">
                        <Image
                            src="/pokemon-ball-logo.svg"
                            alt="Pokéball Logo"
                            width={40}
                            height={40}
                            className="size-10 object-contain"
                            priority
                        />
                    </div>
                    <div className="flex flex-col ml-1">
                        <h1 className="text-lg sm:text-xl font-bold text-foreground whitespace-nowrap">
                            PokéMaster
                        </h1>
                        <div className="flex flex-col">
                            <span className="text-[0.65rem] text-muted-foreground whitespace-nowrap">
                                Modern Pokémon Explorer
                            </span>
                            <div className="relative w-full flex items-center">
                                <div className="flex-shrink-0 -ml-3 mt-0.5">
                                    <Image
                                        src="/pokemon-logo-text-underline.svg"
                                        alt="Pokémon logo underline"
                                        width={80}
                                        height={10}
                                        className="object-contain"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation and Actions Section */}
                <div className="flex items-center gap-3 sm:gap-6 ml-auto">
                    {/* Only show NavMenu on screens >= 768px (md) */}
                    <div className="hidden md:block mr-2">
                        <NavMenu />
                    </div>

                    <SearchForm className={isMobile ? "hidden sm:block" : ""} />
                    <div className="hidden md:block">
                        <ThemeToggle />
                    </div>

                    {/* Only show SidebarTrigger on screens < 768px (md) */}
                    <div className="md:hidden">
                        <SidebarTrigger
                            className={cn(
                                "size-8 rounded-full p-0 border border-primary/30 bg-background/90",
                                "text-primary hover:bg-primary/10 dark:hover:bg-primary/10",
                                "focus-visible:ring-2 focus-visible:ring-primary"
                            )}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
