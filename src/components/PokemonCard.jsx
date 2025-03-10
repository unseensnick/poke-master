"use client";

import { POKE_BALL } from "@/lib/pokemon-api";
import {
    getBackgroundStyle,
    getBorderStyle,
    getTypeStyle,
} from "@/lib/pokemon-styles";
import { getPokemon, getPokemonImage } from "@/services/pokemon-service";
import React, { useEffect, useState } from "react";

// Import shadcn/ui components
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Renders a Pokemon card with dynamic styling based on Pokemon types
 *
 * @param {Object} pokemon - Optional pre-loaded Pokemon data object
 * @param {string|number} pokemonIdOrName - Pokemon ID or name to fetch data for
 * @param {number} typeCount - Optional override for number of types to display (default: actual type count)
 */
const PokemonCard = ({ pokemon, pokemonIdOrName, typeCount = null }) => {
    // UI and data states
    const [isHovered, setIsHovered] = useState(false);
    const [pokemonData, setPokemonData] = useState(pokemon || null);
    const [imageUrl, setImageUrl] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(!!pokemonIdOrName);
    const [isLoadingImage, setIsLoadingImage] = useState(true);
    const [error, setError] = useState(false);

    // Fetch Pokemon data if not provided directly
    useEffect(() => {
        if (pokemon) {
            setPokemonData(pokemon);
            setIsLoadingData(false);
            return;
        }

        if (!pokemonIdOrName) {
            setIsLoadingData(false);
            return;
        }

        const loadPokemonData = async () => {
            setIsLoadingData(true);
            setError(false);

            try {
                const data = await getPokemon(pokemonIdOrName);
                setPokemonData(data);
            } catch (error) {
                console.error("Error fetching Pokémon data:", error);
                setError(true);
            } finally {
                setIsLoadingData(false);
            }
        };

        loadPokemonData();
    }, [pokemon, pokemonIdOrName]);

    // Fetch Pokemon image once we have data
    useEffect(() => {
        if (!pokemonData) {
            setIsLoadingImage(false);
            return;
        }

        const loadPokemonImage = async () => {
            setIsLoadingImage(true);

            try {
                const imageSource = await getPokemonImage(pokemonData.name);
                setImageUrl(imageSource);
            } catch (error) {
                console.error("Error fetching Pokemon image:", error);
                setImageUrl(POKE_BALL); // Fallback to default image
            } finally {
                setIsLoadingImage(false);
            }
        };

        loadPokemonImage();
    }, [pokemonData]);

    // Render loading state
    if (isLoadingData) {
        return (
            <Card
                data-slot="card"
                className="w-[300px] h-[480px] rounded-xl p-5 bg-gray-800 flex items-center justify-center border-0"
            >
                <Skeleton className="size-48 rounded-full flex items-center justify-center bg-gray-700/50">
                    <div className="animate-spin rounded-full size-12 border-t-2 border-b-2 border-white"></div>
                </Skeleton>
            </Card>
        );
    }

    // Render error state
    if (error || (!pokemonData && !isLoadingData)) {
        return (
            <Card
                data-slot="card"
                className="w-[300px] h-[480px] rounded-xl p-5 bg-gray-800 flex flex-col items-center justify-center"
            >
                <img
                    src={POKE_BALL}
                    alt="Pokéball"
                    className="size-24 mb-4 opacity-50"
                />
                <p className="text-white text-center font-bold">
                    Pokémon Not Found
                </p>
                {pokemonIdOrName && (
                    <p className="text-gray-400 text-center mt-2">
                        {pokemonIdOrName}
                    </p>
                )}
            </Card>
        );
    }

    if (!pokemonData) return null;

    // Calculate styling parameters based on Pokemon types
    const effectiveTypeCount =
        typeCount !== null ? typeCount : Math.min(pokemonData.types.length, 3);
    const typeColors = pokemonData.types.map((type) => type.toLowerCase());
    const primaryType = typeColors[0] || "normal";
    const secondaryType = typeColors[1] || primaryType;
    const tertiaryType = typeColors[2] || secondaryType;

    // Render the full card
    return (
        <Card
            data-slot="card"
            className="w-[300px] h-[480px] rounded-xl p-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg overflow-hidden border-0 relative"
            style={getBackgroundStyle(effectiveTypeCount, pokemonData.types)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Top-left corner accent */}
            <div
                className={`absolute top-0 left-0 size-[90px] rounded-tl-xl transition-opacity duration-500 pointer-events-none ${
                    isHovered ? "opacity-0" : "opacity-100"
                }`}
                style={{
                    boxShadow:
                        effectiveTypeCount === 1
                            ? `inset 4px 4px 0 0 rgb(from var(--color-${primaryType}) r g b / 0.5)`
                            : effectiveTypeCount === 2
                            ? `inset 4px 4px 0 0 rgb(from var(--color-${primaryType}) r g b / 0.7)`
                            : `inset 4px 4px 0 0 rgb(from var(--color-${primaryType}) r g b / 0.6)`,
                    filter: "blur(2px)",
                    maskImage:
                        "linear-gradient(135deg, rgba(0,0,0,1) 5%, rgba(0,0,0,0.9) 10%, rgba(0,0,0,0.8) 15%, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.4) 35%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.2) 45%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.05) 60%, transparent 70%)",
                    WebkitMaskImage:
                        "linear-gradient(135deg, rgba(0,0,0,1) 5%, rgba(0,0,0,0.9) 10%, rgba(0,0,0,0.8) 15%, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.4) 35%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.2) 45%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.05) 60%, transparent 70%)",
                }}
            />

            {/* Bottom-right corner accent */}
            <div
                className={`absolute bottom-0 right-0 size-[90px] rounded-br-xl transition-opacity duration-500 pointer-events-none ${
                    isHovered ? "opacity-0" : "opacity-100"
                }`}
                style={{
                    boxShadow:
                        effectiveTypeCount === 1
                            ? `inset -4px -4px 0 0 rgb(from var(--color-${primaryType}) r g b / 0.5)`
                            : effectiveTypeCount === 2
                            ? `inset -4px -4px 0 0 rgb(from var(--color-${secondaryType}) r g b / 0.7)`
                            : `inset -4px -4px 0 0 rgb(from var(--color-${tertiaryType}) r g b / 0.6)`,
                    filter: "blur(2px)",
                    maskImage:
                        "linear-gradient(315deg, rgba(0,0,0,1) 5%, rgba(0,0,0,0.9) 10%, rgba(0,0,0,0.8) 15%, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.4) 35%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.2) 45%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.05) 60%, transparent 70%)",
                    WebkitMaskImage:
                        "linear-gradient(315deg, rgba(0,0,0,1) 5%, rgba(0,0,0,0.9) 10%, rgba(0,0,0,0.8) 15%, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.4) 35%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.2) 45%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.05) 60%, transparent 70%)",
                }}
            />

            {/* Side accents (only for triple type Pokemon) */}
            {effectiveTypeCount === 3 && (
                <>
                    <div
                        className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-[180px] transition-opacity duration-500 pointer-events-none z-[2] opacity-70 ${
                            isHovered ? "opacity-0" : ""
                        }`}
                        style={{
                            borderRight: `4px solid rgb(from var(--color-${secondaryType}) r g b / 0.15)`,
                            boxShadow: `0 0 10px 2px rgb(from var(--color-${secondaryType}) r g b / 0.08)`,
                            filter: "blur(3px)",
                            maskImage:
                                "linear-gradient(to left, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 80%, transparent 100%)",
                            WebkitMaskImage:
                                "linear-gradient(to left, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 80%, transparent 100%)",
                        }}
                    />
                    <div
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[180px] transition-opacity duration-500 pointer-events-none z-[2] opacity-70 ${
                            isHovered ? "opacity-0" : ""
                        }`}
                        style={{
                            borderLeft: `4px solid rgb(from var(--color-${secondaryType}) r g b / 0.15)`,
                            boxShadow: `0 0 10px 2px rgb(from var(--color-${secondaryType}) r g b / 0.08)`,
                            filter: "blur(3px)",
                            maskImage:
                                "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 80%, transparent 100%)",
                            WebkitMaskImage:
                                "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 80%, transparent 100%)",
                        }}
                    />
                </>
            )}

            {/* Hover border effect */}
            <div
                className={`absolute inset-0 rounded-xl border-4 border-transparent transition-opacity duration-500 pointer-events-none overflow-hidden ${
                    isHovered ? "opacity-100" : "opacity-0"
                }`}
                style={{
                    ...getBorderStyle(effectiveTypeCount, pokemonData.types),
                    WebkitMask:
                        "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    clipPath: "inset(0 0 0 0 round 0.75rem)",
                }}
            />

            {/* Card content */}
            <div className="relative z-[1] h-full flex flex-col justify-between">
                <CardHeader className="p-0 m-0">
                    <Badge
                        data-slot="badge"
                        variant="outline"
                        className="absolute top-0 left-0 bg-black/60 text-white font-bold py-1 px-2 rounded-lg border-0"
                    >
                        #{pokemonData.id}
                    </Badge>
                </CardHeader>

                <CardContent
                    data-slot="content"
                    className="p-0 flex-1 flex flex-col items-center justify-center"
                >
                    <div className="size-[180px] bg-[rgba(61,61,61,0.7)] rounded-full mx-auto mt-8 mb-5 flex items-center justify-center">
                        {isLoadingImage ? (
                            <Skeleton className="size-[150px] rounded-full flex items-center justify-center">
                                <div className="animate-spin rounded-full size-12 border-t-2 border-b-2 border-white"></div>
                            </Skeleton>
                        ) : (
                            <img
                                src={imageUrl || POKE_BALL}
                                alt={pokemonData.name}
                                className="size-[150px] object-contain"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = POKE_BALL;
                                }}
                            />
                        )}
                    </div>

                    <div className="text-center text-2xl font-bold my-2 text-white">
                        {pokemonData.name}
                    </div>

                    <div className="flex justify-around w-full my-4">
                        <div className="flex flex-col items-center">
                            <div className="text-gray-400 text-sm">Weight</div>
                            <div className="text-lg font-bold mt-1 text-white">
                                {pokemonData.weight} kg
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-gray-400 text-sm">Height</div>
                            <div className="text-lg font-bold mt-1 text-white">
                                {pokemonData.height} m
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter
                    data-slot="footer"
                    className="p-0 flex justify-center gap-2 mt-4 mb-4 flex-wrap"
                >
                    {pokemonData.types.slice(0, 3).map((type, index) => (
                        <Badge
                            key={index}
                            data-slot="badge"
                            variant="outline"
                            className="font-bold text-sm rounded-full py-1 px-4 border-0"
                            style={getTypeStyle(type)}
                        >
                            {type}
                        </Badge>
                    ))}
                </CardFooter>
            </div>
        </Card>
    );
};

export default PokemonCard;
