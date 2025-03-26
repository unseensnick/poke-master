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
 * Badge to display a Pokemon type with selection state
 * Memoized to reduce re-renders
 */
const TypeBadge = React.memo(({ type, isSelected, onToggle }) => {
    // Create class strings for the badge
    const baseClasses = "cursor-pointer capitalize";
    const selectedClasses = isSelected
        ? `bg-pokemon-${type.name.toLowerCase()} hover:bg-pokemon-${type.name.toLowerCase()}/90`
        : "hover:bg-muted";

    // Handle click with proper event handling
    const handleClick = useCallback(
        (e) => {
            // Prevent event bubbling
            e.stopPropagation();
            // Use requestAnimationFrame for smoother updates
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
 * Pokemon filter panel with type, generation and game filters
 * Memoized to prevent unnecessary re-renders
 *
 * @param {Object} props - Component props
 * @param {Function} props.onFilterChange - Called when filters change
 * @param {Array} props.selectedTypes - Currently selected types
 * @param {number} props.selectedGeneration - Selected generation ID
 * @param {string} props.selectedGame - Selected game ID
 * @param {string} props.className - Additional CSS classes
 * @param {Array} props.availableTypes - List of available types
 * @returns {JSX.Element} Filter panel component
 */
const PokemonFilters = React.memo(
    ({
        onFilterChange,
        selectedTypes = [],
        selectedGeneration = null,
        selectedGame = null,
        className = "",
        availableTypes = [], // For pre-loaded types
    }) => {
        // Track previous filter state to prevent duplicate updates
        const prevFiltersRef = useRef({
            types: selectedTypes,
            generation: selectedGeneration,
            game: selectedGame,
        });

        // UI state for the filter panel
        const [uiState, setUiState] = useState({
            isOpen: false,
            activeAccordion: ["types"],
            isLoadingTypes: availableTypes.length === 0,
        });

        // Destructure for easier access
        const { isOpen, activeAccordion, isLoadingTypes } = uiState;

        // State for Pokemon types
        const [types, setTypes] = useState(availableTypes);

        // Convert array to Set for faster lookups
        const selectedTypeSet = useMemo(
            () => new Set(selectedTypes),
            [selectedTypes]
        );

        // Timer for debouncing rapid filter changes
        const debounceTimerRef = useRef(null);

        // Send filter changes with debouncing
        const debouncedFilterChange = useCallback(
            (filters) => {
                if (debounceTimerRef.current) {
                    clearTimeout(debounceTimerRef.current);
                }

                debounceTimerRef.current = setTimeout(() => {
                    // Only trigger if values actually changed
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
                }, 50); // Short debounce for responsiveness
            },
            [onFilterChange]
        );

        // Toggle filter panel open/closed
        const toggleOpen = useCallback(() => {
            setUiState((prev) => ({ ...prev, isOpen: !prev.isOpen }));
        }, []);

        // Update which accordion sections are open
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

        // Toggle a type filter on/off
        const toggleType = useCallback(
            (type) => {
                // Use a Set for faster operations
                const newTypeSet = new Set(selectedTypes);

                // Toggle presence in set
                if (newTypeSet.has(type)) {
                    newTypeSet.delete(type);
                } else {
                    newTypeSet.add(type);
                }

                // Convert set back to array
                const newTypes = Array.from(newTypeSet);

                // Update filters
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

        // Toggle a generation filter on/off
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

        // Handle game selection change
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

        // Memoize the types section
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

        // Memoize the generations section
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
                {/* Filter toggle button */}
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

                {/* Filter panel with CSS transition */}
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
                        {/* Filter accordion */}
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
