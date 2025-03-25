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

// In-memory cache for images and custom Pokemon data
const imageCache = new Map();
const customPokemonNames = new Set();

// Helper functions
const isCustomId = (id) => {
    if (!id) return false;
    if (String(id).includes("?")) return true;
    const numId = parseInt(id);
    if (!isNaN(numId) && numId > 2000) return true;
    return false;
};

const registerCustomPokemon = (name) => {
    if (name) {
        const nameLower = String(name).toLowerCase();
        if (!customPokemonNames.has(nameLower)) {
            console.log(`Registering ${name} as a custom Pokemon`);
            customPokemonNames.add(nameLower);
        }
    }
};

// Initialize Pokemon with custom image
export const initializePokemon = (pokemonData, customImage = null) => {
    if (!pokemonData || !pokemonData.name) return false;

    if (pokemonData.id && isCustomId(pokemonData.id)) {
        registerCustomPokemon(pokemonData.name);
        if (customImage) {
            const cacheKey = String(pokemonData.name).toLowerCase().trim();
            imageCache.set(cacheKey, customImage);
        }
        return true;
    }
    return false;
};

// Get a single Pokemon using Server Action
export const getPokemon = async (idOrName, suppressErrors = false) => {
    if (!idOrName) return null;

    const cacheKey = String(idOrName).toLowerCase().trim();

    // Skip for custom Pokemon
    if (isCustomId(idOrName)) {
        console.log(
            `${idOrName} is a custom Pokemon ID, skipping database query`
        );
        registerCustomPokemon(idOrName);
        return null;
    }

    // Check if this name is already known to be a custom Pokemon
    if (customPokemonNames.has(cacheKey)) {
        console.log(
            `${idOrName} is a known custom Pokemon, skipping database query`
        );
        return null;
    }

    try {
        // Use server action instead of API call
        const pokemon = await getPokemonAction(idOrName);

        if (!pokemon) {
            registerCustomPokemon(idOrName);
        }

        return pokemon;
    } catch (error) {
        if (!suppressErrors) {
            console.warn(`Error fetching Pokemon ${idOrName}:`, error.message);
        }
        return null;
    }
};

// Get Pokemon image using database sprites
export const getPokemonImage = async (name, id = null, customImage = null) => {
    // If custom image is provided, return it immediately
    if (customImage) {
        return customImage;
    }

    if (!name) return POKE_BALL;

    const cacheKey = String(name).toLowerCase().trim();

    // Check cache first
    if (imageCache.has(cacheKey)) {
        return imageCache.get(cacheKey);
    }

    // If we have an ID and it's custom, use question mark immediately
    if (id && isCustomId(id)) {
        registerCustomPokemon(name);
        imageCache.set(cacheKey, QUESTION_MARK);
        return QUESTION_MARK;
    }

    // If this name is already known to be custom, use question mark
    if (customPokemonNames.has(cacheKey)) {
        imageCache.set(cacheKey, QUESTION_MARK);
        return QUESTION_MARK;
    }

    try {
        // First get the Pokemon data to determine the ID
        const pokemonData = await getPokemon(name);
        if (!pokemonData) {
            imageCache.set(cacheKey, QUESTION_MARK);
            return QUESTION_MARK;
        }

        // Get Pokemon ID
        const pokemonId = id || pokemonData.id;
        const numId = parseInt(pokemonId.replace(/\D/g, ""));

        if (isNaN(numId)) {
            imageCache.set(cacheKey, QUESTION_MARK);
            return QUESTION_MARK;
        }

        // Get sprite from database using the server action
        const spriteUrl = await getPokemonSpriteAction(numId);

        if (spriteUrl) {
            imageCache.set(cacheKey, spriteUrl);
            return spriteUrl;
        } else {
            // Fallback to question mark if no sprite found
            imageCache.set(cacheKey, QUESTION_MARK);
            return QUESTION_MARK;
        }
    } catch (error) {
        console.warn(
            `Could not load image for Pokemon ${name}:`,
            error.message
        );
        imageCache.set(cacheKey, QUESTION_MARK);
        return QUESTION_MARK;
    }
};

// Get Pokemon list with filtering using Server Action
export const getPokemonList = async (limit = 20, offset = 0, filters = {}) => {
    try {
        // Use server action directly instead of API call
        return await getPokemonListAction({
            limit,
            offset,
            ...filters,
        });
    } catch (error) {
        console.warn(`Error fetching Pokemon list:`, error.message);
        return [];
    }
};

// Get featured Pokemon using Server Action
export const getFeaturedPokemon = async (count = 4) => {
    try {
        // Use server action directly instead of API call
        return await getFeaturedPokemonAction(count);
    } catch (error) {
        console.warn(`Error fetching featured Pokemon:`, error.message);
        return [
            { name: "Bulbasaur", id: "0001" },
            { name: "Pikachu", id: "0025" },
            { name: "Charizard", id: "0006" },
            { name: "Lucario", id: "0448" },
        ];
    }
};

// Get Pokemon types using Server Action
export const getPokemonTypes = async () => {
    try {
        // Use server action directly instead of API call
        return await getPokemonTypesAction();
    } catch (error) {
        console.warn(`Error fetching Pokemon types:`, error.message);
        return [];
    }
};

/**
 * Consolidated data fetching for explore page with complete Pokémon data
 * This enhanced version prefetches all needed data for Pokémon cards,
 * eliminating the need for separate requests for each card
 */
export const getExplorePageData = async (params = {}) => {
    try {
        return await getExplorePageDataAction({
            ...params,
            includeFullData: true, // Always request full data
        });
    } catch (error) {
        console.warn(`Error fetching explore page data:`, error.message);
        return {
            pokemonList: [],
            pokemonTypes: [],
            featuredPokemon: [],
        };
    }
};

/**
 * Consolidated data fetching for home page with complete Pokémon data
 */
export const getHomePageData = async (params = {}) => {
    try {
        return await getHomePageDataAction({
            ...params,
            includeFullData: true, // Always request full data
        });
    } catch (error) {
        console.warn(`Error fetching home page data:`, error.message);
        return {
            featuredPokemon: [
                { name: "Bulbasaur", id: "0001" },
                { name: "Pikachu", id: "0025" },
                { name: "Charizard", id: "0006" },
                { name: "Lucario", id: "0448" },
            ],
            pokemonTypes: [],
        };
    }
};

// Clear cache (unchanged)
export const clearCache = () => {
    imageCache.clear();
    customPokemonNames.clear();
    console.log("Pokemon cache cleared");
};
