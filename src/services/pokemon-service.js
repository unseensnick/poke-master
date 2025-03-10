/**
 * Pokemon API service with caching to reduce API calls
 * Cache expires after 24 hours
 */

import { fetchPokemon, fetchPokemonImage } from "@/lib/pokemon-api";

// In-memory cache with 24-hour expiration
const pokemonCache = new Map();
const imageCache = new Map();
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

const isCacheValid = (cachedItem) => {
    if (!cachedItem || !cachedItem.timestamp) return false;
    return Date.now() - cachedItem.timestamp < CACHE_EXPIRY;
};

/**
 * Gets Pokemon by ID or name with caching
 * @param {string|number} idOrName - Pokemon ID or name
 * @returns {Promise<Object>} - Pokemon data
 */
export const getPokemon = async (idOrName) => {
    if (!idOrName) return null;

    const cacheKey = idOrName.toString().toLowerCase().trim();
    if (cacheKey === "") return null;

    const cachedPokemon = pokemonCache.get(cacheKey);

    if (cachedPokemon && isCacheValid(cachedPokemon)) {
        return cachedPokemon.data;
    }

    try {
        const pokemonData = await fetchPokemon(idOrName);
        pokemonCache.set(cacheKey, {
            data: pokemonData,
            timestamp: Date.now(),
        });

        return pokemonData;
    } catch (error) {
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
 * @param {string} name - Pokemon name
 * @returns {Promise<string>} - Image URL
 */
export const getPokemonImage = async (name) => {
    if (!name) return POKE_BALL;

    const cacheKey = name.toLowerCase().trim();
    if (cacheKey === "") return POKE_BALL;

    const cachedImage = imageCache.get(cacheKey);

    if (cachedImage && isCacheValid(cachedImage)) {
        return cachedImage.url;
    }

    try {
        const imageUrl = await fetchPokemonImage(name);
        imageCache.set(cacheKey, {
            url: imageUrl,
            timestamp: Date.now(),
        });

        return imageUrl;
    } catch (error) {
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
 * @param {number} limit - Number of Pokemon to retrieve
 * @param {number} offset - Starting position
 * @returns {Promise<Array>} - List of Pokemon summaries
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

        return data.results.map((pokemon) => {
            // Extract ID from URL (e.g., https://pokeapi.co/api/v2/pokemon/1/)
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
 * Gets all Pokemon types
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

        // Filter out 'unknown' and 'shadow' types and format names
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
 * Clears the cache to force fresh data fetching
 */
export const clearCache = () => {
    pokemonCache.clear();
    imageCache.clear();
    console.log("Pokemon cache cleared");
};
