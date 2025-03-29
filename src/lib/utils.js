import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes with conflict resolution
 * @param {...string|Object} inputs - Class names or conditional objects
 * @returns {string} Optimized class string with duplicates removed
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
