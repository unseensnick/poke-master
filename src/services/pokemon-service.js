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
 * Registers custom Pokemon with optional image
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
 * Gets Pokemon by name or ID with caching
 */
export const getPokemon = async (idOrName, suppressErrors = false) => {
    if (!idOrName) return null;

    // Skip database for custom Pokemon
    if (PokemonCache.isCustomId(idOrName)) {
        console.log(
            `${idOrName} is a custom Pokemon ID, skipping database query`
        );
        PokemonCache.registerCustom(idOrName);
        return null;
    }

    // Check for known custom Pokemon
    if (PokemonCache.isCustomName(idOrName)) {
        console.log(
            `${idOrName} is a known custom Pokemon, skipping database query`
        );
        return null;
    }

    // Get Pokemon data
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

    // Format Pokemon data
    return {
        id: formatPokemonId(pokemon.id),
        name: pokemon.name,
        weight: pokemon.weight.toFixed(1),
        height: pokemon.height.toFixed(1),
        types: formatPokemonTypes(pokemon.types),
    };
};

/**
 * Gets Pokemon image with fallback and caching
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

    // Helper for default image
    const returnDefaultImage = () => {
        PokemonCache.cacheImage(name, QUESTION_MARK);
        return QUESTION_MARK;
    };

    // Fast-path for custom Pokemon
    if (
        (id && PokemonCache.isCustomId(id)) ||
        PokemonCache.isCustomName(name)
    ) {
        if (id) PokemonCache.registerCustom(name);
        return returnDefaultImage();
    }

    try {
        // Get Pokemon data for ID
        const pokemonData = await getPokemon(name);
        if (!pokemonData) {
            return returnDefaultImage();
        }

        // Extract numeric ID
        const pokemonId = id || pokemonData.id;
        const numId = parseInt(pokemonId.replace(/\D/g, ""));

        if (isNaN(numId)) {
            return returnDefaultImage();
        }

        // Get sprite data
        const pokemonWithSprites = await PokemonAPI.call(
            getPokemonSpriteAction,
            numId,
            `Could not load image for Pokemon ${name}:`,
            null
        );

        if (pokemonWithSprites && pokemonWithSprites.sprites) {
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
 * Gets Pokemon list with filtering and pagination
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
 * Gets featured Pokemon that change daily
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
