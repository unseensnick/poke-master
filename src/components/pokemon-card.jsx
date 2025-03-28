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
import { clearCache } from "@/services/pokemon-service";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";

// UI components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner, Skeleton } from "@/components/ui/loading-spinner";

// Custom hook
import { usePokemon } from "@/hooks/use-pokemon";

// Animation variants
import {
    fadeVariants,
    hoverVariants,
    pokemonCardVariants,
} from "@/lib/animation-variants";

/**
 * Pokémon card with type-based styling and animations
 */
const PokemonCard = ({
    pokemon,
    pokemonIdOrName,
    typeCount = null,
    customImage = null,
    preloadedData = null,
}) => {
    const {
        pokemonData,
        imageUrl,
        isLoadingData,
        isLoadingImage,
        error,
        isReady,
        cardKey,
    } = usePokemon({
        pokemon,
        pokemonIdOrName,
        customImage,
        preloadedData,
    });

    const [isHovered, setIsHovered] = useState(false);

    // Get type information for styling
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

    return (
        <AnimatePresence mode="wait">
            {/* LOADING STATE */}
            {isLoadingData && (
                <motion.div
                    key={`loading-${cardKey}`}
                    variants={fadeVariants.standard}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="will-change-transform rounded-xl"
                >
                    <Card
                        data-slot="card"
                        className="w-[300px] h-[480px] rounded-xl p-5 bg-card flex items-center justify-center border-0"
                    >
                        <Skeleton className="size-48 rounded-full flex items-center justify-center bg-muted/50">
                            <LoadingSpinner size="md" />
                        </Skeleton>
                    </Card>
                </motion.div>
            )}

            {/* ERROR STATE */}
            {!isLoadingData && (error || (!pokemonData && !isLoadingData)) && (
                <motion.div
                    key={`error-${cardKey}`}
                    variants={fadeVariants.fadeUp}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="will-change-transform rounded-xl"
                >
                    <Card
                        data-slot="card"
                        className="w-[300px] h-[480px] rounded-xl p-5 bg-card flex flex-col items-center justify-center"
                    >
                        <ErrorMessage
                            message={`Pokémon Not Found${
                                pokemonIdOrName ? `: ${pokemonIdOrName}` : ""
                            }`}
                            variant="warning"
                            action={
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => clearCache()}
                                >
                                    Clear Cache
                                </Button>
                            }
                        />
                    </Card>
                </motion.div>
            )}

            {/* READY STATE - Loaded Pokemon card */}
            {!isLoadingData && !error && pokemonData && isReady && (
                <motion.div
                    key={`card-${cardKey}`}
                    variants={pokemonCardVariants.container}
                    initial="exit"
                    animate="enter"
                    exit="exit"
                    className="will-change-transform rounded-xl"
                >
                    <motion.div
                        initial="initial"
                        whileHover="hover"
                        variants={pokemonCardVariants.card}
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
                            {/* Visual accents */}
                            <motion.div
                                variants={pokemonCardVariants.accent}
                                className="absolute top-0 left-0 size-[90px] rounded-tl-xl pointer-events-none"
                                style={getTopLeftAccentStyle(
                                    effectiveTypeCount,
                                    primaryType
                                )}
                            />

                            <motion.div
                                variants={pokemonCardVariants.accent}
                                className="absolute bottom-0 right-0 size-[90px] rounded-br-xl pointer-events-none"
                                style={getBottomRightAccentStyle(
                                    effectiveTypeCount,
                                    primaryType,
                                    secondaryType,
                                    tertiaryType
                                )}
                            />

                            {/* Side accents for triple-type Pokemon */}
                            {effectiveTypeCount === 3 && (
                                <>
                                    <motion.div
                                        variants={pokemonCardVariants.accent}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-[180px] pointer-events-none z-[2] opacity-70"
                                        style={getRightSideAccentStyle(
                                            secondaryType
                                        )}
                                    />
                                    <motion.div
                                        variants={pokemonCardVariants.accent}
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[180px] pointer-events-none z-[2] opacity-70"
                                        style={getLeftSideAccentStyle(
                                            secondaryType
                                        )}
                                    />
                                </>
                            )}

                            {/* Animated border */}
                            <motion.div
                                variants={pokemonCardVariants.border}
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

                            {/* Card content */}
                            <div className="relative z-[1] h-full flex flex-col justify-between">
                                {/* ID Badge */}
                                <CardHeader className="p-0 m-0">
                                    <motion.div
                                        variants={pokemonCardVariants.badge}
                                    >
                                        <Badge
                                            data-slot="badge"
                                            variant="outline"
                                            className="absolute top-0 left-0 bg-black/60 text-white font-bold py-1 px-2 rounded-lg border-0"
                                        >
                                            #{pokemonData.id}
                                        </Badge>
                                    </motion.div>
                                </CardHeader>

                                {/* Pokemon details */}
                                <CardContent
                                    data-slot="content"
                                    className="p-0 flex-1 flex flex-col items-center justify-center"
                                >
                                    {/* Pokemon image */}
                                    <div className="size-[180px] bg-[rgba(61,61,61,0.7)] rounded-full mx-auto mt-8 mb-5 flex items-center justify-center relative overflow-hidden">
                                        {isLoadingImage ? (
                                            <Skeleton className="size-[150px] rounded-full flex items-center justify-center">
                                                <LoadingSpinner
                                                    size="sm"
                                                    color="muted"
                                                />
                                            </Skeleton>
                                        ) : (
                                            <motion.img
                                                variants={
                                                    pokemonCardVariants.image
                                                }
                                                src={imageUrl || POKE_BALL}
                                                alt={pokemonData.name}
                                                className="size-[150px] object-contain"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = POKE_BALL;
                                                }}
                                            />
                                        )}

                                        {/* Type-colored glow */}
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

                                    {/* Pokemon name */}
                                    <motion.div
                                        className="text-center text-2xl font-bold my-2 text-white"
                                        variants={hoverVariants.scaleLift}
                                    >
                                        {pokemonData.name}
                                    </motion.div>

                                    {/* Stats */}
                                    <div className="flex justify-around w-full my-4">
                                        <motion.div
                                            className="flex flex-col items-center"
                                            variants={pokemonCardVariants.stats}
                                            custom={0.1}
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
                                            variants={pokemonCardVariants.stats}
                                            custom={0.15}
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

                                {/* Type badges */}
                                <CardFooter
                                    data-slot="footer"
                                    className="p-0 flex justify-center gap-2 mt-4 mb-4 flex-wrap"
                                >
                                    {pokemonData.types
                                        .slice(0, 3)
                                        .map((type, index) => (
                                            <motion.div
                                                key={index}
                                                variants={
                                                    pokemonCardVariants.typeBadge
                                                }
                                                custom={index}
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
