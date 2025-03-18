import {
    fetchFromApi,
    formatPokemonData,
    POKE_BALL,
    QUESTION_MARK,
    SPRITE_URLS,
} from "@/lib/pokemon-api";

/**
 * In-memory cache for Pokemon data and images to reduce API requests
 *
 * This simple caching system significantly improves performance by:
 * - Eliminating redundant API calls for the same Pokemon
 * - Preventing image re-fetching during component remounts
 * - Enabling instant display of previously viewed Pokemon
 */
const pokemonCache = new Map();
const imageCache = new Map();

/**
 * Registry of custom Pokemon names to prevent unnecessary API calls
 *
 * When we identify a custom Pokemon (one not in the official API),
 * we store its name here to avoid future API requests that would fail.
 */
const customPokemonNames = new Set();

/**
 * Determines if a Pokemon ID indicates a custom/unofficial Pokemon
 *
 * Custom Pokemon can be identified by:
 * - Question marks in the ID
 * - IDs beyond the official Pokedex range (currently >2000)
 *
 * This check prevents unnecessary API calls for Pokemon we know don't exist
 * in the official API.
 *
 * @param {string|number} id - Pokemon ID to check
 * @returns {boolean} True if the ID suggests a custom Pokemon
 */
const isCustomId = (id) => {
    if (!id) return false;

    // Check for question marks in ID
    if (String(id).includes("?")) return true;

    // Check for out-of-range IDs (beyond official Pokedex)
    const numId = parseInt(id);
    if (!isNaN(numId) && numId > 2000) return true;

    return false;
};

/**
 * Registers a Pokemon name as custom to prevent future API calls
 *
 * Once we know a Pokemon is custom (not in the official API),
 * we add it to our registry to prevent redundant API calls.
 *
 * @param {string} name - Pokemon name to register as custom
 */
const registerCustomPokemon = (name) => {
    if (name) {
        const nameLower = String(name).toLowerCase();
        if (!customPokemonNames.has(nameLower)) {
            console.log(`Registering ${name} as a custom Pokemon`);
            customPokemonNames.add(nameLower);
        }
    }
};

/**
 * Initializes a Pokemon from direct data before any API calls
 *
 * This function is critical for handling custom Pokemon passed directly to components.
 * It checks if the provided Pokemon data indicates a custom Pokemon and registers it
 * accordingly to prevent unnecessary API calls.
 *
 * @param {Object} pokemonData - Direct Pokemon data object
 * @param {string|null} customImage - Custom image URL if available
 * @returns {boolean} True if the Pokemon was registered as custom
 */
export const initializePokemon = (pokemonData, customImage = null) => {
    if (!pokemonData || !pokemonData.name) return false;

    // Check if this Pokemon has a custom ID
    if (pokemonData.id && isCustomId(pokemonData.id)) {
        // Register the name to prevent future API calls
        registerCustomPokemon(pokemonData.name);

        // If a custom image is provided, store it in the image cache
        if (customImage) {
            const cacheKey = String(pokemonData.name).toLowerCase().trim();
            imageCache.set(cacheKey, customImage);
            console.log(`Cached custom image for ${pokemonData.name}`);
        }

        return true;
    }

    return false;
};

/**
 * Fetches Pokemon data with intelligent caching
 *
 * This function optimizes Pokemon data retrieval by:
 * 1. Checking the cache first to avoid redundant API calls
 * 2. Detecting custom Pokemon to skip API calls that would fail
 * 3. Standardizing data format for consistent use throughout the app
 *
 * @param {string|number} idOrName - Pokemon ID or name
 * @returns {Promise<Object|null>} - Formatted Pokemon data or null if not found
 */
export const getPokemon = async (idOrName) => {
    if (!idOrName) return null;

    const cacheKey = String(idOrName).toLowerCase().trim();

    // Check cache first
    if (pokemonCache.has(cacheKey)) {
        return pokemonCache.get(cacheKey);
    }

    // If ID suggests this is a custom Pokemon, skip API call
    if (isCustomId(idOrName)) {
        console.log(`${idOrName} is a custom Pokemon ID, skipping API call`);
        registerCustomPokemon(idOrName);
        return null;
    }

    // Check if this name is already known to be a custom Pokemon
    if (customPokemonNames.has(cacheKey)) {
        console.log(`${idOrName} is a known custom Pokemon, skipping API call`);
        return null;
    }

    try {
        console.log(`Fetching Pokemon data for: ${idOrName}`);
        // Use fetchFromApi instead of direct fetch
        const rawData = await fetchFromApi(`/pokemon/${cacheKey}`);

        // The updated fetchFromApi returns null for 404s
        if (!rawData) {
            registerCustomPokemon(idOrName);
            return null;
        }

        const formatted = formatPokemonData(rawData);

        // If this is a custom Pokemon by ID, register it
        if (isCustomId(formatted.id)) {
            registerCustomPokemon(formatted.name);
        }

        // Cache the result
        pokemonCache.set(cacheKey, formatted);

        return formatted;
    } catch (error) {
        console.warn(`Error fetching Pokemon ${idOrName}: ${error.message}`);
        return null;
    }
};

/**
 * Retrieves Pokemon images with fallbacks, caching, and custom image support
 *
 * This function handles image URL resolution with multiple layers of reliability:
 * 1. Uses custom image if provided
 * 2. Checks the image cache first
 * 3. Uses question mark image for custom Pokemon
 * 4. Tries official artwork first (higher quality)
 * 5. Falls back to regular sprites if artwork isn't available
 * 6. Uses Pokeball image as final fallback
 *
 * @param {string} name - Pokemon name
 * @param {string|null} id - Pokemon ID if available
 * @param {string|null} customImage - Custom image URL if available
 * @returns {Promise<string>} - URL to the Pokemon's image or fallback
 */
export const getPokemonImage = async (name, id = null, customImage = null) => {
    // If custom image is provided, return it immediately
    if (customImage) {
        console.log(`Using custom image for ${name}`);
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
        console.log(`${name} has custom ID ${id}, using question mark image`);
        registerCustomPokemon(name);
        imageCache.set(cacheKey, QUESTION_MARK);
        return QUESTION_MARK;
    }

    // If this name is already known to be custom, use question mark
    if (customPokemonNames.has(cacheKey)) {
        console.log(
            `${name} is a known custom Pokemon, using question mark image`
        );
        imageCache.set(cacheKey, QUESTION_MARK);
        return QUESTION_MARK;
    }

    try {
        // Try to get the Pokemon data to find its ID
        const pokemonData = await getPokemon(name);

        if (!pokemonData) {
            // For unknown Pokemon
            console.log(
                `No data found for Pokemon: ${name}, using question mark`
            );
            imageCache.set(cacheKey, QUESTION_MARK);
            return QUESTION_MARK;
        }

        // Try official artwork first (looks better)
        const pokemonId = id || pokemonData.id;
        const numId = parseInt(pokemonId);

        if (isNaN(numId)) {
            imageCache.set(cacheKey, QUESTION_MARK);
            return QUESTION_MARK;
        }

        const officialArtworkUrl = `${SPRITE_URLS.officialArtwork}${numId}.png`;

        try {
            const response = await fetch(officialArtworkUrl, {
                method: "HEAD",
            });

            if (response.ok) {
                imageCache.set(cacheKey, officialArtworkUrl);
                return officialArtworkUrl;
            } else {
                const regularSpriteUrl = `${SPRITE_URLS.default}${numId}.png`;
                imageCache.set(cacheKey, regularSpriteUrl);
                return regularSpriteUrl;
            }
        } catch (error) {
            const regularSpriteUrl = `${SPRITE_URLS.default}${numId}.png`;
            imageCache.set(cacheKey, regularSpriteUrl);
            return regularSpriteUrl;
        }
    } catch (error) {
        console.warn(
            `Could not load image for Pokemon ${name}: ${error.message}`
        );
        imageCache.set(cacheKey, QUESTION_MARK);
        return QUESTION_MARK;
    }
};

/**
 * Fetches a paginated list of Pokemon with caching
 *
 * Provides a way to browse Pokemon with efficient pagination,
 * useful for exploration features and search functionality.
 *
 * @param {number} limit - Number of Pokemon to retrieve per page
 * @param {number} offset - Starting position for pagination
 * @returns {Promise<Array>} - List of basic Pokemon summaries with IDs and names
 */
export const getPokemonList = async (limit = 20, offset = 0) => {
    const cacheKey = `list-${limit}-${offset}`;

    // Check cache first
    if (pokemonCache.has(cacheKey)) {
        return pokemonCache.get(cacheKey);
    }

    try {
        // Use fetchFromApi instead of direct fetch
        const data = await fetchFromApi(
            `/pokemon?limit=${limit}&offset=${offset}`
        );

        if (!data) {
            return [];
        }

        const formatted = data.results.map((pokemon) => {
            const urlParts = pokemon.url.split("/");
            const id = urlParts[urlParts.length - 2];
            return {
                id: id.padStart(4, "0"),
                name:
                    pokemon.name.charAt(0).toUpperCase() +
                    pokemon.name.slice(1),
                url: pokemon.url,
            };
        });

        // Cache the result
        pokemonCache.set(cacheKey, formatted);

        return formatted;
    } catch (error) {
        console.warn(`Error fetching Pokemon list: ${error.message}`);
        return [];
    }
};

/**
 * Fetches a list of Pokemon types with caching
 *
 * Useful for filtering and categorization features that allow
 * users to browse Pokemon by their types.
 *
 * @returns {Promise<Array>} - List of Pokemon types with formatted names
 */
export const getPokemonTypes = async () => {
    const cacheKey = "types";

    // Check cache first
    if (pokemonCache.has(cacheKey)) {
        return pokemonCache.get(cacheKey);
    }

    try {
        // Use fetchFromApi instead of direct fetch
        const data = await fetchFromApi(`/type`);

        if (!data) {
            return [];
        }

        const formatted = data.results
            .filter((type) => !["unknown", "shadow"].includes(type.name))
            .map((type) => ({
                name: type.name.charAt(0).toUpperCase() + type.name.slice(1),
                url: type.url,
            }));

        // Cache the result
        pokemonCache.set(cacheKey, formatted);

        return formatted;
    } catch (error) {
        console.warn(`Error fetching Pokemon types: ${error.message}`);
        return [];
    }
};

/**
 * Clears all caches to force fresh data retrieval
 *
 * Useful for:
 * - Testing
 * - Handling version updates
 * - Clearing memory when needed
 */
export const clearCache = () => {
    pokemonCache.clear();
    imageCache.clear();
    customPokemonNames.clear();
    console.log("Pokemon cache cleared");
};
