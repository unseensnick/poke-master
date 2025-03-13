"use client";

import { POKE_BALL } from "@/lib/pokemon-api";
import {
    extractTypeInfo,
    getBackgroundStyle,
    getBorderStyle,
    getBottomRightAccentStyle,
    getImageGlowStyle,
    getLeftSideAccentStyle,
    getRightSideAccentStyle,
    getTopLeftAccentStyle,
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
 * PokemonCard - Interactive, animated card for displaying Pokémon with type-based styling
 *
 * This component shows details about a Pokémon with visual styles based on its type(s).
 * It features smooth animations, loading states, and hover effects.
 *
 * Key features:
 * - Shows Pokemon image, name, ID, weight, height, and types
 * - Colors and styles change based on Pokemon's type(s)
 * - Animated hover effects with coordinated animations across card elements
 * - Loading spinner while fetching data
 * - Error state with helpful message if Pokemon can't be found
 * - Can either fetch Pokemon data automatically or use pre-loaded data
 *
 * @param {Object} pokemon - Optional pre-loaded Pokemon data (contains id, name, weight, height, types[])
 * @param {string|number} pokemonIdOrName - Pokemon ID or name to fetch (only used if pokemon object isn't provided)
 * @param {number} typeCount - Optional override for how many types to use for styling (default: auto, max 3)
 * @returns {JSX.Element} The rendered Pokemon card
 */
const PokemonCard = ({ pokemon, pokemonIdOrName, typeCount = null }) => {
    // Component state variables
    const [isHovered, setIsHovered] = useState(false); // Tracks if card is being hovered
    const [pokemonData, setPokemonData] = useState(pokemon || null); // Stores Pokemon information
    const [imageUrl, setImageUrl] = useState(null); // URL to Pokemon's image
    const [isLoadingData, setIsLoadingData] = useState(!!pokemonIdOrName); // If we're fetching Pokemon data
    const [isLoadingImage, setIsLoadingImage] = useState(true); // If we're loading the image
    const [error, setError] = useState(false); // If data fetch encountered an error
    const [isReady, setIsReady] = useState(!!pokemon); // If both data and image are ready

    /**
     * A unique identifier for this card instance
     *
     * This key helps Framer Motion's AnimatePresence track card elements
     * when they need to be added/removed from the DOM, ensuring smooth animations
     * when a card changes to display a different Pokemon.
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
     * Updates card when the Pokemon changes
     *
     * This effect handles:
     * - Generating a new card key for animation tracking
     * - Resetting state values to show loading states
     * - Only resets when actually changing to a different Pokemon
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
     * Fetches Pokemon data when needed
     *
     * This effect either:
     * - Uses the provided Pokemon object directly (if available)
     * - Or fetches data from the API using the provided ID/name
     *
     * It also handles loading states and error handling.
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
     * Fetches Pokemon image after we have the Pokemon data
     *
     * We load the image in a separate step to:
     * - Show a loading spinner while image loads
     * - Use a fallback Pokeball image if load fails
     * - Only mark the card as ready when both data AND image are loaded
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
     * Animation configuration
     *
     * Framer Motion uses "variants" to define how elements should animate.
     * Each variant defines an animation state (like "initial" or "hover").
     *
     * When a parent element changes state, the change automatically propagates
     * to children, creating coordinated animations across the card.
     */

    // Main card animation (lifts up and adds shadow on hover)
    const cardVariants = {
        initial: {
            y: 0,
            boxShadow: "0px 0px 0px rgba(0,0,0,0)",
        },
        hover: {
            y: -8, // Move up 8px
            boxShadow: "0px 10px 15px rgba(0,0,0,0.2)",
            transition: {
                duration: 0.3,
                ease: "easeOut",
            },
        },
    };

    // Pokemon image animation (scales up and wiggles on hover)
    const imageVariants = {
        initial: {
            scale: 1,
            rotate: 0,
        },
        hover: {
            scale: 1.05,
            rotate: [0, -1, 1, -1, 1, 0], // Sequence creates wiggle effect
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

    // Animations for card elements
    const badgeVariants = {
        initial: { scale: 1 },
        hover: { scale: 1.05, transition: { duration: 0.2, delay: 0.1 } },
    };

    const accentVariants = {
        initial: { opacity: 1 },
        hover: { opacity: 0, transition: { duration: 0.4 } },
    };

    const borderVariants = {
        initial: { opacity: 0 },
        hover: { opacity: 1, transition: { duration: 0.4 } },
    };

    /**
     * Animations for card entering and exiting the DOM
     *
     * These control how the card appears and disappears when switching
     * between loading, error, and ready states.
     */
    const containerVariants = {
        exit: {
            // When card is being removed
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.2, ease: "easeIn" },
        },
        enter: {
            // When card is being added
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3, ease: "easeOut" },
        },
    };

    /**
     * Get Pokemon type information for styling
     *
     * This extracts standardized type information, which is used
     * throughout the card for consistent type-based styling.
     */
    const typeInfo = pokemonData
        ? extractTypeInfo(pokemonData, typeCount)
        : {
              effectiveTypeCount: 1,
              primaryType: "normal",
              secondaryType: "normal",
              tertiaryType: "normal",
          };

    const { effectiveTypeCount, primaryType, secondaryType, tertiaryType } =
        typeInfo;

    /**
     * Render different card states based on loading/error status
     *
     * The AnimatePresence component handles smooth transitions between
     * the three possible states: loading, error, and ready
     */
    return (
        <AnimatePresence mode="wait">
            {/* LOADING STATE - Shows spinner while fetching data */}
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

            {/* ERROR STATE - Shows message when Pokemon can't be found */}
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

            {/* READY STATE - Displays the fully loaded Pokemon card */}
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
                            {/* Visual accents - Add depth with type-based colors */}
                            <motion.div
                                variants={accentVariants}
                                className="absolute top-0 left-0 size-[90px] rounded-tl-xl pointer-events-none"
                                style={getTopLeftAccentStyle(
                                    effectiveTypeCount,
                                    primaryType
                                )}
                            />

                            {/* Bottom-right accent */}
                            <motion.div
                                variants={accentVariants}
                                className="absolute bottom-0 right-0 size-[90px] rounded-br-xl pointer-events-none"
                                style={getBottomRightAccentStyle(
                                    effectiveTypeCount,
                                    primaryType,
                                    secondaryType,
                                    tertiaryType
                                )}
                            />

                            {/* Side accents - Only shown for triple-type Pokemon */}
                            {effectiveTypeCount === 3 && (
                                <>
                                    <motion.div
                                        variants={accentVariants}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-[180px] pointer-events-none z-[2] opacity-70"
                                        style={getRightSideAccentStyle(
                                            secondaryType
                                        )}
                                    />
                                    <motion.div
                                        variants={accentVariants}
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[180px] pointer-events-none z-[2] opacity-70"
                                        style={getLeftSideAccentStyle(
                                            secondaryType
                                        )}
                                    />
                                </>
                            )}

                            {/* Animated border - Appears on hover */}
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

                            {/* Main Card Content */}
                            <div className="relative z-[1] h-full flex flex-col justify-between">
                                {/* Pokemon ID badge */}
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

                                {/* Pokemon image and details */}
                                <CardContent
                                    data-slot="content"
                                    className="p-0 flex-1 flex flex-col items-center justify-center"
                                >
                                    {/* Pokemon image with animated container */}
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

                                        {/* Type-colored glow effect (appears on hover) */}
                                        <motion.div
                                            className="absolute inset-0 rounded-full pointer-events-none z-[-1]"
                                            initial={{ opacity: 0.3 }}
                                            variants={{
                                                hover: {
                                                    opacity: 0.6,
                                                    ...getImageGlowStyle(
                                                        primaryType
                                                    ),
                                                    transition: {
                                                        duration: 0.3,
                                                    },
                                                },
                                            }}
                                        />
                                    </div>

                                    {/* Pokemon name - animates on hover */}
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

                                    {/* Basic stats - weight and height */}
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

                                {/* Type badges - color-coded for each Pokemon type */}
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
