"use client";

import PokemonCard from "@/components/pokemon-card";
import { getExplorePageData } from "@/services/pokemon-service";
import { useEffect, useState } from "react";

/**
 * Showcases PokemonCard component variations with different data sources
 */
export default function DemoPage() {
    const [preloadedPokemon, setPreloadedPokemon] = useState({
        pikachu: null,
        bulbasaur: null,
    });
    const [isLoading, setIsLoading] = useState(true);

    // Custom Pokémon with triple-type configuration
    const elementrio = {
        id: "????",
        name: "Elementrio",
        weight: "45.2",
        height: "1.3",
        types: ["Water", "Fire", "Electric"],
    };

    useEffect(() => {
        async function loadDemoPokemon() {
            setIsLoading(true);
            try {
                // Fetch both Pokémon in parallel
                const [pikachuData, bulbasaurData] = await Promise.all([
                    getExplorePageData({
                        searchQuery: "pikachu",
                        limit: 1,
                        includeFullData: true,
                    }),
                    getExplorePageData({
                        searchQuery: "bulbasaur",
                        limit: 1,
                        includeFullData: true,
                    }),
                ]);

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
                    {/* Electric-type Pokémon (Pikachu) */}
                    <div>
                        <div className="text-center text-lg font-bold mb-4 text-muted-foreground">
                            Electric Type (Pikachu)
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

                    {/* Grass/Poison dual-type Pokémon (Bulbasaur) */}
                    <div>
                        <div className="text-center text-lg font-bold mb-4 text-muted-foreground">
                            Grass/Poison Type (Bulbasaur)
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

                    {/* Custom triple-type Pokémon */}
                    <div>
                        <div className="text-center text-lg font-bold mb-4 text-muted-foreground">
                            Custom Triple-Type (Elementrio)
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
