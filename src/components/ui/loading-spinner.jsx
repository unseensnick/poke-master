"use client";

import { spinnerVariants } from "@/lib/animation-variants";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/**
 * Shows an animated loading spinner
 *
 * @param {Object} props - Component props
 * @param {string} props.size - Size (xs, sm, md, lg, xl)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.color - Color (primary, secondary, muted)
 * @param {boolean} props.center - Whether to center in container
 * @returns {JSX.Element} Rendered spinner
 */
export function LoadingSpinner({
    size = "md",
    className = "",
    color = "primary",
    center = false,
}) {
    // Define size classes for different spinner sizes
    const sizeClasses = {
        xs: "size-4",
        sm: "size-6",
        md: "size-10",
        lg: "size-16",
        xl: "size-24",
    };

    // Define color classes
    const colorClasses = {
        primary: "border-primary",
        secondary: "border-secondary",
        muted: "border-muted-foreground",
        card: "border-card-foreground/50",
    };

    // Add centering classes if needed
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
 * Shows a full-screen loading spinner with background
 *
 * @param {Object} props - Component props
 * @param {string} props.size - Size of spinner
 * @param {string} props.color - Color of spinner
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Rendered full-page spinner
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
 * Shows a gray placeholder box while content loads
 *
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Optional content
 * @returns {JSX.Element} Rendered skeleton
 */
export function Skeleton({ className, children }) {
    return (
        <div className={cn("animate-pulse bg-muted/50 rounded-md", className)}>
            {children}
        </div>
    );
}
