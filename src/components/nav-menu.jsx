"use client";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import * as React from "react";

export function NavMenu() {
    return (
        <NavigationMenu>
            <NavigationMenuList className="flex gap-6">
                <NavigationMenuItem>
                    <Link href="/" legacyBehavior passHref>
                        <NavigationMenuLink
                            className="text-white/70 text-md hover:text-white hover:bg-transparent relative 
              after:absolute after:block after:content-[''] after:h-0.5 after:bg-grass 
              after:rounded-full after:w-0 after:left-1/2 after:-translate-x-1/2 after:bottom-[4px]
              after:transition-all hover:after:w-[105%] transition-colors"
                        >
                            Home
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <Link href="/explore" legacyBehavior passHref>
                        <NavigationMenuLink
                            className="text-white/70 text-md hover:text-white hover:bg-transparent relative 
              after:absolute after:block after:content-[''] after:h-0.5 after:bg-grass 
              after:rounded-full after:w-0 after:left-1/2 after:-translate-x-1/2 after:bottom-[4px]
              after:transition-all hover:after:w-[105%] transition-colors"
                        >
                            Explore
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <Link href="/battle" legacyBehavior passHref>
                        <NavigationMenuLink
                            className="text-white/70 text-md hover:text-white hover:bg-transparent relative 
              after:absolute after:block after:content-[''] after:h-0.5 after:bg-grass 
              after:rounded-full after:w-0 after:left-1/2 after:-translate-x-1/2 after:bottom-[4px]
              after:transition-all hover:after:w-[105%] transition-colors"
                        >
                            Battle
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <Link href="/team" legacyBehavior passHref>
                        <NavigationMenuLink
                            className="text-white/70 text-md hover:text-white hover:bg-transparent relative 
              after:absolute after:block after:content-[''] after:h-0.5 after:bg-grass 
              after:rounded-full after:w-0 after:left-1/2 after:-translate-x-1/2 after:bottom-[4px]
              after:transition-all hover:after:w-[105%] transition-colors"
                        >
                            Team
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
}
