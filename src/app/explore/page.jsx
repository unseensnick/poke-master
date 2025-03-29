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

// Animation variants
import {
    containerVariants,
    fadeVariants,
    itemVariants,
    pageTransitionVariants,
} from "@/lib/animation-variants";

/**
 * Renders Pokemon grid with staggered animation
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
 * Empty state when no Pokemon match filter criteria
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
 * Initial loading state indicator
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
 * Explore page with filtering, sorting and infinite scrolling
 */
export default function ExplorePage() {
    // URL search parameters
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("search") || "";

    // Pokemon data state
    const [pokemonList, setPokemonList] = useState([]);
    const [pokemonTypes, setPokemonTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [showLoadMoreButton, setShowLoadMoreButton] = useState(false);

    // Filter state
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

    // Show load more button fallback after delay
    useEffect(() => {
        if (hasMore && !isLoading) {
            const timer = setTimeout(() => {
                setShowLoadMoreButton(true);
            }, 5000);

            return () => clearTimeout(timer);
        }
        return () => {};
    }, [hasMore, isLoading, pokemonList.length]);

    // Load initial Pokemon data
    useEffect(() => {
        async function loadInitialData() {
            // Show loading indicators after short delay
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

        // Clear list when filters change
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

        // Scroll to top when filters change
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
     * Loads next batch of Pokemon with current filters
     */
    const loadMorePokemon = useCallback(async () => {
        if (isLoading || !hasMore) {
            return;
        }

        setIsLoading(true);
        setShowLoadMoreButton(false);

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
                // Update offset before updating list
                const newOffset = offset + ITEMS_PER_PAGE;
                setOffset(newOffset);

                // Append new data and remove duplicates
                setPokemonList((prev) => {
                    const existingIds = new Set(prev.map((p) => p.id));
                    const uniqueNewPokemon = newPokemon.filter(
                        (p) => !existingIds.has(p.id)
                    );
                    return [...prev, ...uniqueNewPokemon];
                });

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
        if (!hasMore || isLoading || !loaderRef.current) return;

        const loader = loaderRef.current;
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && !isLoading && hasMore) {
                    loadMorePokemon();
                }
            },
            {
                root: null,
                rootMargin: "60px",
                threshold: 0.1,
            }
        );

        observer.observe(loader);

        return () => {
            observer.unobserve(loader);
            observer.disconnect();
        };
    }, [hasMore, isLoading, loadMorePokemon, pokemonList.length]);

    // Backup scroll event for reliability
    useEffect(() => {
        if (!hasMore || isLoading) return;

        function handleScroll() {
            if (!loaderRef.current) return;

            const rect = loaderRef.current.getBoundingClientRect();
            const isVisible = rect.top <= window.innerHeight + 300;

            if (isVisible && !isLoading && hasMore) {
                loadMorePokemon();
            }
        }

        window.addEventListener("scroll", handleScroll, { passive: true });
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

    // Calculate active filter count
    const activeFilterCount = useMemo(() => {
        return (
            selectedTypes.length +
            (selectedGeneration ? 1 : 0) +
            (selectedGame ? 1 : 0)
        );
    }, [selectedTypes.length, selectedGeneration, selectedGame]);

    // Memoized filter component
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

    // Memoized sort component
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
            {/* Page header */}
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

            {/* Main content */}
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

                        {/* Infinite scroll trigger */}
                        {hasMore && (
                            <div className="relative w-full my-10">
                                <div
                                    ref={loaderRef}
                                    className="absolute bottom-0 left-0 right-0 h-[100px]"
                                    aria-hidden="true"
                                    id="infinite-scroll-trigger"
                                    data-testid="infinite-scroll-trigger"
                                />

                                {/* Fallback load more button */}
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
