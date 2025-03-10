"use client";

import React, { useEffect, useState } from "react";

// ================= Helper Functions =================

// Type color utility from globals.css
const getTypeColor = (type) => {
    const typeMap = {
        grass: "rgb(120, 200, 80)", // --color-grass
        poison: "rgb(160, 64, 160)", // --color-poison (adjusted to match original)
        fire: "rgb(240, 128, 48)", // --color-fire
        water: "rgb(104, 144, 240)", // --color-water (adjusted to match original)
        electric: "rgb(248, 208, 48)", // --color-electric
        dragon: "rgb(112, 56, 248)", // --color-dragon
        normal: "rgb(168, 168, 120)", // --color-normal
        flying: "rgb(168, 144, 240)", // --color-flying
        bug: "rgb(168, 184, 32)", // --color-bug
        ground: "rgb(224, 192, 104)", // --color-ground
        fairy: "rgb(238, 153, 172)", // --color-fairy
        fighting: "rgb(192, 48, 40)", // --color-fighting
        psychic: "rgb(248, 88, 136)", // --color-psychic
        rock: "rgb(184, 160, 56)", // --color-rock
        steel: "rgb(184, 184, 208)", // --color-steel
        ice: "rgb(152, 216, 216)", // --color-ice
        ghost: "rgb(112, 88, 152)", // --color-ghost
        dark: "rgb(112, 88, 72)", // --color-dark
    };

    return typeMap[type?.toLowerCase()] || typeMap.normal;
};

// Helper to get color with opacity
const getColorWithOpacity = (color, opacity) => {
    if (typeof color === "string" && color.startsWith("rgb")) {
        return color.replace("rgb", "rgba").replace(")", `, ${opacity})`);
    }
    return color;
};

// Different type badge styling
const getTypeStyle = (type) => {
    switch (type?.toLowerCase()) {
        case "grass":
            return { backgroundColor: "#78C850", color: "white" };
        case "poison":
            return { backgroundColor: "#A040A0", color: "white" };
        case "electric":
            return { backgroundColor: "#F8D030", color: "white" };
        case "water":
            return { backgroundColor: "#6890F0", color: "white" };
        case "fire":
            return { backgroundColor: "#F08030", color: "white" };
        case "dragon":
            return { backgroundColor: "#7038F8", color: "white" };
        default:
            return { backgroundColor: "#A8A878", color: "white" };
    }
};

// Background style based on type count
const getBackgroundStyle = (typeCount, types = []) => {
    if (typeCount === 1) {
        return {
            background: `linear-gradient(170deg, rgba(250, 200, 60, 0.08) 0%, rgba(240, 160, 40, 0.08) 100%)`,
        };
    } else if (typeCount === 2) {
        return {
            background: `linear-gradient(170deg, rgba(${
                types[0] === "Grass" ? "120, 200, 80" : "160, 64, 160"
            }, 0.15) 0%, rgba(${
                types[1] === "Poison" ? "160, 64, 160" : "120, 200, 80"
            }, 0.15) 100%)`,
        };
    } else if (typeCount === 3) {
        return {
            background: `linear-gradient(170deg, rgba(100, 160, 255, 0.10) 0%, rgba(250, 120, 50, 0.10) 50%, rgba(248, 208, 48, 0.10) 100%)`,
        };
    }
    return {
        background: `linear-gradient(170deg, rgba(250, 200, 60, 0.08) 0%, rgba(240, 160, 40, 0.08) 100%)`,
    };
};

// Different border style based on type count
const getBorderStyle = (typeCount) => {
    if (typeCount === 1) {
        return {
            background: `linear-gradient(to bottom right, #FAC83C, #F0A028) border-box`,
        };
    } else if (typeCount === 2) {
        return {
            background: `linear-gradient(to bottom right, #78C850, #A040A0) border-box`,
        };
    } else if (typeCount === 3) {
        return {
            background: `linear-gradient(135deg, #6890F0 0%, #6890F0 25%, #F08030 40%, #F08030 60%, #F8D030 75%, #F8D030 100%) border-box`,
        };
    }
    return {
        background: `linear-gradient(to bottom right, #FAC83C, #F0A028) border-box`,
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
                            ? "inset 4px 4px 0 0 rgba(250, 200, 60, 0.5)"
                            : effectiveTypeCount === 2
                            ? "inset 4px 4px 0 0 rgba(120, 200, 80, 0.7)"
                            : "inset 4px 4px 0 0 rgba(100, 160, 255, 0.6)",
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
                            ? "inset -4px -4px 0 0 rgba(240, 160, 40, 0.5)"
                            : effectiveTypeCount === 2
                            ? "inset -4px -4px 0 0 rgba(160, 64, 160, 0.7)"
                            : "inset -4px -4px 0 0 rgba(248, 208, 48, 0.6)",
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
                            borderRight: "4px solid rgba(250, 120, 50, 0.15)",
                            boxShadow: "0 0 10px 2px rgba(250, 120, 50, 0.08)",
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
                            borderLeft: "4px solid rgba(250, 120, 50, 0.15)",
                            boxShadow: "0 0 10px 2px rgba(250, 120, 50, 0.08)",
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
                    ...getBorderStyle(effectiveTypeCount),
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
