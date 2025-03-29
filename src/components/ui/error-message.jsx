"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Error message with optional action button
 */
export function ErrorMessage({
    message = "An error occurred",
    action,
    className = "",
    variant = "error",
    onRetry,
}) {
    // Map variants to icons
    const IconMap = {
        warning: AlertTriangle,
        error: AlertCircle,
        info: AlertCircle,
    };

    const Icon = IconMap[variant] || IconMap.error;

    // Variant styling
    const bgColors = {
        warning: "bg-yellow-500/10",
        error: "bg-destructive/10",
        info: "bg-blue-500/10",
    };

    const textColors = {
        warning: "text-yellow-600 dark:text-yellow-400",
        error: "text-destructive dark:text-destructive",
        info: "text-blue-600 dark:text-blue-400",
    };

    const iconColors = {
        warning: "text-yellow-500",
        error: "text-destructive",
        info: "text-blue-500",
    };

    // Create retry button if onRetry provided
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
 * Compact error message for inline usage
 */
export function InlineError({ message, className = "", variant = "error" }) {
    const IconMap = {
        warning: AlertTriangle,
        error: AlertCircle,
        info: AlertCircle,
    };

    const Icon = IconMap[variant] || IconMap.error;

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
