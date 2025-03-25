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
import {
    getPokemon,
    getPokemonImage,
    initializePokemon,
} from "@/services/pokemon-service";
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
 * PokemonCard - Interactive, visually rich card component for displaying Pokémon
 *
 * @param {Object} pokemon - Optional pre-loaded Pokémon data
 * @param {string|number} pokemonIdOrName - Pokémon ID or name to fetch (only used if pokemon object isn't provided)
 * @param {number} typeCount - Optional limit for how many types to use for styling
 * @param {string} customImage - Optional custom image URL to use instead of fetching
 * @param {Object} preloadedData - Optional complete preloaded data including sprite URLs (preferred approach)
 * @returns {JSX.Element} The rendered Pokémon card
 */
const PokemonCard = ({
    pokemon,
    pokemonIdOrName,
    typeCount = null,
    customImage = null,
    preloadedData = null, // New prop for pre-loaded data
}) => {
    // Component state variables
    const [isHovered, setIsHovered] = useState(false);
    const [pokemonData, setPokemonData] = useState(
        pokemon || preloadedData || null
    );
    const [imageUrl, setImageUrl] = useState(
        preloadedData?.spriteUrl || customImage || null
    );
    const [isLoadingData, setIsLoadingData] = useState(
        !preloadedData && !pokemon && !!pokemonIdOrName
    );
    const [isLoadingImage, setIsLoadingImage] = useState(
        !preloadedData?.spriteUrl && !customImage
    );
    const [error, setError] = useState(false);
    const [isReady, setIsReady] = useState(!!pokemon || !!preloadedData);

    // Add this after your cardKey useState:
    // Ensure customImage is initialized
    const [imageSource, setImageSource] = useState(customImage);

    /**
     * Unique identifier for tracking card transitions
     */
    const [cardKey, setCardKey] = useState(() => {
        if (pokemon) {
            initializePokemon(pokemon, customImage);
        }
        return (
            preloadedData?.id ||
            pokemon?.id ||
            pokemon?.name ||
            pokemonIdOrName ||
            Date.now().toString()
        );
    });

    /**
     * Updates card when the Pokémon changes
     */
    useEffect(() => {
        const newKey =
            preloadedData?.id ||
            pokemon?.id ||
            pokemon?.name ||
            pokemonIdOrName ||
            Date.now().toString();
        setCardKey(newKey);

        setImageSource(customImage);

        if (
            (pokemon?.id ||
                pokemon?.name ||
                preloadedData?.id ||
                preloadedData?.name) !== (pokemonData?.id || pokemonData?.name)
        ) {
            setIsReady(!!pokemon || !!preloadedData);
            setPokemonData(pokemon || preloadedData || null);
            setIsLoadingData(!preloadedData && !pokemon && !!pokemonIdOrName);
            setError(false);
            setImageUrl(preloadedData?.spriteUrl || customImage || null);
            setIsLoadingImage(!preloadedData?.spriteUrl && !customImage);
        }
    }, [pokemon, pokemonIdOrName, customImage, preloadedData]);

    /**
     * Main data fetching effect - Loads Pokémon data
     * Skip if preloadedData is provided
     */
    useEffect(() => {
        if (pokemon || preloadedData) {
            setPokemonData(pokemon || preloadedData);
            setIsLoadingData(false);
            // Only set ready if we also have image (for preloadedData) or after image loads (for pokemon)
            if (preloadedData?.spriteUrl || customImage) {
                setIsReady(true);
            }
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
    }, [pokemon, pokemonIdOrName, preloadedData, customImage]);

    /**
     * Secondary fetch effect - Loads Pokémon image
     * Skip if preloadedData.spriteUrl is provided
     */
    useEffect(() => {
        if (!pokemonData) {
            setIsLoadingImage(false);
            return;
        }

        // If we have a preloaded sprite URL or custom image, use it directly
        if (preloadedData?.spriteUrl || customImage) {
            setImageUrl(preloadedData?.spriteUrl || customImage);
            setIsLoadingImage(false);
            setIsReady(true);
            return;
        }

        const loadPokemonImage = async () => {
            setIsLoadingImage(true);

            try {
                // Get the image URL
                const fetchedImage = await getPokemonImage(
                    pokemonData.name,
                    pokemonData.id
                );
                setImageUrl(fetchedImage);
            } catch (error) {
                console.error("Error loading Pokemon image:", error);
                setImageUrl(POKE_BALL); // Fallback to default image
            } finally {
                setIsLoadingImage(false);
                // Set ready state after both data and image are loaded
                setIsReady(true);
            }
        };

        loadPokemonImage();
    }, [pokemonData, imageSource, preloadedData, customImage]);

    /**
     * Animation configuration
     */

    // Main card animation
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

    // Pokemon image animation
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
     * Card mount/unmount animations
     */
    const containerVariants = {
        exit: {
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.2, ease: "easeIn" },
        },
        enter: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3, ease: "easeOut" },
        },
    };

    /**
     * Extracts type information for styling
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
     * Render component with conditional states
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
                    className="will-change-transform rounded-xl"
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
                    className="will-change-transform rounded-xl"
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
                    className="will-change-transform rounded-xl"
                >
                    <motion.div
                        initial="initial"
                        whileHover="hover"
                        variants={cardVariants}
                        onHoverStart={() => setIsHovered(true)}
                        onHoverEnd={() => setIsHovered(false)}
                        className="will-change-transform perspective-1000 rounded-xl"
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
