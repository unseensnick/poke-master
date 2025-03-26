"use client";

import PokemonCard from "@/components/pokemon-card";
import {
    getFeaturedPokemon,
    getHomePageData,
} from "@/services/pokemon-service";
import { useEffect, useState } from "react";

/**
 * Displays a grid of featured Pokemon
 *
 * @param {Object} props - Component props
 * @param {Array} props.initialPokemon - Pre-loaded Pokemon data
 * @param {number} props.maxDisplay - Maximum number to show
 * @param {string} props.title - Section title
 * @param {string} props.desc - Section description
 * @returns {JSX.Element} Featured Pokemon section
 */
export function FeaturedPokemon({
    initialPokemon = [],
    maxDisplay = 4,
    title = "Featured Pokémon",
    desc = "Check out some of the most popular Pokémon in our database!",
}) {
    // State for Pokemon data and loading state
    const [featuredPokemon, setFeaturedPokemon] = useState(initialPokemon);
    const [isLoading, setIsLoading] = useState(initialPokemon.length === 0);
    const [hasFetched, setHasFetched] = useState(initialPokemon.length > 0);

    // Load featured Pokemon if not provided
    useEffect(() => {
        // Skip if we already have Pokemon or already fetched
        if (hasFetched) {
            return;
        }

        async function loadFeaturedPokemon() {
            setIsLoading(true);
            try {
                // Try to get complete data from home page data
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

                // Fall back to direct featured Pokemon API if home data fails
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
                {/* Heading */}
                <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
                    {title}
                </h1>

                {/* Description */}
                <p className="text-lg md:text-xl text-foreground/80 mb-10">
                    {desc}
                </p>

                {/* Pokemon cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
                    {isLoading
                        ? // Loading placeholders
                          Array.from({ length: maxDisplay }).map((_, index) => (
                              <div key={`loading-${index}`}>
                                  <PokemonCard pokemonIdOrName={null} />
                              </div>
                          ))
                        : // Actual Pokemon cards
                          featuredPokemon.map((pokemon) => (
                              <PokemonCard
                                  key={pokemon.id || pokemon.name}
                                  preloadedData={pokemon} // Pass data with sprite URL
                              />
                          ))}
                </div>
            </div>
        </div>
    );
}

export default FeaturedPokemon;
