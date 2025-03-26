"use client";

import PokemonCard from "@/components/pokemon-card";
import { PokemonFilters } from "@/components/pokemon-filters";
import { PokemonSort } from "@/components/pokemon-sort";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getExplorePageData } from "@/services/pokemon-service";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

// Import shared animation variants
import {
    containerVariants,
    fadeVariants,
    itemVariants,
    pageTransitionVariants,
} from "@/lib/animation-variants";

/**
 * Grid of Pokemon cards with staggered animation
 *
 * @param {Object} props - Component props
 * @param {Array} props.pokemonList - List of Pokemon data to display
 * @returns {JSX.Element} Animated grid of Pokemon cards
 */
const PokemonGrid = React.memo(({ pokemonList }) => {
    return (
        <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center"
            variants={containerVariants.grid}
            initial="hidden"
            animate="show"
            exit="hidden"
        >
            {pokemonList.map((pokemon, index) => (
                <motion.div
                    key={`${pokemon.id}-${index}`}
                    variants={itemVariants.card}
                    className="w-full flex justify-center"
                    layout={false}
                >
                    <PokemonCard preloadedData={pokemon} />
                </motion.div>
            ))}
        </motion.div>
    );
});
PokemonGrid.displayName = "PokemonGrid";

/**
 * Displays when no Pokemon match the filter criteria
 *
 * @param {Object} props - Component props
 * @param {Function} props.onClearFilters - Called when clear filters button is clicked
 * @returns {JSX.Element} Empty state message with clear filters action
 */
const EmptyState = React.memo(({ onClearFilters }) => {
    return (
        <motion.div
            className="py-20"
            variants={fadeVariants.standard}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <ErrorMessage
                message="No Pokémon found matching your criteria."
                variant="info"
                action={
                    <Button variant="default" onClick={onClearFilters}>
                        Clear Filters
                    </Button>
                }
            />
        </motion.div>
    );
});
EmptyState.displayName = "EmptyState";

/**
 * Displays during initial data loading
 *
 * @returns {JSX.Element} Loading spinner
 */
const InitialLoading = React.memo(() => {
    return (
        <motion.div
            className="flex justify-center py-20"
            variants={fadeVariants.standard}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <LoadingSpinner size="lg" center />
        </motion.div>
    );
});
InitialLoading.displayName = "InitialLoading";

/**
 * Explore page with Pokemon grid, filtering and infinite scrolling
 * Fetches and displays Pokemon data with advanced filtering options
 *
 * @returns {JSX.Element} Complete explore page
 */
export default function ExplorePage() {
    // Search params from URL
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("search") || "";

    // State for Pokemon data and loading
    const [pokemonList, setPokemonList] = useState([]);
    const [pokemonTypes, setPokemonTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [showLoadMoreButton, setShowLoadMoreButton] = useState(false);

    // Filter states
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedGeneration, setSelectedGeneration] = useState(null);
    const [selectedGame, setSelectedGame] = useState(null);
    const [sortOrder, setSortOrder] = useState("id-asc");

    // References
    const loaderRef = useRef(null);
    const prevSearchQueryRef = useRef(searchQuery);
    const loadingTimerRef = useRef(null);
    const hasTypesLoaded = useRef(false);
    const ITEMS_PER_PAGE = 20;

    // Show load more button as fallback after a delay
    useEffect(() => {
        if (hasMore && !isLoading) {
            const timer = setTimeout(() => {
                setShowLoadMoreButton(true);
            }, 5000); // Show button after 5 seconds

            return () => clearTimeout(timer);
        }

        return () => {};
    }, [hasMore, isLoading, pokemonList.length]);

    // Load initial Pokemon data
    useEffect(() => {
        async function loadInitialData() {
            // Show loading indicators after a short delay
            const loadingTimer = setTimeout(() => {
                setIsLoading(true);
                setInitialLoading(true);
            }, 100);
            loadingTimerRef.current = loadingTimer;

            try {
                // Fetch Pokemon with all filter criteria
                const data = await getExplorePageData({
                    limit: ITEMS_PER_PAGE,
                    offset: 0,
                    types: selectedTypes,
                    generation: selectedGeneration,
                    game: selectedGame,
                    searchQuery: searchQuery,
                    sortOrder: sortOrder,
                    includeTypes: !hasTypesLoaded.current,
                    includeFullData: true,
                });

                // Update states
                setPokemonList(data.pokemonList || []);

                // Only update types once
                if (data.pokemonTypes && data.pokemonTypes.length > 0) {
                    setPokemonTypes(data.pokemonTypes);
                    hasTypesLoaded.current = true;
                }

                // Check if there might be more Pokemon to load
                setHasMore(
                    data.pokemonList &&
                        data.pokemonList.length >= ITEMS_PER_PAGE
                );
                setOffset(ITEMS_PER_PAGE);
            } catch (error) {
                console.error("Error loading initial data:", error);
                setHasMore(false);
            } finally {
                clearTimeout(loadingTimerRef.current);
                setIsLoading(false);
                setInitialLoading(false);
                setShowLoadMoreButton(false);
            }
        }

        // Clear list when filters change to avoid stale data
        if (
            searchQuery !== prevSearchQueryRef.current ||
            selectedTypes.length > 0 ||
            selectedGeneration !== null ||
            selectedGame !== null
        ) {
            setPokemonList([]);
        }

        prevSearchQueryRef.current = searchQuery;
        loadInitialData();

        // Scroll back to top when filters change
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }, [
        selectedTypes,
        selectedGeneration,
        selectedGame,
        sortOrder,
        searchQuery,
    ]);

    /**
     * Loads more Pokemon when user scrolls to bottom of list
     * Uses offset-based pagination to fetch next batch
     */
    const loadMorePokemon = useCallback(async () => {
        // Prevent multiple simultaneous calls
        if (isLoading || !hasMore) {
            return;
        }

        // Set loading state immediately
        setIsLoading(true);
        setShowLoadMoreButton(false);

        try {
            // Fetch next page of Pokemon
            const data = await getExplorePageData({
                limit: ITEMS_PER_PAGE,
                offset: offset,
                types: selectedTypes,
                generation: selectedGeneration,
                game: selectedGame,
                searchQuery: searchQuery,
                sortOrder: sortOrder,
                includeTypes: false,
                includeFullData: true,
            });

            const newPokemon = data.pokemonList || [];

            if (newPokemon.length === 0) {
                // No more Pokemon to load
                setHasMore(false);
            } else {
                // Update offset BEFORE updating the list
                const newOffset = offset + ITEMS_PER_PAGE;
                setOffset(newOffset);

                // Append new data and remove duplicates
                setPokemonList((prev) => {
                    // Use Set for O(1) lookups
                    const existingIds = new Set(prev.map((p) => p.id));

                    // Filter out duplicates
                    const uniqueNewPokemon = newPokemon.filter(
                        (p) => !existingIds.has(p.id)
                    );

                    return [...prev, ...uniqueNewPokemon];
                });

                // Set hasMore based on if we got a full page
                setHasMore(newPokemon.length >= ITEMS_PER_PAGE);
            }
        } catch (error) {
            console.error("Error loading more Pokémon:", error);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }, [
        isLoading,
        hasMore,
        offset,
        selectedTypes,
        selectedGeneration,
        selectedGame,
        searchQuery,
        sortOrder,
    ]);

    // Intersection Observer for infinite scrolling
    useEffect(() => {
        // Skip if no more data or already loading
        if (!hasMore || isLoading || !loaderRef.current) return;

        const loader = loaderRef.current;

        // Create observer that detects when loader is visible
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;

                if (entry.isIntersecting && !isLoading && hasMore) {
                    loadMorePokemon();
                }
            },
            {
                root: null, // Use viewport as root
                rootMargin: "60px", // Trigger 500px before visible
                threshold: 0.1, // Trigger at 10% visibility
            }
        );

        // Start observing the loader element
        observer.observe(loader);

        // Clean up the observer when component unmounts
        return () => {
            observer.unobserve(loader);
            observer.disconnect();
        };
    }, [hasMore, isLoading, loadMorePokemon, pokemonList.length]);

    // Backup scroll event for maximum reliability
    useEffect(() => {
        if (!hasMore || isLoading) return;

        // Check if we're near the bottom of the page
        function handleScroll() {
            if (!loaderRef.current) return;

            const rect = loaderRef.current.getBoundingClientRect();
            const isVisible = rect.top <= window.innerHeight + 300;

            if (isVisible && !isLoading && hasMore) {
                loadMorePokemon();
            }
        }

        window.addEventListener("scroll", handleScroll, { passive: true });

        // Check on mount as well
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [hasMore, isLoading, loadMorePokemon, pokemonList.length]);

    // Filter handlers
    const handleFilterChange = useCallback((filters) => {
        requestAnimationFrame(() => {
            setSelectedTypes(filters.types || []);
            setSelectedGeneration(filters.generation);
            setSelectedGame(filters.game);
            setOffset(0); // Reset pagination
        });
    }, []);

    const handleSortChange = useCallback((value) => {
        setSortOrder(value);
    }, []);

    const clearFilters = useCallback(() => {
        setSelectedTypes([]);
        setSelectedGeneration(null);
        setSelectedGame(null);
    }, []);

    // Calculate active filter count for display
    const activeFilterCount = useMemo(() => {
        return (
            selectedTypes.length +
            (selectedGeneration ? 1 : 0) +
            (selectedGame ? 1 : 0)
        );
    }, [selectedTypes.length, selectedGeneration, selectedGame]);

    // Memoize filter component for performance
    const filtersComponent = useMemo(
        () => (
            <PokemonFilters
                onFilterChange={handleFilterChange}
                selectedTypes={selectedTypes}
                selectedGeneration={selectedGeneration}
                selectedGame={selectedGame}
                availableTypes={pokemonTypes}
                className="flex-1"
            />
        ),
        [
            handleFilterChange,
            selectedTypes,
            selectedGeneration,
            selectedGame,
            pokemonTypes.length && !hasTypesLoaded.current
                ? pokemonTypes
                : null,
        ]
    );

    // Memoize sort component for performance
    const sortComponent = useMemo(
        () => (
            <PokemonSort
                value={sortOrder}
                onChange={handleSortChange}
                className="md:self-start"
            />
        ),
        [sortOrder, handleSortChange]
    );

    return (
        <motion.div
            className="container mx-auto px-4 py-8"
            variants={pageTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {/* Hero section */}
            <motion.div
                className="mb-8 text-center"
                variants={fadeVariants.fadeDown}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Explore Pokémon
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Discover and learn about all Pokémon species. Search by name
                    or filter by type.
                </p>
            </motion.div>

            {/* Filters and sorting */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                {filtersComponent}
                {sortComponent}
            </div>

            {/* Main content area */}
            <AnimatePresence mode="wait">
                {initialLoading ? (
                    <InitialLoading key="loading" />
                ) : (
                    <motion.div
                        key="content"
                        variants={fadeVariants.standard}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="min-h-[400px]"
                    >
                        {/* Pokemon grid or empty state */}
                        <AnimatePresence mode="wait">
                            {pokemonList.length === 0 && !isLoading ? (
                                <EmptyState
                                    key="empty"
                                    onClearFilters={clearFilters}
                                />
                            ) : (
                                <PokemonGrid
                                    key="grid"
                                    pokemonList={pokemonList}
                                />
                            )}
                        </AnimatePresence>

                        {/* Loading indicator */}
                        <AnimatePresence>
                            {isLoading && !initialLoading && (
                                <motion.div
                                    key="more-loading"
                                    className="flex justify-center mt-8 pb-8"
                                    variants={fadeVariants.standard}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    <LoadingSpinner size="md" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Invisible infinite scroll trigger */}
                        {hasMore && (
                            <div className="relative w-full my-10">
                                <div
                                    ref={loaderRef}
                                    className="absolute bottom-0 left-0 right-0 h-[100px]"
                                    aria-hidden="true"
                                    id="infinite-scroll-trigger"
                                    data-testid="infinite-scroll-trigger"
                                />

                                {/* Fallback button if automatic loading fails */}
                                {showLoadMoreButton && !isLoading && (
                                    <div className="flex justify-center mt-4">
                                        <Button
                                            variant="outline"
                                            onClick={loadMorePokemon}
                                            className="mx-auto"
                                        >
                                            Load More Pokémon
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* End of results message */}
                        <AnimatePresence>
                            {!hasMore && pokemonList.length > 0 && (
                                <motion.p
                                    key="end-message"
                                    className="text-center text-muted-foreground mt-8 pb-8"
                                    variants={fadeVariants.standard}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    You've reached the end of the list!
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
