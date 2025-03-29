"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Search form with URL-based state management and debouncing
 */
export function SearchForm({
    placeholder = "Search Pokémon...",
    className = "",
    ...props
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // State and refs
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef(null);
    const debounceTimerRef = useRef(null);

    // Sync with URL params on mount/URL change
    useEffect(() => {
        const searchFromParams = searchParams.get("search") || "";
        setInputValue(searchFromParams);
    }, [searchParams]);

    // Handle input with debouncing
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            updateSearchURL(newValue);
        }, 300);
    };

    // Update URL with search params
    const updateSearchURL = (searchValue) => {
        // Skip if not on explore page and search is empty
        if (pathname !== "/explore" && !searchValue) {
            return;
        }

        const params = new URLSearchParams(searchParams.toString());

        if (searchValue) {
            params.set("search", searchValue);
        } else {
            params.delete("search");
        }

        // Redirect to explore page if searching from elsewhere
        if (pathname !== "/explore" && searchValue) {
            router.push(`/explore?${params.toString()}`);
            return;
        }

        // Update current URL
        const newURL = params.toString()
            ? `${pathname}?${params.toString()}`
            : pathname;
        router.push(newURL, { scroll: false });
    };

    // Clear search
    const handleClear = () => {
        setInputValue("");
        updateSearchURL("");
        inputRef.current?.focus();
    };

    // Form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        updateSearchURL(inputValue);
    };

    return (
        <form onSubmit={handleSubmit} className={className} {...props}>
            <div className="relative">
                <Label htmlFor="search" className="sr-only">
                    Search
                </Label>
                <Input
                    ref={inputRef}
                    id="search"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="h-9 w-[200px] lg:w-[250px] pl-8 rounded-full border-muted-foreground/30 bg-background/80 
          text-foreground/80 placeholder:text-foreground/50 focus-visible:border-primary 
          focus-visible:ring-1 focus-visible:ring-primary dark:bg-muted/30"
                />
                {/* Search icon */}
                <Search
                    className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 
          select-none text-pokemon-unknown/50"
                />
                {/* Clear button */}
                {inputValue && (
                    <button
                        type="button"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground hover:text-foreground"
                        onClick={handleClear}
                        aria-label="Clear search"
                    >
                        <X className="size-4" />
                    </button>
                )}
            </div>
        </form>
    );
}
