/**
 * Pokemon API service with 24-hour caching to reduce API calls
 * Provides methods for fetching Pokemon data with error handling and fallbacks
 */

import { fetchPokemon, fetchPokemonImage, POKE_BALL } from "@/lib/pokemon-api";

// Cache configuration
const pokemonCache = new Map();
const imageCache = new Map();
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Checks if cached item is still valid
 * @param {Object} cachedItem - Item from cache with timestamp
 * @returns {boolean} True if cache is valid, false otherwise
 */
const isCacheValid = (cachedItem) => {
    if (!cachedItem || !cachedItem.timestamp) return false;
    return Date.now() - cachedItem.timestamp < CACHE_EXPIRY;
};

/**
 * Gets Pokemon data with caching
 *
 * @param {string|number} idOrName - Pokemon ID or name
 * @returns {Promise<Object|null>} - Pokemon data or null if not found
 */
export const getPokemon = async (idOrName) => {
    if (!idOrName) return null;

    const cacheKey = idOrName.toString().toLowerCase().trim();
    if (cacheKey === "") return null;

    // Try cache first
    const cachedPokemon = pokemonCache.get(cacheKey);
    if (cachedPokemon && isCacheValid(cachedPokemon)) {
        return cachedPokemon.data;
    }

    try {
        // Fetch fresh data
        const pokemonData = await fetchPokemon(idOrName);
        pokemonCache.set(cacheKey, {
            data: pokemonData,
            timestamp: Date.now(),
        });
        return pokemonData;
    } catch (error) {
        // Fall back to expired cache if available
        if (cachedPokemon) {
            console.warn(`Using expired cache for Pokemon ${idOrName}`);
            return cachedPokemon.data;
        }
        console.error(`Failed to get Pokemon ${idOrName}: ${error.message}`);
        return null;
    }
};

/**
 * Gets Pokemon image URL with caching
 *
 * @param {string} name - Pokemon name
 * @returns {Promise<string>} - Image URL or default Pokeball
 */
export const getPokemonImage = async (name) => {
    if (!name) return POKE_BALL;

    const cacheKey = name.toLowerCase().trim();
    if (cacheKey === "") return POKE_BALL;

    // Try cache first
    const cachedImage = imageCache.get(cacheKey);
    if (cachedImage && isCacheValid(cachedImage)) {
        return cachedImage.url;
    }

    try {
        // Fetch fresh image
        const imageUrl = await fetchPokemonImage(name);
        imageCache.set(cacheKey, {
            url: imageUrl,
            timestamp: Date.now(),
        });
        return imageUrl;
    } catch (error) {
        // Fall back to expired cache if available
        if (cachedImage) {
            console.warn(`Using expired cache for Pokemon image ${name}`);
            return cachedImage.url;
        }
        console.error(
            `Failed to get image for Pokemon ${name}: ${error.message}`
        );
        return POKE_BALL;
    }
};

/**
 * Gets paginated list of Pokemon
 *
 * @param {number} limit - Number of Pokemon to retrieve (default: 20)
 * @param {number} offset - Starting position (default: 0)
 * @returns {Promise<Array>} - List of Pokemon summaries with id, name and url
 */
export const getPokemonList = async (limit = 20, offset = 0) => {
    try {
        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch Pokemon list: ${response.status}`);
        }

        const data = await response.json();

        // Extract IDs from URLs and format names
        return data.results.map((pokemon) => {
            const urlParts = pokemon.url.split("/");
            const id = urlParts[urlParts.length - 2];

            return {
                id: id.padStart(3, "0"),
                name:
                    pokemon.name.charAt(0).toUpperCase() +
                    pokemon.name.slice(1),
                url: pokemon.url,
            };
        });
    } catch (error) {
        console.error("Error fetching Pokemon list:", error);
        throw error;
    }
};

/**
 * Gets all available Pokemon types
 *
 * @returns {Promise<Array>} - List of Pokemon types
 */
export const getPokemonTypes = async () => {
    try {
        const response = await fetch("https://pokeapi.co/api/v2/type");

        if (!response.ok) {
            throw new Error(
                `Failed to fetch Pokemon types: ${response.status}`
            );
        }

        const data = await response.json();

        // Filter out special types and format names
        return data.results
            .filter((type) => !["unknown", "shadow"].includes(type.name))
            .map((type) => ({
                name: type.name.charAt(0).toUpperCase() + type.name.slice(1),
                url: type.url,
            }));
    } catch (error) {
        console.error("Error fetching Pokemon types:", error);
        throw error;
    }
};

/**
 * Manually clears all caches to force fresh data fetching
 */
export const clearCache = () => {
    pokemonCache.clear();
    imageCache.clear();
    console.log("Pokemon cache cleared");
};
