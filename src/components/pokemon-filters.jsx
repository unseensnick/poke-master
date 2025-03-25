"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { GAMES, GENERATIONS } from "@/lib/pokemon-constants";
import { getPokemonTypes } from "@/services/pokemon-service";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { useEffect, useState } from "react";

export function PokemonFilters({
    onFilterChange,
    selectedTypes = [],
    selectedGeneration = null,
    selectedGame = null,
    className = "",
}) {
    // Local state for all filters
    const [types, setTypes] = useState([]);
    const [localSelectedTypes, setLocalSelectedTypes] = useState(selectedTypes);
    const [localSelectedGeneration, setLocalSelectedGeneration] =
        useState(selectedGeneration);
    const [localSelectedGame, setLocalSelectedGame] = useState(selectedGame);
    const [isOpen, setIsOpen] = useState(false);
    const [activeAccordion, setActiveAccordion] = useState(["types"]);

    // Fetch Pokémon types on component mount
    useEffect(() => {
        const loadTypes = async () => {
            try {
                const fetchedTypes = await getPokemonTypes();
                setTypes(fetchedTypes);
            } catch (error) {
                console.error("Error loading Pokémon types:", error);
                setTypes([]);
            }
        };

        loadTypes();
    }, []);

    // Update parent component when filters change
    useEffect(() => {
        onFilterChange?.({
            types: localSelectedTypes,
            generation: localSelectedGeneration,
            game: localSelectedGame,
        });
    }, [
        localSelectedTypes,
        localSelectedGeneration,
        localSelectedGame,
        onFilterChange,
    ]);

    // Handle type selection
    const toggleType = (type) => {
        setLocalSelectedTypes((prev) => {
            if (prev.includes(type)) {
                return prev.filter((t) => t !== type);
            } else {
                return [...prev, type];
            }
        });
    };

    // Clear all filters
    const clearFilters = () => {
        setLocalSelectedTypes([]);
        setLocalSelectedGeneration(null);
        setLocalSelectedGame(null);
        // We don't reset sort order when clearing filters
    };

    // Count active filters
    const activeFilterCount =
        localSelectedTypes.length +
        (localSelectedGeneration ? 1 : 0) +
        (localSelectedGame ? 1 : 0);

    return (
        <div className={`w-full ${className}`}>
            {/* Filter toggle button */}
            <div className="flex items-center justify-between mb-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1"
                >
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                    {activeFilterCount > 0 && (
                        <Badge variant="primary" className="ml-1">
                            {activeFilterCount}
                        </Badge>
                    )}
                    {isOpen ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                    ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                </Button>

                {activeFilterCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-muted-foreground"
                    >
                        Clear All
                    </Button>
                )}
            </div>

            {/* Filter panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mb-6 border rounded-md bg-card"
                    >
                        <div className="p-4">
                            {/* Filter accordion */}
                            <Accordion
                                type="multiple"
                                value={activeAccordion}
                                onValueChange={setActiveAccordion}
                                className="w-full"
                            >
                                {/* Types filter */}
                                <AccordionItem value="types">
                                    <AccordionTrigger>
                                        <div className="flex items-center">
                                            <span>Types</span>
                                            {localSelectedTypes.length > 0 && (
                                                <Badge
                                                    variant="primary"
                                                    className="ml-2"
                                                >
                                                    {localSelectedTypes.length}
                                                </Badge>
                                            )}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {types.map((type) => (
                                                <Badge
                                                    key={type.name}
                                                    variant={
                                                        localSelectedTypes.includes(
                                                            type.name
                                                        )
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                    className={`cursor-pointer capitalize ${
                                                        localSelectedTypes.includes(
                                                            type.name
                                                        )
                                                            ? "bg-pokemon-" +
                                                              type.name.toLowerCase() +
                                                              " hover:bg-pokemon-" +
                                                              type.name.toLowerCase() +
                                                              "/90"
                                                            : "hover:bg-muted"
                                                    }`}
                                                    onClick={() =>
                                                        toggleType(type.name)
                                                    }
                                                >
                                                    {localSelectedTypes.includes(
                                                        type.name
                                                    ) && (
                                                        <Check className="h-3 w-3 mr-1" />
                                                    )}
                                                    {type.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Generations filter */}
                                <AccordionItem value="generations">
                                    <AccordionTrigger>
                                        <div className="flex items-center">
                                            <span>Generation</span>
                                            {localSelectedGeneration && (
                                                <Badge
                                                    variant="primary"
                                                    className="ml-2"
                                                >
                                                    1
                                                </Badge>
                                            )}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {GENERATIONS.map((gen) => (
                                                <Badge
                                                    key={gen.id}
                                                    variant={
                                                        localSelectedGeneration ===
                                                        gen.id
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                    className="cursor-pointer"
                                                    onClick={() =>
                                                        setLocalSelectedGeneration(
                                                            localSelectedGeneration ===
                                                                gen.id
                                                                ? null
                                                                : gen.id
                                                        )
                                                    }
                                                >
                                                    {localSelectedGeneration ===
                                                        gen.id && (
                                                        <Check className="h-3 w-3 mr-1" />
                                                    )}
                                                    {gen.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Games filter */}
                                <AccordionItem value="games">
                                    <AccordionTrigger>
                                        <div className="flex items-center">
                                            <span>Games</span>
                                            {localSelectedGame && (
                                                <Badge
                                                    variant="primary"
                                                    className="ml-2"
                                                >
                                                    1
                                                </Badge>
                                            )}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <Select
                                            value={localSelectedGame || "all"}
                                            onValueChange={(value) =>
                                                setLocalSelectedGame(
                                                    value === "all"
                                                        ? null
                                                        : value
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a game" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All Games
                                                </SelectItem>
                                                {GAMES.map((game) => (
                                                    <SelectItem
                                                        key={game.id}
                                                        value={game.id}
                                                    >
                                                        {game.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
