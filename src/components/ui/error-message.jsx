// components/ui/error-message.jsx
"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, RefreshCw } from "lucide-react";

/**
 * A reusable error message component that can include actions
 *
 * @param {Object} props - Component props
 * @param {string} props.message - The error message to display
 * @param {React.ReactNode} props.action - Optional action button or component
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Error variant (warning, error, info)
 * @param {Function} props.onRetry - Optional retry callback function
 * @returns {JSX.Element} The rendered error message
 */
export function ErrorMessage({
    message = "An error occurred",
    action,
    className = "",
    variant = "error",
    onRetry,
}) {
    // Icon mapping based on variant
    const IconMap = {
        warning: AlertTriangle,
        error: AlertCircle,
        info: AlertCircle,
    };

    // Get the appropriate icon
    const Icon = IconMap[variant] || IconMap.error;

    // Background color mapping
    const bgColors = {
        warning: "bg-yellow-500/10",
        error: "bg-destructive/10",
        info: "bg-blue-500/10",
    };

    // Text color mapping
    const textColors = {
        warning: "text-yellow-600 dark:text-yellow-400",
        error: "text-destructive dark:text-destructive",
        info: "text-blue-600 dark:text-blue-400",
    };

    // Icon color mapping
    const iconColors = {
        warning: "text-yellow-500",
        error: "text-destructive",
        info: "text-blue-500",
    };

    // Render the retry button if onRetry is provided
    const retryButton = onRetry ? (
        <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="flex items-center gap-1"
        >
            <RefreshCw className="size-3" />
            Retry
        </Button>
    ) : null;

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center p-6 rounded-lg text-center",
                bgColors[variant] || bgColors.error,
                className
            )}
        >
            <Icon
                className={cn(
                    "size-10 mb-4",
                    iconColors[variant] || iconColors.error
                )}
            />

            <p
                className={cn(
                    "mb-4 font-medium",
                    textColors[variant] || textColors.error
                )}
            >
                {message}
            </p>

            <div className="flex gap-3">
                {retryButton}
                {action}
            </div>
        </div>
    );
}

/**
 * A smaller, inline error message component
 *
 * @param {Object} props - Component props
 * @param {string} props.message - The error message to display
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Error variant (warning, error, info)
 * @returns {JSX.Element} The rendered inline error message
 */
export function InlineError({ message, className = "", variant = "error" }) {
    // Icon mapping based on variant
    const IconMap = {
        warning: AlertTriangle,
        error: AlertCircle,
        info: AlertCircle,
    };

    // Get the appropriate icon
    const Icon = IconMap[variant] || IconMap.error;

    // Text color mapping
    const textColors = {
        warning: "text-yellow-600 dark:text-yellow-400",
        error: "text-destructive dark:text-destructive",
        info: "text-blue-600 dark:text-blue-400",
    };

    return (
        <div
            className={cn(
                "flex items-center gap-2 text-sm",
                textColors[variant] || textColors.error,
                className
            )}
        >
            <Icon className="size-4 flex-shrink-0" />
            <span>{message}</span>
        </div>
    );
}
