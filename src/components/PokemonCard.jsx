"use client";

import React, { useEffect, useState } from "react";

// ================= Helper Functions =================

// Type color utility using CSS variables instead of hardcoded RGB values
const getTypeColor = (type) => {
    // Return CSS variable reference for later use with dynamic styles
    return `var(--color-${type?.toLowerCase() || "normal"})`;
};

// Helper to get color with opacity
const getColorWithOpacity = (color, opacity) => {
    if (typeof color === "string" && color.startsWith("var")) {
        // Return a CSS variable with opacity
        return `rgb(from ${color} r g b / ${opacity})`;
    } else if (typeof color === "string" && color.startsWith("rgb")) {
        return color.replace("rgb", "rgba").replace(")", `, ${opacity})`);
    }
    return color;
};

// Different type badge styling
const getTypeStyle = (type) => {
    // Maps type to background and text color using Tailwind classes
    const typeLower = type?.toLowerCase() || "normal";
    return {
        backgroundColor: `var(--color-${typeLower})`,
        color: "white",
    };
};

// Background style based on Pokémon's actual types
const getBackgroundStyle = (typeCount, types = []) => {
    // Convert type names to lowercase for CSS variable reference
    const typeColors = types.map((type) => type?.toLowerCase() || "normal");

    if (typeCount === 1) {
        // Single type - use a subtle gradient of the same color with different opacities
        const type = typeColors[0] || "normal";
        return {
            background: `linear-gradient(170deg, rgb(from var(--color-${type}) r g b / 0.08) 0%, rgb(from var(--color-${type}) r g b / 0.15) 100%)`,
        };
    } else if (typeCount === 2) {
        // Two types - gradient between both types
        const type1 = typeColors[0] || "normal";
        const type2 = typeColors[1] || type1;
        return {
            background: `linear-gradient(170deg, rgb(from var(--color-${type1}) r g b / 0.15) 0%, rgb(from var(--color-${type2}) r g b / 0.15) 100%)`,
        };
    } else if (typeCount >= 3) {
        // Three or more types - gradient across three types
        const type1 = typeColors[0] || "normal";
        const type2 = typeColors[1] || type1;
        const type3 = typeColors[2] || type2;
        return {
            background: `linear-gradient(170deg, rgb(from var(--color-${type1}) r g b / 0.10) 0%, rgb(from var(--color-${type2}) r g b / 0.10) 50%, rgb(from var(--color-${type3}) r g b / 0.10) 100%)`,
        };
    }

    // Fallback
    return {
        background: `linear-gradient(170deg, rgb(from var(--color-normal) r g b / 0.08) 0%, rgb(from var(--color-normal) r g b / 0.15) 100%)`,
    };
};

// Border style based on Pokémon's actual types
const getBorderStyle = (typeCount, types = []) => {
    // Convert type names to lowercase for CSS variable reference
    const typeColors = types.map((type) => type?.toLowerCase() || "normal");

    if (typeCount === 1) {
        // Single type - gradient between lighter and darker shade of same color
        const type = typeColors[0] || "normal";
        return {
            background: `linear-gradient(to bottom right, var(--color-${type}), rgb(from var(--color-${type}) r g b / 0.7)) border-box`,
        };
    } else if (typeCount === 2) {
        // Two types - gradient between both types
        const type1 = typeColors[0] || "normal";
        const type2 = typeColors[1] || type1;
        return {
            background: `linear-gradient(to bottom right, var(--color-${type1}), var(--color-${type2})) border-box`,
        };
    } else if (typeCount >= 3) {
        // Three or more types - complex gradient across three types
        const type1 = typeColors[0] || "normal";
        const type2 = typeColors[1] || type1;
        const type3 = typeColors[2] || type2;
        return {
            background: `linear-gradient(135deg, var(--color-${type1}) 0%, var(--color-${type1}) 25%, var(--color-${type2}) 40%, var(--color-${type2}) 60%, var(--color-${type3}) 75%, var(--color-${type3}) 100%) border-box`,
        };
    }

    // Fallback
    return {
        background: `linear-gradient(to bottom right, var(--color-normal), rgb(from var(--color-normal) r g b / 0.7)) border-box`,
    };
};

// ================= PokemonCard Component =================

const PokemonCard = ({ pokemon, pokemonIdOrName, typeCount = null }) => {
    // State management for the component
    const [isHovered, setIsHovered] = useState(false);
    const [pokemonData, setPokemonData] = useState(pokemon || null);
    const [imageUrl, setImageUrl] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(!!pokemonIdOrName);
    const [isLoadingImage, setIsLoadingImage] = useState(true);
    const [error, setError] = useState(false);

    // Constants for fallback images
    const POKE_BALL =
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
    const MASTER_BALL =
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png";

    // Effect to fetch Pokemon data if ID or name is provided
    useEffect(() => {
        // If pokemon object is provided directly, use that
        if (pokemon) {
            setPokemonData(pokemon);
            setIsLoadingData(false);
            return;
        }

        // If no ID/name provided, do nothing
        if (!pokemonIdOrName) {
            setIsLoadingData(false);
            return;
        }

        // Fetch pokemon data from API
        const fetchPokemon = async () => {
            setIsLoadingData(true);
            setError(false);

            try {
                const response = await fetch(
                    `https://pokeapi.co/api/v2/pokemon/${pokemonIdOrName
                        .toString()
                        .toLowerCase()}`
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch Pokémon: ${response.status}`
                    );
                }

                const data = await response.json();

                const formattedPokemon = {
                    id: data.id.toString().padStart(3, "0"),
                    name:
                        data.name.charAt(0).toUpperCase() + data.name.slice(1),
                    weight: (data.weight / 10).toFixed(1), // Convert to kg
                    height: (data.height / 10).toFixed(1), // Convert to m
                    types: data.types.map(
                        (type) =>
                            type.type.name.charAt(0).toUpperCase() +
                            type.type.name.slice(1)
                    ),
                };

                setPokemonData(formattedPokemon);
                setIsLoadingData(false);
            } catch (error) {
                console.error("Error fetching Pokémon data:", error);
                setError(true);
                setIsLoadingData(false);
            }
        };

        fetchPokemon();
    }, [pokemon, pokemonIdOrName]);

    // Effect to fetch Pokemon image once we have data
    useEffect(() => {
        if (!pokemonData) {
            setIsLoadingImage(false);
            return;
        }

        // Special case for fictional Pokemon
        if (pokemonData.id === "???") {
            setImageUrl(MASTER_BALL);
            setIsLoadingImage(false);
            return;
        }

        const fetchPokemonImage = async () => {
            setIsLoadingImage(true);

            try {
                const response = await fetch(
                    `https://pokeapi.co/api/v2/pokemon/${pokemonData.name.toLowerCase()}`
                );
                const data = await response.json();

                const fetchedImage =
                    data.sprites.other["official-artwork"].front_default ||
                    data.sprites.front_default ||
                    POKE_BALL;

                setImageUrl(fetchedImage);
                setIsLoadingImage(false);
            } catch (error) {
                console.error("Error fetching Pokemon image:", error);
                setImageUrl(POKE_BALL);
                setIsLoadingImage(false);
            }
        };

        fetchPokemonImage();
    }, [pokemonData]);

    // Handle loading state
    if (isLoadingData) {
        return (
            <div className="relative w-[300px] h-[480px] rounded-[20px] p-5 bg-gray-800 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    // Handle error state
    if (error || (!pokemonData && !isLoadingData)) {
        return (
            <div className="relative w-[300px] h-[480px] rounded-[20px] p-5 bg-gray-800 flex flex-col items-center justify-center">
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
            </div>
        );
    }

    // If there's no data (and no error/loading), render nothing
    if (!pokemonData) return null;

    // Calculate the effective type count (use provided value or calculate from types)
    const effectiveTypeCount =
        typeCount !== null ? typeCount : Math.min(pokemonData.types.length, 3);

    // Get the lowercase type names for CSS references
    const typeColors = pokemonData.types.map((type) => type.toLowerCase());
    const primaryType = typeColors[0] || "normal";
    const secondaryType = typeColors[1] || primaryType;
    const tertiaryType = typeColors[2] || secondaryType;

    // Render the full card
    return (
        <div
            className="relative w-[300px] h-[480px] rounded-[20px] p-5 transition-all duration-300 hover:-translate-y-[10px] hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)]"
            style={getBackgroundStyle(effectiveTypeCount, pokemonData.types)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Top-left corner */}
            <div
                className={`absolute top-0 left-0 size-[90px] rounded-tl-[20px] transition-opacity duration-500 pointer-events-none ${
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

            {/* Bottom-right corner */}
            <div
                className={`absolute bottom-0 right-0 size-[90px] rounded-br-[20px] transition-opacity duration-500 pointer-events-none ${
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

            {/* Middle sides (only for triple type card) */}
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

            {/* Full border on hover */}
            <div
                className={`absolute inset-0 rounded-[20px] border-4 border-transparent transition-opacity duration-500 pointer-events-none ${
                    isHovered ? "opacity-100" : "opacity-0"
                }`}
                style={{
                    ...getBorderStyle(effectiveTypeCount, pokemonData.types),
                    WebkitMask:
                        "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                }}
            />

            {/* Card content */}
            <div className="relative z-[1] h-full flex flex-col justify-between">
                <div className="absolute top-0 left-0 bg-black/60 text-white font-bold py-[5px] px-[10px] rounded-[15px]">
                    #{pokemonData.id}
                </div>

                <div className="size-[180px] bg-[rgba(61,61,61,0.7)] rounded-full mx-auto mt-[30px] mb-[20px] flex items-center justify-center">
                    {isLoadingImage ? (
                        <div className="size-[150px] flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                        </div>
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

                <div className="text-center text-[28px] font-bold my-[10px] text-white">
                    {pokemonData.name}
                </div>

                <div className="flex justify-around my-[15px]">
                    <div className="flex flex-col items-center">
                        <div className="text-[#aaa] text-[16px]">Weight</div>
                        <div className="text-[20px] font-bold mt-[5px] text-white">
                            {pokemonData.weight} kg
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="text-[#aaa] text-[16px]">Height</div>
                        <div className="text-[20px] font-bold mt-[5px] text-white">
                            {pokemonData.height} m
                        </div>
                    </div>
                </div>

                <div
                    className={`flex justify-center gap-[10px] mt-[15px] mb-[15px] flex-wrap`}
                >
                    {pokemonData.types.slice(0, 3).map((type, index) => (
                        <div
                            key={index}
                            className="font-bold text-[14px] rounded-[50px]"
                            style={{
                                ...getTypeStyle(type),
                                padding: "6px 16px",
                            }}
                        >
                            {type}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PokemonCard;
