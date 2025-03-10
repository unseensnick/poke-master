"use client";

import { NavMenu } from "@/components/nav-menu";
import { SearchForm } from "@/components/search-form";
import Image from "next/image";

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 w-full items-center bg-foreground">
            <div className="flex h-[--header-height] w-full items-center justify-between px-4">
                <Image
                    src="/pokemon-logo.svg"
                    alt="Pokemon Logo"
                    width={150}
                    height={40}
                    className="h-16 w-auto object-contain"
                    priority
                />
                <div className="flex items-center gap-6">
                    <NavMenu />
                    <SearchForm className="w-auto" />
                </div>
            </div>
        </header>
    );
}
