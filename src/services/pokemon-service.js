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
import PokemonCache from "@/lib/pokemon-cache"; // Import our new cache module
import { DEFAULT_FEATURED_POKEMON } from "@/lib/pokemon-constants";
import {
    extractBestSpriteUrl,
    formatPokemonId,
    formatPokemonTypes,
} from "@/lib/pokemon-utils";

/**
 * API Module
 * Provides a wrapper for API calls with standardized error handling
 */
const PokemonAPI = {
    // Generic wrapper for API calls with consistent error handling
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
 * Initialize a custom Pokemon with optional custom image
 * Returns true if the Pokemon was registered as custom
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
 * Get a single Pokemon using Server Action
 * Handles custom Pokemon logic and caching
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

    // Check if this name is already known to be a custom Pokemon
    if (PokemonCache.isCustomName(idOrName)) {
        console.log(
            `${idOrName} is a known custom Pokemon, skipping database query`
        );
        return null;
    }

    // Call the server action
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
    }

    return pokemon;
};

/**
 * Get Pokemon image using database sprites
 * Handles image caching and fallback logic
 */
export const getPokemonImage = async (name, id = null, customImage = null) => {
    // If custom image is provided, return it immediately
    if (customImage) {
        return customImage;
    }

    if (!name) return POKE_BALL;

    // Check cache first
    const cachedImage = PokemonCache.getImageFromCache(name);
    if (cachedImage) {
        return cachedImage;
    }

    // Helper function to cache and return fallback image
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

        // Get sprite from database using the server action
        const spriteUrl = await PokemonAPI.call(
            getPokemonSpriteAction,
            numId,
            `Could not load image for Pokemon ${name}:`,
            null
        );

        if (spriteUrl) {
            PokemonCache.cacheImage(name, spriteUrl);
            return spriteUrl;
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
 * Get Pokemon list with filtering using Server Action
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
 * Get featured Pokemon using Server Action
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
 * Get Pokemon types using Server Action
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
 * Consolidated data fetching for explore page with complete Pokémon data
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
 * Consolidated data fetching for home page with complete Pokémon data
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
 * Clear all Pokemon caches
 */
export const clearCache = () => {
    PokemonCache.clearAll();
};
