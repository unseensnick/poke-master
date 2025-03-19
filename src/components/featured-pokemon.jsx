"use client";

import PokemonCard from "@/components/pokemon-card";
import { getFeaturedPokemon } from "@/services/pokemon-service";
import { useEffect, useState } from "react";

export function FeaturedPokemon({
    initialPokemon = [],
    maxDisplay = 4,
    title = "Featured Pokémon",
    desc = "Check out some of the most popular Pokémon in our database!",
}) {
    const [featuredPokemon, setFeaturedPokemon] = useState(initialPokemon);
    const [isLoading, setIsLoading] = useState(initialPokemon.length === 0);
    const [hasFetched, setHasFetched] = useState(initialPokemon.length > 0);

    useEffect(() => {
        // Skip if we already have Pokemon from props or if we've already fetched
        if (hasFetched) {
            return;
        }

        async function loadFeaturedPokemon() {
            setIsLoading(true);
            try {
                // Use our new function that handles caching
                const pokemonList = await getFeaturedPokemon(maxDisplay);
                setFeaturedPokemon(pokemonList);
            } catch (error) {
                console.error("Error loading featured Pokemon:", error);
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

                {/* Pokemon cards - Using grid for 4 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
                    {isLoading
                        ? // Show loading placeholders
                          Array.from({ length: maxDisplay }).map((_, index) => (
                              <div key={`loading-${index}`}>
                                  <PokemonCard pokemonIdOrName={null} />
                              </div>
                          ))
                        : // Show actual Pokemon cards
                          featuredPokemon.map((pokemon) => (
                              <PokemonCard
                                  key={pokemon.id || pokemon.name}
                                  pokemonIdOrName={pokemon.name || pokemon.id}
                              />
                          ))}
                </div>
            </div>
        </div>
    );
}

export default FeaturedPokemon;
