"use client";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

export function NavMenu() {
    const pathname = usePathname();

    const NavLink = ({ href, children }) => {
        const isActive = pathname === href;

        return (
            <NavigationMenuItem>
                <Link href={href} legacyBehavior passHref>
                    <NavigationMenuLink
                        className={`
                            text-xs sm:text-base whitespace-nowrap px-2 py-1 
                            hover:text-foreground hover:bg-transparent relative 
                            after:absolute after:block after:content-[''] after:h-0.5 after:bg-primary 
                            after:rounded-full after:w-0 after:left-1/2 after:-translate-x-1/2 after:bottom-[4px]
                            after:transition-all hover:after:w-[105%] transition-colors
                            ${
                                isActive
                                    ? "text-foreground after:w-[105%]"
                                    : "text-foreground/80"
                            }
                        `}
                    >
                        {children}
                    </NavigationMenuLink>
                </Link>
            </NavigationMenuItem>
        );
    };

    return (
        <NavigationMenu className="max-w-none">
            <NavigationMenuList className="flex gap-2 sm:gap-3 md:gap-4">
                <NavLink href="/">Home</NavLink>
                <NavLink href="/explore">Explore</NavLink>
                <NavLink href="/battle">Battle</NavLink>
                <NavLink href="/team">Team</NavLink>
            </NavigationMenuList>
        </NavigationMenu>
    );
}
