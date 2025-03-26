// components/ui/loading-spinner.jsx
"use client";

import { spinnerVariants } from "@/lib/animation-variants";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/**
 * A reusable loading spinner component with animation
 *
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the spinner (sm, md, lg, xl)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.color - Color variant (primary, secondary, muted)
 * @param {boolean} props.center - Whether to center the spinner in its container
 * @returns {JSX.Element} The rendered loading spinner
 */
export function LoadingSpinner({
    size = "md",
    className = "",
    color = "primary",
    center = false,
}) {
    // Size classes mapping
    const sizeClasses = {
        xs: "size-4",
        sm: "size-6",
        md: "size-10",
        lg: "size-16",
        xl: "size-24",
    };

    // Color classes mapping
    const colorClasses = {
        primary: "border-primary",
        secondary: "border-secondary",
        muted: "border-muted-foreground",
        card: "border-card-foreground/50",
    };

    // Center classes if needed
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
 * A full-page loading spinner with background overlay
 *
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the spinner
 * @param {string} props.color - Color variant
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} The rendered full-page loading spinner
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
 * A skeleton loader with animated pulse effect
 *
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Optional content to render inside the skeleton
 * @returns {JSX.Element} The rendered skeleton
 */
export function Skeleton({ className, children }) {
    return (
        <div className={cn("animate-pulse bg-muted/50 rounded-md", className)}>
            {children}
        </div>
    );
}
