"use client";

import PokemonCard from "@/components/pokemon-card";
import { PokemonFilters } from "@/components/pokemon-filters";
import { PokemonSort } from "@/components/pokemon-sort";
import { Button } from "@/components/ui/button";
import { GAMES, GENERATIONS } from "@/lib/pokemon-constants"; // Import shared constants
import { getPokemon, getPokemonList } from "@/services/pokemon-service";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export default function ExplorePage() {
    // Get search parameters from URL
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("search") || "";

    // State for Pokemon data and pagination
    const [pokemonList, setPokemonList] = useState([]);
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

    // Function to sort Pokemon list based on the selected sort order
    const sortPokemonList = (list, order) => {
        return [...list].sort((a, b) => {
            switch (order) {
                case "id-asc":
                    // Convert string IDs to numbers for proper numeric sorting
                    return (
                        parseInt(a.id.replace(/\D/g, "")) -
                        parseInt(b.id.replace(/\D/g, ""))
                    );
                case "id-desc":
                    return (
                        parseInt(b.id.replace(/\D/g, "")) -
                        parseInt(a.id.replace(/\D/g, ""))
                    );
                case "name-asc":
                    return a.name.localeCompare(b.name);
                case "name-desc":
                    return b.name.localeCompare(a.name);
                default:
                    return 0;
            }
        });
    };

    // Enhanced Pokemon filtering function
    const applyFilters = async (pokemonList) => {
        // If no filters are active, return the original list
        if (
            selectedTypes.length === 0 &&
            !selectedGeneration &&
            !selectedGame
        ) {
            return pokemonList;
        }

        // Filter by generation if selected
        let filteredList = pokemonList;

        if (selectedGeneration) {
            // Find the generation's range
            const generation = GENERATIONS.find(
                (gen) => gen.id === selectedGeneration
            );
            if (generation) {
                const [minId, maxId] = generation.range;
                filteredList = filteredList.filter((pokemon) => {
                    // Extract numeric ID (ignoring padding)
                    const id = parseInt(pokemon.id.replace(/\D/g, ""));
                    return id >= minId && id <= maxId;
                });
            }
        }

        // Filter by game if selected (using matching generation as a proxy)
        if (selectedGame) {
            const game = GAMES.find((g) => g.id === selectedGame);
            if (game) {
                // Find the generation range for this game
                const gameGeneration = GENERATIONS.find(
                    (gen) => gen.id === game.generation
                );
                if (gameGeneration) {
                    const [minId, maxId] = gameGeneration.range;
                    filteredList = filteredList.filter((pokemon) => {
                        const id = parseInt(pokemon.id.replace(/\D/g, ""));
                        return id >= minId && id <= maxId;
                    });
                }
            }
        }

        // Filter by type if selected
        if (selectedTypes.length > 0) {
            // For type filtering, we need to fetch the full Pokemon data
            // This can be expensive for large lists, so we'll do it in batches
            const MAX_CONCURRENT = 10; // Maximum concurrent API requests
            const filteredByType = [];

            // Process in batches to avoid overwhelming the API
            for (let i = 0; i < filteredList.length; i += MAX_CONCURRENT) {
                const batch = filteredList.slice(i, i + MAX_CONCURRENT);

                // Fetch full Pokemon data for this batch
                const promises = batch.map((pokemon) =>
                    getPokemon(pokemon.name).catch(() => null)
                );

                const fullPokemonData = await Promise.all(promises);

                // Filter Pokemon that match all selected types
                for (let j = 0; j < fullPokemonData.length; j++) {
                    const pokemon = fullPokemonData[j];
                    if (!pokemon) continue;

                    // Check if this Pokemon has all the selected types
                    const pokemonTypes = pokemon.types.map((type) =>
                        type.toLowerCase()
                    );
                    const matchesAllTypes = selectedTypes.every((type) =>
                        pokemonTypes.includes(type.toLowerCase())
                    );

                    if (matchesAllTypes) {
                        filteredByType.push(batch[j]);
                    }
                }

                // Add a small delay to be nice to the API
                if (i + MAX_CONCURRENT < filteredList.length) {
                    await new Promise((resolve) => setTimeout(resolve, 100));
                }
            }

            filteredList = filteredByType;
        }

        return filteredList;
    };

    // Reset and reload when filters or search query changes
    useEffect(() => {
        setPokemonList([]);
        setOffset(0);
        setHasMore(true);
        setInitialLoading(true);

        loadPokemon(0);
    }, [
        selectedTypes,
        selectedGeneration,
        selectedGame,
        sortOrder,
        searchQuery,
    ]);

    // Load Pokemon data function with enhanced filtering
    const loadPokemon = async (currentOffset) => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            let newPokemon = [];

            // Handle search query if present
            if (searchQuery) {
                try {
                    const searchLower = searchQuery.toLowerCase();

                    // Only try exact match if search term is at least 3 characters
                    if (searchLower.length >= 3) {
                        try {
                            // Try to get the specific Pokemon, but suppress 404 errors
                            const exactMatch = await getPokemon(
                                searchLower,
                                true
                            );
                            if (exactMatch) {
                                newPokemon.push({
                                    id: exactMatch.id,
                                    name: exactMatch.name,
                                });
                            }
                        } catch (e) {
                            // No exact match, that's fine - continue with partial matching
                        }
                    }

                    // Then look for partial matches
                    const pokemonList = await getPokemonList(100, 0);

                    // Filter for Pokemon whose names contain the search string
                    const matchingPokemon = pokemonList.filter((pokemon) =>
                        pokemon.name.toLowerCase().includes(searchLower)
                    );

                    // If we found partial matches and don't have an exact match already
                    if (matchingPokemon.length > 0 && newPokemon.length === 0) {
                        newPokemon = [...matchingPokemon];
                    }

                    // If we still have no results and the search is numeric, try by ID
                    if (
                        newPokemon.length === 0 &&
                        !isNaN(searchLower) &&
                        searchLower.length <= 4
                    ) {
                        try {
                            const pokemonById = await getPokemon(
                                parseInt(searchLower)
                            );
                            if (pokemonById) {
                                newPokemon.push({
                                    id: pokemonById.id,
                                    name: pokemonById.name,
                                });
                            }
                        } catch (e) {
                            // No results by ID either, that's fine
                        }
                    }
                } catch (e) {
                    // If all search attempts fail, show no results
                    console.log("Search failed completely:", e);
                    newPokemon = [];
                }
            } else {
                // Normal list loading without search
                newPokemon = await getPokemonList(
                    ITEMS_PER_PAGE,
                    currentOffset
                );
            }

            // Apply filters to the Pokemon list
            let filteredPokemon = newPokemon;

            // Only apply filters if we have Pokemon and filters are selected
            if (
                newPokemon.length > 0 &&
                (selectedTypes.length > 0 || selectedGeneration || selectedGame)
            ) {
                filteredPokemon = await applyFilters(newPokemon);
            }

            if (filteredPokemon.length === 0) {
                setHasMore(false);
            } else {
                // Apply sorting to the filtered Pokemon list
                const sortedPokemon = sortPokemonList(
                    filteredPokemon,
                    sortOrder
                );

                // Update the state with sorted and filtered Pokemon
                setPokemonList((prev) => {
                    // For first load or search reset, just use the sorted new pokemon
                    if (currentOffset === 0) {
                        return sortedPokemon;
                    }
                    // For pagination, combine with previous and sort the whole list
                    else {
                        return sortPokemonList(
                            [...prev, ...sortedPokemon],
                            sortOrder
                        );
                    }
                });

                // Only increment offset for pagination if we're not searching and have enough results
                if (
                    !searchQuery &&
                    filteredPokemon.length >= ITEMS_PER_PAGE / 2
                ) {
                    setOffset(currentOffset + ITEMS_PER_PAGE);
                } else {
                    // When searching or filtering returns few results, we don't want pagination
                    setHasMore(false);
                }
            }
        } catch (error) {
            console.error("Error loading Pokémon:", error);
        } finally {
            setIsLoading(false);
            setInitialLoading(false);
        }
    };

    // Load more Pokemon when scrolling
    const loadMorePokemon = useCallback(() => {
        // We'll allow infinite scrolling to work regardless of filters now
        if (!isLoading && hasMore && !searchQuery) {
            loadPokemon(offset);
        }
    }, [isLoading, hasMore, offset, searchQuery]);

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

    // Animation variants
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
                                        pokemonIdOrName={pokemon.name}
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
                    {hasMore && !searchQuery && (
                        <div ref={loaderRef} className="h-20" />
                    )}

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
