"use client";

import { POKE_BALL } from "@/lib/pokemon-api";
import {
    getBackgroundStyle,
    getBorderStyle,
    getTypeStyle,
} from "@/lib/pokemon-styles";
import { getPokemon, getPokemonImage } from "@/services/pokemon-service";
import { AnimatePresence, motion } from "framer-motion";
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
 * PokemonCard - An animated, interactive card component displaying Pokémon information
 *
 * This component handles multiple states (loading, error, ready) with smooth transitions
 * between them using Framer Motion. The card features type-based styling, hover animations,
 * and responsive visual feedback. It can either receive a pre-loaded Pokémon object or
 * fetch data from the API based on a provided ID or name.
 *
 * The component implements:
 * - Smooth state transitions with AnimatePresence
 * - Dynamic styling based on Pokémon types
 * - Hover animations with variant propagation
 * - Proper loading and error states
 * - Responsive image loading with fallbacks
 *
 * @param {Object} pokemon - Optional pre-loaded Pokemon data object. Takes precedence over pokemonIdOrName.
 *                           Should contain: id, name, weight, height, and types[].
 * @param {string|number} pokemonIdOrName - Pokemon ID or name to fetch data for when pokemon object isn't provided.
 * @param {number} typeCount - Optional override for number of types to display (default: actual type count, max 3).
 *                             Useful for custom Pokémon with specific type counts.
 * @returns {JSX.Element} The rendered PokemonCard with appropriate animations and state handling
 */
const PokemonCard = ({ pokemon, pokemonIdOrName, typeCount = null }) => {
    // UI and data states
    const [isHovered, setIsHovered] = useState(false);
    const [pokemonData, setPokemonData] = useState(pokemon || null);
    const [imageUrl, setImageUrl] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(!!pokemonIdOrName);
    const [isLoadingImage, setIsLoadingImage] = useState(true);
    const [error, setError] = useState(false);
    const [isReady, setIsReady] = useState(!!pokemon);

    /**
     * Generate a unique key for the card based on the current Pokémon
     * This is critical for AnimatePresence to properly track and animate each Pokémon card
     * as they enter and exit the DOM, especially during transitions between different Pokémon
     */
    const [cardKey, setCardKey] = useState(() => {
        return (
            pokemon?.id ||
            pokemon?.name ||
            pokemonIdOrName ||
            Date.now().toString()
        );
    });

    /**
     * Reset states and update the cardKey when props change
     * This effect runs whenever pokemon or pokemonIdOrName changes to:
     * 1. Generate a new key to force AnimatePresence to treat this as a new card
     * 2. Reset data states if we're changing to a different Pokémon
     *
     * The comparison logic ensures we only reset states when actually changing Pokémon,
     * not on other re-renders.
     */
    useEffect(() => {
        // Generate a new key to force AnimatePresence to treat this as a new card
        const newKey =
            pokemon?.id ||
            pokemon?.name ||
            pokemonIdOrName ||
            Date.now().toString();
        setCardKey(newKey);

        // Only reset data if we're changing to a different Pokemon
        if (
            (pokemon?.id || pokemon?.name) !==
            (pokemonData?.id || pokemonData?.name)
        ) {
            setIsReady(!!pokemon);
            setPokemonData(pokemon || null);
            setIsLoadingData(!!pokemonIdOrName);
            setError(false);
            setImageUrl(null);
        }
    }, [pokemon, pokemonIdOrName]);

    /**
     * Fetch Pokemon data if not provided directly
     * This effect handles:
     * 1. Using provided pokemon object directly if available
     * 2. Fetching data from API when only ID/name is provided
     * 3. Setting appropriate loading and error states
     *
     * The isReady state remains false until both data and image are loaded
     */
    useEffect(() => {
        if (pokemon) {
            setPokemonData(pokemon);
            setIsLoadingData(false);
            setIsReady(true); // Mark as ready immediately for direct data
            return;
        }

        if (!pokemonIdOrName) {
            setIsLoadingData(false);
            return;
        }

        const loadPokemonData = async () => {
            setIsLoadingData(true);
            setError(false);
            setIsReady(false); // Reset ready state when loading starts

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

    /**
     * Fetch Pokemon image once we have data
     * This effect runs after pokemonData is loaded to:
     * 1. Get the image URL for the Pokémon
     * 2. Handle loading state for the image separately
     * 3. Set fallback image if needed
     * 4. Set isReady to true only after BOTH data AND image are loaded
     *
     * This two-phase loading ensures we don't show partial content
     */
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
                // Set ready state after both data and image are loaded
                setIsReady(true);
            }
        };

        loadPokemonImage();
    }, [pokemonData]);

    /**
     * Animation variants - Each of these defines how a specific part of the card
     * should animate in different states (initial, hover, etc.)
     *
     * The variants system in Framer Motion allows animation states to propagate
     * down through children, creating coordinated animations across the card.
     */

    // Main card animations (lift and shadow on hover)
    const cardVariants = {
        initial: {
            y: 0,
            boxShadow: "0px 0px 0px rgba(0,0,0,0)",
        },
        hover: {
            y: -8,
            boxShadow: "0px 10px 15px rgba(0,0,0,0.2)",
            transition: {
                duration: 0.3,
                ease: "easeOut",
            },
        },
    };

    // Pokemon image animations (scale and wiggle on hover)
    const imageVariants = {
        initial: {
            scale: 1,
            rotate: 0,
        },
        hover: {
            scale: 1.05,
            rotate: [0, -1, 1, -1, 1, 0], // Array creates keyframe animation
            transition: {
                scale: { duration: 0.2 },
                rotate: {
                    duration: 1,
                    repeat: 1,
                    repeatType: "mirror",
                },
            },
        },
    };

    // Badge animations (slightly enlarge on hover)
    const badgeVariants = {
        initial: { scale: 1 },
        hover: {
            scale: 1.05,
            transition: {
                duration: 0.2,
                delay: 0.1,
            },
        },
    };

    // Accent fade out animations
    const accentVariants = {
        initial: { opacity: 1 },
        hover: {
            opacity: 0,
            transition: { duration: 0.4 },
        },
    };

    // Border reveal animation
    const borderVariants = {
        initial: { opacity: 0 },
        hover: {
            opacity: 1,
            transition: { duration: 0.4 },
        },
    };

    /**
     * Card appearance/exit animations - These control how the card
     * enters and exits the DOM during state transitions
     *
     * These are used with AnimatePresence to create smooth transitions
     * between loading, error, and ready states
     */
    const containerVariants = {
        exit: {
            opacity: 0,
            scale: 0.95,
            transition: {
                duration: 0.2,
                ease: "easeIn",
            },
        },
        enter: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.3,
                ease: "easeOut",
            },
        },
    };

    /**
     * Calculate styling parameters for the Pokémon card based on types
     * - effectiveTypeCount: Determines which styling logic to use (1, 2, or 3 types)
     * - typeColors: Array of type names converted to lowercase for CSS
     * - primaryType/secondaryType/tertiaryType: Used for various styling elements
     */
    const effectiveTypeCount = pokemonData
        ? typeCount !== null
            ? typeCount
            : Math.min(pokemonData.types.length, 3)
        : 1;

    const typeColors = pokemonData
        ? pokemonData.types.map((type) => type.toLowerCase())
        : ["normal"];

    const primaryType = typeColors[0] || "normal";
    const secondaryType = typeColors[1] || primaryType;
    const tertiaryType = typeColors[2] || secondaryType;

    // Render the component with AnimatePresence for smooth transitions between states
    return (
        <AnimatePresence mode="wait">
            {/* 
              LOADING STATE
              Shows when data is being fetched from the API
              Displays a spinning animation inside a skeleton loader
              Animates in and out with opacity transitions
            */}
            {isLoadingData && (
                <motion.div
                    key={`loading-${cardKey}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="will-change-transform"
                >
                    <Card
                        data-slot="card"
                        className="w-[300px] h-[480px] rounded-xl p-5 bg-gray-800 flex items-center justify-center border-0"
                    >
                        <Skeleton className="size-48 rounded-full flex items-center justify-center bg-gray-700/50">
                            <motion.div
                                animate={{
                                    rotate: 360,
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                                className="rounded-full size-12 border-t-2 border-b-2 border-white"
                            />
                        </Skeleton>
                    </Card>
                </motion.div>
            )}

            {/* 
              ERROR STATE
              Shows when API fetch fails or Pokémon isn't found
              Displays a gently rocking Pokéball with error message
              Animates in and out with opacity and vertical movement
            */}
            {!isLoadingData && (error || (!pokemonData && !isLoadingData)) && (
                <motion.div
                    key={`error-${cardKey}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="will-change-transform"
                >
                    <Card
                        data-slot="card"
                        className="w-[300px] h-[480px] rounded-xl p-5 bg-gray-800 flex flex-col items-center justify-center"
                    >
                        <motion.img
                            src={POKE_BALL}
                            alt="Pokéball"
                            className="size-24 mb-4 opacity-50"
                            initial={{ rotate: 0 }}
                            animate={{ rotate: [0, 10, 0, -10, 0] }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "mirror",
                                ease: "easeInOut",
                            }}
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
                </motion.div>
            )}

            {/* 
              READY STATE - POKEMON CARD
              Shows when data and image are both successfully loaded
              Features interactive hover animations and type-based styling
              
              The structure consists of:
              1. Outer motion.div with enter/exit animations
              2. Inner motion.div with hover animations
              3. Card with background styling based on Pokémon types
              4. Various animated elements (corners, borders, badges, etc.)
              5. Content sections with Pokémon details
            */}
            {!isLoadingData && !error && pokemonData && isReady && (
                <motion.div
                    key={`card-${cardKey}`}
                    variants={containerVariants}
                    initial="exit"
                    animate="enter"
                    exit="exit"
                    className="will-change-transform"
                >
                    <motion.div
                        initial="initial"
                        whileHover="hover"
                        variants={cardVariants}
                        onHoverStart={() => setIsHovered(true)}
                        onHoverEnd={() => setIsHovered(false)}
                        className="will-change-transform perspective-1000"
                    >
                        <Card
                            data-slot="card"
                            className="w-[300px] h-[480px] rounded-xl p-5 overflow-hidden border-0 relative"
                            style={getBackgroundStyle(
                                effectiveTypeCount,
                                pokemonData.types
                            )}
                        >
                            {/* Top-left corner accent - Fades out on hover */}
                            <motion.div
                                variants={accentVariants}
                                className="absolute top-0 left-0 size-[90px] rounded-tl-xl pointer-events-none"
                                style={{
                                    boxShadow:
                                        effectiveTypeCount === 1
                                            ? `inset 4px 4px 0 0 rgb(from var(--color-pokemon-${primaryType}) r g b / 0.5)`
                                            : effectiveTypeCount === 2
                                            ? `inset 4px 4px 0 0 rgb(from var(--color-pokemon-${primaryType}) r g b / 0.7)`
                                            : `inset 4px 4px 0 0 rgb(from var(--color-pokemon-${primaryType}) r g b / 0.6)`,
                                    filter: "blur(2px)",
                                    maskImage:
                                        "linear-gradient(135deg, rgba(0,0,0,1) 5%, rgba(0,0,0,0.9) 10%, rgba(0,0,0,0.8) 15%, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.4) 35%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.2) 45%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.05) 60%, transparent 70%)",
                                    WebkitMaskImage:
                                        "linear-gradient(135deg, rgba(0,0,0,1) 5%, rgba(0,0,0,0.9) 10%, rgba(0,0,0,0.8) 15%, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.4) 35%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.2) 45%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.05) 60%, transparent 70%)",
                                }}
                            />

                            {/* Bottom-right corner accent - Fades out on hover */}
                            <motion.div
                                variants={accentVariants}
                                className="absolute bottom-0 right-0 size-[90px] rounded-br-xl pointer-events-none"
                                style={{
                                    boxShadow:
                                        effectiveTypeCount === 1
                                            ? `inset -4px -4px 0 0 rgb(from var(--color-pokemon-${primaryType}) r g b / 0.5)`
                                            : effectiveTypeCount === 2
                                            ? `inset -4px -4px 0 0 rgb(from var(--color-pokemon-${secondaryType}) r g b / 0.7)`
                                            : `inset -4px -4px 0 0 rgb(from var(--color-pokemon-${tertiaryType}) r g b / 0.6)`,
                                    filter: "blur(2px)",
                                    maskImage:
                                        "linear-gradient(315deg, rgba(0,0,0,1) 5%, rgba(0,0,0,0.9) 10%, rgba(0,0,0,0.8) 15%, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.4) 35%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.2) 45%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.05) 60%, transparent 70%)",
                                    WebkitMaskImage:
                                        "linear-gradient(315deg, rgba(0,0,0,1) 5%, rgba(0,0,0,0.9) 10%, rgba(0,0,0,0.8) 15%, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.4) 35%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.2) 45%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.05) 60%, transparent 70%)",
                                }}
                            />

                            {/* Side accents - Only for triple-type Pokémon */}
                            {effectiveTypeCount === 3 && (
                                <>
                                    <motion.div
                                        variants={accentVariants}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-[180px] pointer-events-none z-[2] opacity-70"
                                        style={{
                                            borderRight: `4px solid rgb(from var(--color-pokemon-${secondaryType}) r g b / 0.15)`,
                                            boxShadow: `0 0 10px 2px rgb(from var(--color-pokemon-${secondaryType}) r g b / 0.08)`,
                                            filter: "blur(3px)",
                                            maskImage:
                                                "linear-gradient(to left, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 80%, transparent 100%)",
                                            WebkitMaskImage:
                                                "linear-gradient(to left, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 80%, transparent 100%)",
                                        }}
                                    />
                                    <motion.div
                                        variants={accentVariants}
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[180px] pointer-events-none z-[2] opacity-70"
                                        style={{
                                            borderLeft: `4px solid rgb(from var(--color-pokemon-${secondaryType}) r g b / 0.15)`,
                                            boxShadow: `0 0 10px 2px rgb(from var(--color-pokemon-${secondaryType}) r g b / 0.08)`,
                                            filter: "blur(3px)",
                                            maskImage:
                                                "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 80%, transparent 100%)",
                                            WebkitMaskImage:
                                                "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 80%, transparent 100%)",
                                        }}
                                    />
                                </>
                            )}

                            {/* Hover border effect - Appears on hover */}
                            <motion.div
                                variants={borderVariants}
                                className="absolute inset-0 rounded-xl border-4 border-transparent pointer-events-none overflow-hidden"
                                style={{
                                    ...getBorderStyle(
                                        effectiveTypeCount,
                                        pokemonData.types
                                    ),
                                    WebkitMask:
                                        "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
                                    WebkitMaskComposite: "xor",
                                    maskComposite: "exclude",
                                    clipPath: "inset(0 0 0 0 round 0.75rem)",
                                }}
                            />

                            {/* Card content - Main structure with Pokémon details */}
                            <div className="relative z-[1] h-full flex flex-col justify-between">
                                {/* ID Badge - Top left */}
                                <CardHeader className="p-0 m-0">
                                    <motion.div variants={badgeVariants}>
                                        <Badge
                                            data-slot="badge"
                                            variant="outline"
                                            className="absolute top-0 left-0 bg-black/60 text-white font-bold py-1 px-2 rounded-lg border-0"
                                        >
                                            #{pokemonData.id}
                                        </Badge>
                                    </motion.div>
                                </CardHeader>

                                {/* Main content area with image and name */}
                                <CardContent
                                    data-slot="content"
                                    className="p-0 flex-1 flex flex-col items-center justify-center"
                                >
                                    {/* Image container with circular background */}
                                    <div className="size-[180px] bg-[rgba(61,61,61,0.7)] rounded-full mx-auto mt-8 mb-5 flex items-center justify-center relative overflow-hidden">
                                        {isLoadingImage ? (
                                            <Skeleton className="size-[150px] rounded-full flex items-center justify-center">
                                                <motion.div
                                                    animate={{
                                                        rotate: 360,
                                                    }}
                                                    transition={{
                                                        duration: 1.5,
                                                        repeat: Infinity,
                                                        ease: "linear",
                                                    }}
                                                    className="rounded-full size-12 border-t-2 border-b-2 border-white"
                                                />
                                            </Skeleton>
                                        ) : (
                                            <motion.img
                                                variants={imageVariants}
                                                src={imageUrl || POKE_BALL}
                                                alt={pokemonData.name}
                                                className="size-[150px] object-contain"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = POKE_BALL;
                                                }}
                                            />
                                        )}

                                        {/* Subtle circular glow effect behind the image */}
                                        <motion.div
                                            className="absolute inset-0 rounded-full pointer-events-none z-[-1]"
                                            initial={{ opacity: 0.3 }}
                                            variants={{
                                                hover: {
                                                    opacity: 0.6,
                                                    boxShadow: `inset 0 0 20px 5px rgb(from var(--color-pokemon-${primaryType}) r g b / 0.3)`,
                                                    transition: {
                                                        duration: 0.3,
                                                    },
                                                },
                                            }}
                                        />
                                    </div>

                                    {/* Pokémon name */}
                                    <motion.div
                                        className="text-center text-2xl font-bold my-2 text-white"
                                        variants={{
                                            hover: {
                                                scale: 1.05,
                                                y: -2,
                                                transition: { duration: 0.2 },
                                            },
                                        }}
                                    >
                                        {pokemonData.name}
                                    </motion.div>

                                    {/* Stats area (weight and height) */}
                                    <div className="flex justify-around w-full my-4">
                                        <motion.div
                                            className="flex flex-col items-center"
                                            variants={{
                                                hover: {
                                                    y: -3,
                                                    transition: {
                                                        duration: 0.2,
                                                        delay: 0.1,
                                                    },
                                                },
                                            }}
                                        >
                                            <div className="text-gray-400 text-sm">
                                                Weight
                                            </div>
                                            <div className="text-lg font-bold mt-1 text-white">
                                                {pokemonData.weight} kg
                                            </div>
                                        </motion.div>
                                        <motion.div
                                            className="flex flex-col items-center"
                                            variants={{
                                                hover: {
                                                    y: -3,
                                                    transition: {
                                                        duration: 0.2,
                                                        delay: 0.15,
                                                    },
                                                },
                                            }}
                                        >
                                            <div className="text-gray-400 text-sm">
                                                Height
                                            </div>
                                            <div className="text-lg font-bold mt-1 text-white">
                                                {pokemonData.height} m
                                            </div>
                                        </motion.div>
                                    </div>
                                </CardContent>

                                {/* Type badges at the bottom of the card */}
                                <CardFooter
                                    data-slot="footer"
                                    className="p-0 flex justify-center gap-2 mt-4 mb-4 flex-wrap"
                                >
                                    {pokemonData.types
                                        .slice(0, 3)
                                        .map((type, index) => (
                                            <motion.div
                                                key={index}
                                                variants={{
                                                    hover: {
                                                        y: -3,
                                                        scale: 1.05,
                                                        transition: {
                                                            duration: 0.2,
                                                            delay: 0.05 * index, // Staggered animation
                                                        },
                                                    },
                                                }}
                                            >
                                                <Badge
                                                    data-slot="badge"
                                                    variant="outline"
                                                    className="font-bold text-sm rounded-full py-1 px-4 border-0"
                                                    style={getTypeStyle(type)}
                                                >
                                                    {type}
                                                </Badge>
                                            </motion.div>
                                        ))}
                                </CardFooter>
                            </div>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PokemonCard;
