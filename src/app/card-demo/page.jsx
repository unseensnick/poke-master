"use client";

import PokemonCard from "@/components/pokemon-card";
import { getExplorePageData } from "@/services/pokemon-service";
import { useEffect, useState } from "react";

export default function DemoPage() {
    // State to hold our preloaded Pokémon data
    const [preloadedPokemon, setPreloadedPokemon] = useState({
        pikachu: null,
        bulbasaur: null,
    });
    const [isLoading, setIsLoading] = useState(true);

    // Custom Pokémon definition (this doesn't need to change)
    const elementrio = {
        id: "????",
        name: "Elementrio",
        weight: "45.2",
        height: "1.3",
        types: ["Water", "Fire", "Electric"],
    };

    // Load Pokémon data on component mount
    useEffect(() => {
        async function loadDemoPokemon() {
            setIsLoading(true);
            try {
                // Use our consolidated data fetching to get both Pokémon at once
                const pikachuData = await getExplorePageData({
                    searchQuery: "pikachu",
                    limit: 1,
                    includeTypes: false,
                    includeFullData: true,
                });

                const bulbasaurData = await getExplorePageData({
                    searchQuery: "bulbasaur",
                    limit: 1,
                    includeTypes: false,
                    includeFullData: true,
                });

                setPreloadedPokemon({
                    pikachu: pikachuData.pokemonList?.[0] || null,
                    bulbasaur: bulbasaurData.pokemonList?.[0] || null,
                });
            } catch (error) {
                console.error("Error loading demo Pokémon:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadDemoPokemon();
    }, []);

    return (
        <div className="flex-1">
            <h1 className="text-3xl font-bold text-center mb-10">
                Pokémon Card Showcase
            </h1>
            <div className="container mx-auto px-4">
                <div className="flex flex-wrap justify-center gap-10">
                    {/* Using preloaded data (optimized server action approach) */}
                    <div>
                        <div className="text-center text-lg font-bold mb-4 text-muted-foreground">
                            Preloaded Data (Single-Type)
                        </div>
                        {isLoading ? (
                            <div className="h-[480px] w-[300px] flex items-center justify-center bg-card rounded-xl">
                                <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                            </div>
                        ) : (
                            <PokemonCard
                                preloadedData={preloadedPokemon.pikachu}
                            />
                        )}
                    </div>

                    {/* Using preloaded data (optimized server action approach) */}
                    <div>
                        <div className="text-center text-lg font-bold mb-4 text-muted-foreground">
                            Preloaded Data (Dual-Type)
                        </div>
                        {isLoading ? (
                            <div className="h-[480px] w-[300px] flex items-center justify-center bg-card rounded-xl">
                                <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                            </div>
                        ) : (
                            <PokemonCard
                                preloadedData={preloadedPokemon.bulbasaur}
                            />
                        )}
                    </div>

                    {/* Custom Pokémon (this doesn't use the database) */}
                    <div>
                        <div className="text-center text-lg font-bold mb-4 text-muted-foreground">
                            Custom Pokémon (Triple-Type)
                        </div>
                        <PokemonCard
                            pokemon={elementrio}
                            customImage="/Elementrio.png"
                            typeCount={3}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
