"use client";

import { spinnerVariants } from "@/lib/animation-variants";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/**
 * Animated loading spinner with size and color options
 */
export function LoadingSpinner({
    size = "md",
    className = "",
    color = "primary",
    center = false,
}) {
    // Size classes
    const sizeClasses = {
        xs: "size-4",
        sm: "size-6",
        md: "size-10",
        lg: "size-16",
        xl: "size-24",
    };

    // Color classes
    const colorClasses = {
        primary: "border-primary",
        secondary: "border-secondary",
        muted: "border-muted-foreground",
        card: "border-card-foreground/50",
    };

    // Centering classes
    const centerClasses = center ? "flex justify-center items-center" : "";

    return (
        <div className={cn(centerClasses, className)}>
            <motion.div
                className={cn(
                    "rounded-full border-4 border-t-transparent",
                    sizeClasses[size] || sizeClasses.md,
                    colorClasses[color] || colorClasses.primary
                )}
                variants={spinnerVariants.spin}
                animate="animate"
            />
        </div>
    );
}

/**
 * Full-screen loading spinner with backdrop
 */
export function FullPageSpinner({
    size = "lg",
    color = "primary",
    className = "",
}) {
    return (
        <div
            className={cn(
                "fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50",
                className
            )}
        >
            <LoadingSpinner size={size} color={color} />
        </div>
    );
}

/**
 * Placeholder for content loading states
 */
export function Skeleton({ className, children }) {
    return (
        <div className={cn("animate-pulse bg-muted/50 rounded-md", className)}>
            {children}
        </div>
    );
}
