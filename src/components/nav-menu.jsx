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

    const NavLink = ({ href, children, disabled = false }) => {
        const isActive = pathname === href;

        // If disabled, just return a styled span with no navigation capabilities
        if (disabled) {
            return (
                <NavigationMenuItem>
                    <div
                        className={`
                            text-xs sm:text-base whitespace-nowrap px-2 py-1 
                            text-foreground/40 cursor-not-allowed
                            flex items-center
                        `}
                        onClick={(e) => e.preventDefault()} // Prevent any default action
                    >
                        {children}
                        <span className="ml-1 text-[10px] bg-foreground/10 text-foreground/60 rounded-md px-1.5">
                            Soon
                        </span>
                    </div>
                </NavigationMenuItem>
            );
        }

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
                <NavLink href="/battle" disabled={true}>
                    Battle
                </NavLink>
                <NavLink href="/team" disabled={true}>
                    Team
                </NavLink>
            </NavigationMenuList>
        </NavigationMenu>
    );
}
