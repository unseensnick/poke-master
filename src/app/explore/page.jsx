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

// Memoized grid component to prevent re-renders
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
                    // Use layout=false to avoid expensive layout animations
                    layout={false}
                >
                    <PokemonCard preloadedData={pokemon} />
                </motion.div>
            ))}
        </motion.div>
    );
});
PokemonGrid.displayName = "PokemonGrid";

// Empty state when no Pokémon match filters
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

// Initial loading state
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

// Page component
export default function ExplorePage() {
    // Search params from URL
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("search") || "";

    // State with performance optimizations
    const [pokemonList, setPokemonList] = useState([]);
    const [pokemonTypes, setPokemonTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    // Filter states
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedGeneration, setSelectedGeneration] = useState(null);
    const [selectedGame, setSelectedGame] = useState(null);
    const [sortOrder, setSortOrder] = useState("id-asc");

    // References for optimization
    const loaderRef = useRef(null);
    const prevSearchQueryRef = useRef(searchQuery);
    const loadingTimerRef = useRef(null);
    const hasTypesLoaded = useRef(false);
    const ITEMS_PER_PAGE = 20;

    // Load initial data with optimized promise handling
    useEffect(() => {
        async function loadInitialData() {
            // Prevent excessive loading indicators for fast responses
            const loadingTimer = setTimeout(() => {
                setIsLoading(true);
                setInitialLoading(true);
            }, 100);
            loadingTimerRef.current = loadingTimer;

            try {
                // Make a single request for complete Pokemon data
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

                // Update states in a single render cycle using batched updates
                setPokemonList(data.pokemonList || []);

                if (data.pokemonTypes && data.pokemonTypes.length > 0) {
                    setPokemonTypes(data.pokemonTypes);
                    hasTypesLoaded.current = true;
                }

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
            }
        }

        // Clear the list first to avoid keeping stale data during loading
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

    // Optimized load more function with debounce protection
    const loadMorePokemon = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);

        try {
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
                setHasMore(false);
            } else {
                // Append new data with a stable reference pattern
                setPokemonList((prev) => {
                    // Convert IDs to a Set for O(1) lookups
                    const existingIds = new Set(prev.map((p) => p.id));

                    // Filter out duplicates before appending
                    const uniqueNewPokemon = newPokemon.filter(
                        (p) => !existingIds.has(p.id)
                    );

                    return [...prev, ...uniqueNewPokemon];
                });

                setHasMore(newPokemon.length >= ITEMS_PER_PAGE);
                setOffset(offset + ITEMS_PER_PAGE);
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

    // Intersection Observer with cleanup and performance optimizations
    useEffect(() => {
        // Use a more performant intersection observer
        const options = {
            root: null,
            rootMargin: "100px", // Start loading earlier
            threshold: 0.1,
        };

        const handleIntersection = (entries) => {
            const [entry] = entries;
            if (entry.isIntersecting && !isLoading && hasMore) {
                // Use requestAnimationFrame to schedule loadMore on the next frame
                requestAnimationFrame(() => {
                    loadMorePokemon();
                });
            }
        };

        const observer = new IntersectionObserver(handleIntersection, options);
        const currentLoaderRef = loaderRef.current;

        if (currentLoaderRef) {
            observer.observe(currentLoaderRef);
        }

        return () => {
            if (currentLoaderRef) {
                observer.unobserve(currentLoaderRef);
            }
            observer.disconnect();
        };
    }, [loadMorePokemon, isLoading, hasMore]);

    // Optimized handlers with proper memoization
    const handleFilterChange = useCallback((filters) => {
        // Use requestAnimationFrame to ensure UI updates first
        requestAnimationFrame(() => {
            setSelectedTypes(filters.types || []);
            setSelectedGeneration(filters.generation);
            setSelectedGame(filters.game);

            // Reset pagination for new filters
            setOffset(0);
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

    // Memoize active filter count
    const activeFilterCount = useMemo(() => {
        return (
            selectedTypes.length +
            (selectedGeneration ? 1 : 0) +
            (selectedGame ? 1 : 0)
        );
    }, [selectedTypes.length, selectedGeneration, selectedGame]);

    // Memoize the Pokemon filters component
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
            // Only use pokemonTypes length as dependency to prevent re-renders when the data is the same
            pokemonTypes.length && !hasTypesLoaded.current
                ? pokemonTypes
                : null,
        ]
    );

    // Memoize the sort component
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

    // Main render with optimized AnimatePresence usage
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Hero section - using fadeDown variant */}
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

            {/* Controls container */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                {filtersComponent}
                {sortComponent}
            </div>

            {/* Content area with optimized AnimatePresence */}
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
                        {/* Results with optimized transitions */}
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

                        {/* Optimized loading indicator */}
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

                        {/* Infinite scroll trigger with enhanced visibility */}
                        {hasMore && (
                            <div
                                ref={loaderRef}
                                className="h-20 -mt-4"
                                aria-hidden="true"
                            />
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
        </div>
    );
}
