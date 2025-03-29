"use client";

import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import * as React from "react";

const ThemeContext = React.createContext(null);

/**
 * Theme provider with system preference detection
 */
export function ThemeProvider({ children, defaultTheme = "system", ...props }) {
    const [theme, setTheme] = React.useState(defaultTheme);
    const [mounted, setMounted] = React.useState(false);
    const isMobile = useIsMobile();

    // Prevent hydration mismatch
    React.useEffect(() => setMounted(true), []);

    // Apply theme class to document root
    React.useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");

        if (theme === "system") {
            const systemTheme = window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches
                ? "dark"
                : "light";
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
    }, [theme]);

    // Memoize context value
    const value = React.useMemo(
        () => ({
            theme,
            setTheme,
            isMobile,
        }),
        [theme, isMobile]
    );

    if (!mounted) {
        return null;
    }

    return (
        <ThemeContext.Provider value={value} {...props}>
            {children}
        </ThemeContext.Provider>
    );
}

/**
 * Hook to access theme context
 */
export function useTheme() {
    const context = React.useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

/**
 * Theme toggle switch with light/dark icons
 */
export function ThemeToggle({ className, ...props }) {
    const { theme, setTheme, isMobile } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Determine actual theme considering system preference
    const resolvedTheme = React.useMemo(() => {
        if (!mounted) return theme;

        if (theme === "system") {
            return window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
        }

        return theme;
    }, [theme, mounted]);

    // Toggle between light and dark
    const handleToggle = (checked) => {
        setTheme(checked ? "light" : "dark");
    };

    // Responsive sizing
    const size = isMobile ? "sm" : "md";
    const iconSize = isMobile ? "size-3" : "size-3.5";

    if (!mounted) return null;

    return (
        <Switch
            checked={resolvedTheme === "light"}
            onCheckedChange={handleToggle}
            size={size}
            className={className}
            {...props}
        >
            {/* Light mode icon */}
            <Sun
                className={cn(
                    "transition-colors",
                    iconSize,
                    resolvedTheme === "light" ? "text-white/90" : "text-primary"
                )}
            />

            {/* Dark mode icon */}
            <Moon
                className={cn(
                    "transition-colors",
                    iconSize,
                    resolvedTheme === "dark" ? "text-primary/90" : "text-white"
                )}
            />
        </Switch>
    );
}
