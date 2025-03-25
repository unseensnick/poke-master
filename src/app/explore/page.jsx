"use client";

import PokemonCard from "@/components/pokemon-card";
import { PokemonFilters } from "@/components/pokemon-filters";
import { PokemonSort } from "@/components/pokemon-sort";
import { Button } from "@/components/ui/button";
import { getExplorePageData } from "@/services/pokemon-service";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export default function ExplorePage() {
    // Get search parameters from URL
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("search") || "";

    // State for Pokemon data and pagination
    const [pokemonList, setPokemonList] = useState([]);
    const [pokemonTypes, setPokemonTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    // State for filtering
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedGeneration, setSelectedGeneration] = useState(null);
    const [selectedGame, setSelectedGame] = useState(null);
    const [sortOrder, setSortOrder] = useState("id-asc");

    // References
    const loaderRef = useRef(null);

    const ITEMS_PER_PAGE = 20;

    // Load initial data with a single request
    useEffect(() => {
        async function loadInitialData() {
            setIsLoading(true);
            setInitialLoading(true);
            setPokemonList([]); // Clear previous results

            try {
                // Make a single request for complete Pokemon data and types
                const data = await getExplorePageData({
                    limit: ITEMS_PER_PAGE,
                    offset: 0,
                    types: selectedTypes,
                    generation: selectedGeneration,
                    game: selectedGame,
                    searchQuery: searchQuery,
                    sortOrder: sortOrder,
                    includeTypes: true, // Also fetch types data
                    includeFullData: true, // Get complete Pokemon data with sprites
                });

                // Update state with the data from the single response
                setPokemonList(data.pokemonList || []);
                setPokemonTypes(data.pokemonTypes || []);

                // Update pagination state
                if (
                    !data.pokemonList ||
                    data.pokemonList.length < ITEMS_PER_PAGE
                ) {
                    setHasMore(false);
                } else {
                    setOffset(ITEMS_PER_PAGE);
                    setHasMore(true);
                }
            } catch (error) {
                console.error("Error loading initial data:", error);
                setHasMore(false);
            } finally {
                setIsLoading(false);
                setInitialLoading(false);
            }
        }

        loadInitialData();
    }, [
        selectedTypes,
        selectedGeneration,
        selectedGame,
        sortOrder,
        searchQuery,
    ]);

    // Load more Pokemon when scrolling (pagination)
    const loadMorePokemon = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);

        try {
            // Only need to fetch more Pokemon list items, not types
            const data = await getExplorePageData({
                limit: ITEMS_PER_PAGE,
                offset: offset,
                types: selectedTypes,
                generation: selectedGeneration,
                game: selectedGame,
                searchQuery: searchQuery,
                sortOrder: sortOrder,
                includeTypes: false, // Don't need types for pagination
                includeFullData: true, // Still need complete data with sprites
            });

            const newPokemon = data.pokemonList || [];

            if (newPokemon.length === 0) {
                setHasMore(false);
            } else {
                setPokemonList((prev) => [...prev, ...newPokemon]);

                // If we got fewer results than requested, we've reached the end
                if (newPokemon.length < ITEMS_PER_PAGE) {
                    setHasMore(false);
                } else {
                    setOffset(offset + ITEMS_PER_PAGE);
                }
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

    // Setup Intersection Observer for infinite scrolling
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && !isLoading && hasMore) {
                    loadMorePokemon();
                }
            },
            { threshold: 0.1 }
        );

        const currentLoaderRef = loaderRef.current;
        if (currentLoaderRef) {
            observer.observe(currentLoaderRef);
        }

        return () => {
            if (currentLoaderRef) {
                observer.unobserve(currentLoaderRef);
            }
        };
    }, [loadMorePokemon, isLoading, hasMore]);

    // Handle filter changes from PokemonFilters component
    const handleFilterChange = (filters) => {
        setSelectedTypes(filters.types || []);
        setSelectedGeneration(filters.generation);
        setSelectedGame(filters.game);
    };

    // Handle sort changes
    const handleSortChange = (value) => {
        setSortOrder(value);
    };

    // Function to clear all filters
    const clearFilters = () => {
        setSelectedTypes([]);
        setSelectedGeneration(null);
        setSelectedGame(null);
        // We don't reset sort order when clearing filters
    };

    // Animation variants - unchanged
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        show: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 24,
            },
        },
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Hero section */}
            <motion.div
                className="mb-8 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Explore Pokémon
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Discover and learn about all Pokémon species. Search by name
                    or filter by type.
                </p>
            </motion.div>

            {/* Controls container with filter and sort */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <PokemonFilters
                    onFilterChange={handleFilterChange}
                    selectedTypes={selectedTypes}
                    selectedGeneration={selectedGeneration}
                    selectedGame={selectedGame}
                    availableTypes={pokemonTypes} // Pass types from consolidated request
                    className="flex-1"
                />

                <PokemonSort
                    value={sortOrder}
                    onChange={handleSortChange}
                    className="md:self-start"
                />
            </div>

            {/* Loading state for initial load */}
            {initialLoading ? (
                <motion.div
                    className="flex justify-center items-center py-20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="relative">
                        <motion.div
                            className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent"
                            animate={{ rotate: 360 }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-6 w-6 rounded-full bg-background"></div>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <>
                    {/* Results section */}
                    {pokemonList.length === 0 && !isLoading ? (
                        <motion.div
                            className="text-center py-20"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <p className="text-xl text-muted-foreground">
                                No Pokémon found matching your criteria.
                            </p>
                            <Button
                                variant="default"
                                className="mt-4"
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center"
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                        >
                            {pokemonList.map((pokemon, index) => (
                                <motion.div
                                    key={`${pokemon.id}-${index}`}
                                    variants={itemVariants}
                                    className="w-full flex justify-center"
                                >
                                    <PokemonCard
                                        preloadedData={pokemon} // Pass complete preloaded data including sprite URL
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Loading indicator for subsequent loads */}
                    {isLoading && !initialLoading && (
                        <motion.div
                            className="flex justify-center mt-8 pb-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div
                                className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent"
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                            />
                        </motion.div>
                    )}

                    {/* Infinite scroll trigger */}
                    {hasMore && <div ref={loaderRef} className="h-20" />}

                    {/* End of results message */}
                    {!hasMore && pokemonList.length > 0 && (
                        <motion.p
                            className="text-center text-muted-foreground mt-8 pb-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            You've reached the end of the list!
                        </motion.p>
                    )}
                </>
            )}
        </div>
    );
}
