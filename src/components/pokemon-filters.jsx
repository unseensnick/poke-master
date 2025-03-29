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
import { Check, ChevronDown, ChevronUp, Filter } from "lucide-react";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

/**
 * Type filter badge with selection state
 */
const TypeBadge = React.memo(({ type, isSelected, onToggle }) => {
    const baseClasses = "cursor-pointer capitalize";
    const selectedClasses = isSelected
        ? `bg-pokemon-${type.name.toLowerCase()} hover:bg-pokemon-${type.name.toLowerCase()}/90`
        : "hover:bg-muted";

    const handleClick = useCallback(
        (e) => {
            e.stopPropagation();
            requestAnimationFrame(() => onToggle(type.name));
        },
        [onToggle, type.name]
    );

    return (
        <Badge
            key={type.name}
            variant={isSelected ? "default" : "outline"}
            className={`${baseClasses} ${selectedClasses}`}
            onClick={handleClick}
        >
            {isSelected && <Check className="h-3 w-3 mr-1" />}
            {type.name}
        </Badge>
    );
});

TypeBadge.displayName = "TypeBadge";

/**
 * Filter panel with type, generation and game filters
 */
const PokemonFilters = React.memo(
    ({
        onFilterChange,
        selectedTypes = [],
        selectedGeneration = null,
        selectedGame = null,
        className = "",
        availableTypes = [],
    }) => {
        // Track previous filter state
        const prevFiltersRef = useRef({
            types: selectedTypes,
            generation: selectedGeneration,
            game: selectedGame,
        });

        // UI state
        const [uiState, setUiState] = useState({
            isOpen: false,
            activeAccordion: ["types"],
            isLoadingTypes: availableTypes.length === 0,
        });

        const { isOpen, activeAccordion, isLoadingTypes } = uiState;

        // State for Pokemon types
        const [types, setTypes] = useState(availableTypes);

        // Convert array to Set for faster lookups
        const selectedTypeSet = useMemo(
            () => new Set(selectedTypes),
            [selectedTypes]
        );

        // Debounce timer
        const debounceTimerRef = useRef(null);

        // Send filter changes with debouncing
        const debouncedFilterChange = useCallback(
            (filters) => {
                if (debounceTimerRef.current) {
                    clearTimeout(debounceTimerRef.current);
                }

                debounceTimerRef.current = setTimeout(() => {
                    // Only trigger if values changed
                    const prevFilters = prevFiltersRef.current;
                    const typesChanged =
                        filters.types.length !== prevFilters.types.length ||
                        filters.types.some(
                            (t) => !prevFilters.types.includes(t)
                        );
                    const genChanged =
                        filters.generation !== prevFilters.generation;
                    const gameChanged = filters.game !== prevFilters.game;

                    if (typesChanged || genChanged || gameChanged) {
                        prevFiltersRef.current = { ...filters };
                        onFilterChange(filters);
                    }
                }, 50);
            },
            [onFilterChange]
        );

        // Toggle filter panel
        const toggleOpen = useCallback(() => {
            setUiState((prev) => ({ ...prev, isOpen: !prev.isOpen }));
        }, []);

        // Update accordion sections
        const handleAccordionChange = useCallback((value) => {
            setUiState((prev) => ({ ...prev, activeAccordion: value }));
        }, []);

        // Load Pokemon types if not provided
        useEffect(() => {
            if (availableTypes && availableTypes.length > 0) {
                setTypes(availableTypes);
                setUiState((prev) => ({ ...prev, isLoadingTypes: false }));
                return;
            }

            const loadTypes = async () => {
                try {
                    const fetchedTypes = await getPokemonTypes();
                    setTypes(fetchedTypes);
                } catch (error) {
                    console.error("Error loading Pokémon types:", error);
                    setTypes([]);
                } finally {
                    setUiState((prev) => ({ ...prev, isLoadingTypes: false }));
                }
            };

            loadTypes();
        }, [availableTypes]);

        // Toggle type filter
        const toggleType = useCallback(
            (type) => {
                const newTypeSet = new Set(selectedTypes);

                if (newTypeSet.has(type)) {
                    newTypeSet.delete(type);
                } else {
                    newTypeSet.add(type);
                }

                const newTypes = Array.from(newTypeSet);

                debouncedFilterChange({
                    types: newTypes,
                    generation: selectedGeneration,
                    game: selectedGame,
                });
            },
            [
                selectedTypes,
                selectedGeneration,
                selectedGame,
                debouncedFilterChange,
            ]
        );

        // Toggle generation filter
        const toggleGeneration = useCallback(
            (genId) => {
                const newGeneration =
                    selectedGeneration === genId ? null : genId;

                debouncedFilterChange({
                    types: selectedTypes,
                    generation: newGeneration,
                    game: selectedGame,
                });
            },
            [
                selectedTypes,
                selectedGeneration,
                selectedGame,
                debouncedFilterChange,
            ]
        );

        // Handle game selection
        const handleGameChange = useCallback(
            (value) => {
                const newGame = value === "all" ? null : value;

                debouncedFilterChange({
                    types: selectedTypes,
                    generation: selectedGeneration,
                    game: newGame,
                });
            },
            [selectedTypes, selectedGeneration, debouncedFilterChange]
        );

        // Clear all filters
        const clearFilters = useCallback(() => {
            onFilterChange({
                types: [],
                generation: null,
                game: null,
            });
        }, [onFilterChange]);

        // Count active filters
        const activeFilterCount = useMemo(
            () =>
                selectedTypes.length +
                (selectedGeneration ? 1 : 0) +
                (selectedGame ? 1 : 0),
            [selectedTypes.length, selectedGeneration, selectedGame]
        );

        // Types filter section
        const typesSection = useMemo(
            () => (
                <AccordionItem value="types">
                    <AccordionTrigger>
                        <div className="flex items-center">
                            <span>Types</span>
                            {selectedTypes.length > 0 && (
                                <Badge variant="primary" className="ml-2">
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
                                    <TypeBadge
                                        key={type.name}
                                        type={type}
                                        isSelected={selectedTypeSet.has(
                                            type.name
                                        )}
                                        onToggle={toggleType}
                                    />
                                ))}
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
            ),
            [types, selectedTypeSet, isLoadingTypes, toggleType]
        );

        // Generations filter section
        const generationsSection = useMemo(
            () => (
                <AccordionItem value="generations">
                    <AccordionTrigger>
                        <div className="flex items-center">
                            <span>Generation</span>
                            {selectedGeneration && (
                                <Badge variant="primary" className="ml-2">
                                    1
                                </Badge>
                            )}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {GENERATIONS.map((gen) => {
                                const isSelected =
                                    selectedGeneration === gen.id;
                                return (
                                    <Badge
                                        key={gen.id}
                                        variant={
                                            isSelected ? "default" : "outline"
                                        }
                                        className="cursor-pointer"
                                        onClick={() => toggleGeneration(gen.id)}
                                    >
                                        {isSelected && (
                                            <Check className="h-3 w-3 mr-1" />
                                        )}
                                        {gen.name}
                                    </Badge>
                                );
                            })}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ),
            [selectedGeneration, toggleGeneration]
        );

        return (
            <div className={`w-full ${className}`}>
                {/* Filter toggle */}
                <div className="flex items-center justify-between mb-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleOpen}
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
                <div
                    className={`
                    overflow-hidden mb-6 border rounded-md bg-card 
                    transition-all duration-300 ease-in-out
                    ${
                        isOpen
                            ? "max-h-[600px] opacity-100"
                            : "max-h-0 opacity-0 border-0"
                    }
                `}
                >
                    <div className="p-4">
                        <Accordion
                            type="multiple"
                            value={activeAccordion}
                            onValueChange={handleAccordionChange}
                            className="w-full"
                        >
                            {typesSection}
                            {generationsSection}

                            {/* Games section */}
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
                                        onValueChange={handleGameChange}
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
                </div>
            </div>
        );
    }
);

PokemonFilters.displayName = "PokemonFilters";

export { PokemonFilters };
