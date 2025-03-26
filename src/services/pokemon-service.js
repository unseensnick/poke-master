import {
    getExplorePageData as getExplorePageDataAction,
    getFeaturedPokemon as getFeaturedPokemonAction,
    getHomePageData as getHomePageDataAction,
    getPokemon as getPokemonAction,
    getPokemonList as getPokemonListAction,
    getPokemonSprite as getPokemonSpriteAction,
    getPokemonTypes as getPokemonTypesAction,
} from "@/app/actions/pokemon";
import { POKE_BALL, QUESTION_MARK } from "@/lib/pokemon-api";
import PokemonCache from "@/lib/pokemon-cache";
import { DEFAULT_FEATURED_POKEMON } from "@/lib/pokemon-constants";
import {
    extractBestSpriteUrl,
    formatPokemonId,
    formatPokemonTypes,
} from "@/lib/pokemon-utils";

/**
 * API wrapper with consistent error handling
 */
const PokemonAPI = {
    // Generic wrapper for API calls with error handling
    async call(
        action,
        params,
        errorMessage,
        fallback = null,
        suppressErrors = false
    ) {
        try {
            return await action(params);
        } catch (error) {
            if (!suppressErrors) {
                console.warn(errorMessage, error.message);
            }
            return fallback;
        }
    },
};

/**
 * Registers a custom Pokemon with optional image
 *
 * @param {Object} pokemonData - Pokemon data
 * @param {string} customImage - Optional custom image URL
 * @returns {boolean} Whether Pokemon was registered
 */
export const initializePokemon = (pokemonData, customImage = null) => {
    if (!pokemonData || !pokemonData.name) return false;

    if (pokemonData.id && PokemonCache.isCustomId(pokemonData.id)) {
        PokemonCache.registerCustom(pokemonData.name);

        if (customImage) {
            PokemonCache.cacheImage(pokemonData.name, customImage);
        }
        return true;
    }
    return false;
};

/**
 * Gets a single Pokemon by name or ID
 *
 * @param {string|number} idOrName - Pokemon ID or name
 * @param {boolean} suppressErrors - Whether to hide error messages
 * @returns {Object|null} Pokemon data or null if not found
 */
export const getPokemon = async (idOrName, suppressErrors = false) => {
    if (!idOrName) return null;

    // Skip database query for custom Pokemon
    if (PokemonCache.isCustomId(idOrName)) {
        console.log(
            `${idOrName} is a custom Pokemon ID, skipping database query`
        );
        PokemonCache.registerCustom(idOrName);
        return null;
    }

    // Check if already known to be custom
    if (PokemonCache.isCustomName(idOrName)) {
        console.log(
            `${idOrName} is a known custom Pokemon, skipping database query`
        );
        return null;
    }

    // Get the Pokemon data
    const pokemon = await PokemonAPI.call(
        getPokemonAction,
        idOrName,
        `Error fetching Pokemon ${idOrName}:`,
        null,
        suppressErrors
    );

    // Register as custom if not found
    if (!pokemon) {
        PokemonCache.registerCustom(idOrName);
        return null;
    }

    // Format the Pokemon data for consistent structure
    return {
        id: formatPokemonId(pokemon.id),
        name: pokemon.name,
        weight: pokemon.weight.toFixed(1),
        height: pokemon.height.toFixed(1),
        types: formatPokemonTypes(pokemon.types),
    };
};

/**
 * Gets a Pokemon's image
 *
 * @param {string} name - Pokemon name
 * @param {string|number} id - Pokemon ID
 * @param {string} customImage - Custom image URL
 * @returns {string} Image URL
 */
export const getPokemonImage = async (name, id = null, customImage = null) => {
    // Return custom image if provided
    if (customImage) {
        return customImage;
    }

    if (!name) return POKE_BALL;

    // Check cache first
    const cachedImage = PokemonCache.getImageFromCache(name);
    if (cachedImage) {
        return cachedImage;
    }

    // Helper to cache and return default image
    const returnDefaultImage = () => {
        PokemonCache.cacheImage(name, QUESTION_MARK);
        return QUESTION_MARK;
    };

    // Fast-path for known custom Pokemon
    if (
        (id && PokemonCache.isCustomId(id)) ||
        PokemonCache.isCustomName(name)
    ) {
        if (id) PokemonCache.registerCustom(name);
        return returnDefaultImage();
    }

    try {
        // First get the Pokemon data to determine the ID
        const pokemonData = await getPokemon(name);
        if (!pokemonData) {
            return returnDefaultImage();
        }

        // Get Pokemon ID
        const pokemonId = id || pokemonData.id;
        const numId = parseInt(pokemonId.replace(/\D/g, ""));

        if (isNaN(numId)) {
            return returnDefaultImage();
        }

        // Get sprite from database
        const pokemonWithSprites = await PokemonAPI.call(
            getPokemonSpriteAction,
            numId,
            `Could not load image for Pokemon ${name}:`,
            null
        );

        if (pokemonWithSprites && pokemonWithSprites.sprites) {
            // Extract the best available sprite URL
            const spriteUrl = extractBestSpriteUrl(pokemonWithSprites.sprites);
            if (spriteUrl) {
                PokemonCache.cacheImage(name, spriteUrl);
                return spriteUrl;
            }
        }

        return returnDefaultImage();
    } catch (error) {
        console.warn(
            `Could not load image for Pokemon ${name}:`,
            error.message
        );
        return returnDefaultImage();
    }
};

/**
 * Gets a list of Pokemon with optional filtering
 *
 * @param {number} limit - Max number of results
 * @param {number} offset - Starting position
 * @param {Object} filters - Filter criteria
 * @returns {Array} List of Pokemon
 */
export const getPokemonList = async (limit = 20, offset = 0, filters = {}) => {
    return PokemonAPI.call(
        getPokemonListAction,
        { limit, offset, ...filters },
        `Error fetching Pokemon list:`,
        []
    );
};

/**
 * Gets featured Pokemon
 *
 * @param {number} count - Number of Pokemon to get
 * @returns {Array} Featured Pokemon
 */
export const getFeaturedPokemon = async (count = 4) => {
    return PokemonAPI.call(
        getFeaturedPokemonAction,
        count,
        `Error fetching featured Pokemon:`,
        DEFAULT_FEATURED_POKEMON
    );
};

/**
 * Gets all Pokemon types
 *
 * @returns {Array} List of Pokemon types
 */
export const getPokemonTypes = async () => {
    return PokemonAPI.call(
        getPokemonTypesAction,
        undefined,
        `Error fetching Pokemon types:`,
        []
    );
};

/**
 * Gets complete data for explore page
 *
 * @param {Object} params - Query parameters
 * @returns {Object} Pokemon list, types, and featured Pokemon
 */
export const getExplorePageData = async (params = {}) => {
    return PokemonAPI.call(
        getExplorePageDataAction,
        {
            ...params,
            includeFullData: true, // Always request full data
        },
        `Error fetching explore page data:`,
        {
            pokemonList: [],
            pokemonTypes: [],
            featuredPokemon: [],
        }
    );
};

/**
 * Gets complete data for home page
 *
 * @param {Object} params - Query parameters
 * @returns {Object} Featured Pokemon and Pokemon types
 */
export const getHomePageData = async (params = {}) => {
    return PokemonAPI.call(
        getHomePageDataAction,
        {
            ...params,
            includeFullData: true, // Always request full data
        },
        `Error fetching home page data:`,
        {
            featuredPokemon: DEFAULT_FEATURED_POKEMON,
            pokemonTypes: [],
        }
    );
};

/**
 * Clears all Pokemon caches
 */
export const clearCache = () => {
    PokemonCache.clearAll();
};
