"use client";

import { cn } from "@/lib/utils";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as React from "react";

function Switch({
    className,
    thumbClassName,
    size = "default",
    children,
    ...props
}) {
    const sizes = {
        default: {
            switch: "h-[1.15rem] w-8",
            thumb: "size-4 data-[state=checked]:translate-x-[calc(100%-2px)]",
        },
        lg: {
            switch: "h-9 w-16 p-1",
            thumb: "size-7 data-[state=checked]:translate-x-7",
        },
        md: {
            switch: "h-8 w-14 p-1",
            thumb: "size-6 data-[state=checked]:translate-x-6",
        },
    };

    const sizeClasses = sizes[size] || sizes.default;

    return (
        <SwitchPrimitive.Root
            data-slot="switch"
            className={cn(
                "peer inline-flex shrink-0 items-center rounded-full border border-transparent",
                "shadow-xs transition-all outline-none focus-visible:ring-[3px]",
                "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
                "focus-visible:border-ring focus-visible:ring-ring/50",
                "dark:data-[state=unchecked]:bg-input/80",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "relative",
                sizeClasses.switch,
                className
            )}
            {...props}
        >
            {/* Icon container - positioned behind the thumb */}
            <div className="absolute inset-0 z-0 flex items-center justify-between px-1.5">
                {children}
            </div>

            <SwitchPrimitive.Thumb
                data-slot="switch-thumb"
                className={cn(
                    "pointer-events-none block rounded-full ring-0 transition-transform",
                    "bg-background dark:data-[state=unchecked]:bg-foreground",
                    "dark:data-[state=checked]:bg-primary-foreground",
                    "data-[state=unchecked]:translate-x-0",
                    "z-10",
                    "shadow-md",
                    sizeClasses.thumb,
                    thumbClassName
                )}
            />
        </SwitchPrimitive.Root>
    );
}

export { Switch };
