"use client";

import { Moon, Sun } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const ThemeContext = React.createContext(null);

export function ThemeProvider({ children, defaultTheme = "system", ...props }) {
    const [theme, setTheme] = React.useState(defaultTheme);
    const [mounted, setMounted] = React.useState(false);
    const isMobile = useIsMobile();

    // Once mounted on client, we can show the UI
    React.useEffect(() => setMounted(true), []);

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

export function useTheme() {
    const context = React.useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

export function ThemeToggle({ className, ...props }) {
    const { theme, setTheme, isMobile } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <Button
            variant={isMobile ? "outline" : "ghost"}
            size="icon"
            onClick={toggleTheme}
            className={cn(
                isMobile
                    ? "size-8 rounded-full p-0 border-primary/30 bg-background/90"
                    : "size-9 rounded-full p-0 hover:bg-primary/10 hover:text-foreground dark:hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary",
                className
            )}
            {...props}
        >
            <Sun
                className={cn(
                    "transition-transform",
                    isMobile
                        ? "size-4 rotate-0 scale-100 dark:-rotate-90 dark:scale-0 text-primary"
                        : "size-5 rotate-0 scale-100 dark:-rotate-90 dark:scale-0 text-primary"
                )}
            />
            <Moon
                className={cn(
                    "absolute transition-transform",
                    isMobile
                        ? "size-4 rotate-90 scale-0 dark:rotate-0 dark:scale-100 text-primary"
                        : "size-5 rotate-90 scale-0 dark:rotate-0 dark:scale-100 text-primary"
                )}
            />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
