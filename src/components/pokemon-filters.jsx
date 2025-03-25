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
    availableTypes = [], // For pre-loaded types
}) {
    // Local state for UI elements, NOT mirroring the props
    const [isOpen, setIsOpen] = useState(false);
    const [activeAccordion, setActiveAccordion] = useState(["types"]);
    const [isLoadingTypes, setIsLoadingTypes] = useState(
        availableTypes.length === 0
    );
    const [types, setTypes] = useState(availableTypes);

    // IMPORTANT: We don't duplicate the filter state locally anymore
    // This breaks the infinite update loop

    // Fetch types if not provided
    useEffect(() => {
        if (availableTypes && availableTypes.length > 0) {
            setTypes(availableTypes);
            setIsLoadingTypes(false);
            return;
        }

        const loadTypes = async () => {
            setIsLoadingTypes(true);
            try {
                const fetchedTypes = await getPokemonTypes();
                setTypes(fetchedTypes);
            } catch (error) {
                console.error("Error loading Pokémon types:", error);
                setTypes([]);
            } finally {
                setIsLoadingTypes(false);
            }
        };

        loadTypes();
    }, [availableTypes]);

    // Handle type selection - directly call the parent's callback
    const toggleType = (type) => {
        const newTypes = selectedTypes.includes(type)
            ? selectedTypes.filter((t) => t !== type)
            : [...selectedTypes, type];

        onFilterChange?.({
            types: newTypes,
            generation: selectedGeneration,
            game: selectedGame,
        });
    };

    // Clear all filters - directly call the parent's callback
    const clearFilters = () => {
        onFilterChange?.({
            types: [],
            generation: null,
            game: null,
        });
    };

    // Count active filters
    const activeFilterCount =
        selectedTypes.length +
        (selectedGeneration ? 1 : 0) +
        (selectedGame ? 1 : 0);

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
                                            {selectedTypes.length > 0 && (
                                                <Badge
                                                    variant="primary"
                                                    className="ml-2"
                                                >
                                                    {selectedTypes.length}
                                                </Badge>
                                            )}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        {isLoadingTypes ? (
                                            <div className="flex justify-center py-4">
                                                <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {types.map((type) => (
                                                    <Badge
                                                        key={type.name}
                                                        variant={
                                                            selectedTypes.includes(
                                                                type.name
                                                            )
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                        className={`cursor-pointer capitalize ${
                                                            selectedTypes.includes(
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
                                                            toggleType(
                                                                type.name
                                                            )
                                                        }
                                                    >
                                                        {selectedTypes.includes(
                                                            type.name
                                                        ) && (
                                                            <Check className="h-3 w-3 mr-1" />
                                                        )}
                                                        {type.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Generations filter */}
                                <AccordionItem value="generations">
                                    <AccordionTrigger>
                                        <div className="flex items-center">
                                            <span>Generation</span>
                                            {selectedGeneration && (
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
                                                        selectedGeneration ===
                                                        gen.id
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                    className="cursor-pointer"
                                                    onClick={() => {
                                                        const newGeneration =
                                                            selectedGeneration ===
                                                            gen.id
                                                                ? null
                                                                : gen.id;

                                                        onFilterChange?.({
                                                            types: selectedTypes,
                                                            generation:
                                                                newGeneration,
                                                            game: selectedGame,
                                                        });
                                                    }}
                                                >
                                                    {selectedGeneration ===
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
                                            {selectedGame && (
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
                                            value={selectedGame || "all"}
                                            onValueChange={(value) => {
                                                const newGame =
                                                    value === "all"
                                                        ? null
                                                        : value;

                                                onFilterChange?.({
                                                    types: selectedTypes,
                                                    generation:
                                                        selectedGeneration,
                                                    game: newGame,
                                                });
                                            }}
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
