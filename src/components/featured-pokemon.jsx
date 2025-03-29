"use client";

import PokemonCard from "@/components/pokemon-card";
import {
    getFeaturedPokemon,
    getHomePageData,
} from "@/services/pokemon-service";
import { useEffect, useState } from "react";

/**
 * Featured Pokemon grid with preload fallback pattern
 */
export function FeaturedPokemon({
    initialPokemon = [],
    maxDisplay = 4,
    title = "Featured Pokémon",
    desc = "Check out some of the most popular Pokémon in our database!",
}) {
    const [featuredPokemon, setFeaturedPokemon] = useState(initialPokemon);
    const [isLoading, setIsLoading] = useState(initialPokemon.length === 0);
    const [hasFetched, setHasFetched] = useState(initialPokemon.length > 0);

    // Load data if not provided from server
    useEffect(() => {
        if (hasFetched) {
            return;
        }

        async function loadFeaturedPokemon() {
            setIsLoading(true);
            try {
                // Try optimized multi-resource endpoint first
                const data = await getHomePageData({
                    featuredCount: maxDisplay,
                    includeFullData: true,
                });

                setFeaturedPokemon(data.featuredPokemon);
            } catch (error) {
                console.error(
                    "Error loading featured Pokemon from home data:",
                    error
                );

                // Fall back to direct featured endpoint
                try {
                    const fallbackPokemon = await getFeaturedPokemon(
                        maxDisplay
                    );
                    setFeaturedPokemon(fallbackPokemon);
                } catch (fallbackError) {
                    console.error(
                        "Error loading fallback featured Pokemon:",
                        fallbackError
                    );
                }
            } finally {
                setIsLoading(false);
                setHasFetched(true);
            }
        }

        loadFeaturedPokemon();
    }, [hasFetched, maxDisplay]);

    return (
        <div className="flex flex-col min-h-[800px] px-4 py-16 bg-card">
            <div className="max-w-7xl mx-auto text-center">
                {/* Section heading */}
                <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
                    {title}
                </h1>

                <p className="text-lg md:text-xl text-foreground/80 mb-10">
                    {desc}
                </p>

                {/* Pokemon grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
                    {isLoading
                        ? Array.from({ length: maxDisplay }).map((_, index) => (
                              <div key={`loading-${index}`}>
                                  <PokemonCard pokemonIdOrName={null} />
                              </div>
                          ))
                        : featuredPokemon.map((pokemon) => (
                              <PokemonCard
                                  key={pokemon.id || pokemon.name}
                                  preloadedData={pokemon}
                              />
                          ))}
                </div>
            </div>
        </div>
    );
}

export default FeaturedPokemon;
