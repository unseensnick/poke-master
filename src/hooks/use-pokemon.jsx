// hooks/use-pokemon.js
import { POKE_BALL } from "@/lib/pokemon-api";
import {
    getPokemon,
    getPokemonImage,
    initializePokemon,
} from "@/services/pokemon-service";
import { useEffect, useState } from "react";

/**
 * Custom hook to fetch and manage Pokémon data
 *
 * This hook handles all data fetching, state management, and loading states
 * for Pokémon data, centralizing this logic for reuse across components.
 *
 * @param {Object} options - Hook configuration options
 * @param {Object} options.pokemon - Optional pre-loaded Pokémon data
 * @param {string|number} options.pokemonIdOrName - Pokémon ID or name to fetch
 * @param {Object} options.preloadedData - Optional complete preloaded data
 * @param {string} options.customImage - Optional custom image URL
 * @returns {Object} Pokémon data and loading states
 */
export function usePokemon({
    pokemon = null,
    pokemonIdOrName = null,
    preloadedData = null,
    customImage = null,
}) {
    // State for Pokémon data
    const [pokemonData, setPokemonData] = useState(
        pokemon || preloadedData || null
    );
    const [imageUrl, setImageUrl] = useState(
        preloadedData?.spriteUrl || customImage || null
    );

    // Loading and error states
    const [isLoadingData, setIsLoadingData] = useState(
        !preloadedData && !pokemon && !!pokemonIdOrName
    );
    const [isLoadingImage, setIsLoadingImage] = useState(
        !preloadedData?.spriteUrl && !customImage
    );
    const [error, setError] = useState(false);
    const [isReady, setIsReady] = useState(!!pokemon || !!preloadedData);

    // Track image source
    const [imageSource, setImageSource] = useState(customImage);

    // Generate a unique key for the Pokémon
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
     * Update state when inputs change
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
     * Fetch Pokémon data
     */
    useEffect(() => {
        if (pokemon || preloadedData) {
            setPokemonData(pokemon || preloadedData);
            setIsLoadingData(false);
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
            setIsReady(false);

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
     * Fetch Pokémon image
     */
    useEffect(() => {
        if (!pokemonData) {
            setIsLoadingImage(false);
            return;
        }

        if (preloadedData?.spriteUrl || customImage) {
            setImageUrl(preloadedData?.spriteUrl || customImage);
            setIsLoadingImage(false);
            setIsReady(true);
            return;
        }

        const loadPokemonImage = async () => {
            setIsLoadingImage(true);

            try {
                const fetchedImage = await getPokemonImage(
                    pokemonData.name,
                    pokemonData.id
                );
                setImageUrl(fetchedImage);
            } catch (error) {
                console.error("Error loading Pokemon image:", error);
                setImageUrl(POKE_BALL);
            } finally {
                setIsLoadingImage(false);
                setIsReady(true);
            }
        };

        loadPokemonImage();
    }, [pokemonData, imageSource, preloadedData, customImage]);

    // Return all necessary data and state for the component
    return {
        pokemonData,
        imageUrl,
        isLoadingData,
        isLoadingImage,
        error,
        isReady,
        cardKey,
    };
}
