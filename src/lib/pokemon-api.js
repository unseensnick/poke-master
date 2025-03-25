// Fallback image URLs
export const POKE_BALL =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
export const QUESTION_MARK =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";

// Base URL for the PokeAPI
export const API_BASE_URL = "https://pokeapi.co/api/v2";

// Sprite base URLs
export const SPRITE_URLS = {
    // Official artwork provides higher quality images for modern interfaces
    officialArtwork:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/",
    // Default sprites as fallback when artwork isn't available (or for retro styling)
    default:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/",
};

/**
 * Fetches data from the Pokémon API with error handling
 *
 * Makes HTTP requests to the PokeAPI with consistent error handling.
 * Returns null for 404 errors to allow graceful handling of missing Pokémon.
 * Throws errors for other HTTP or network issues to enable upstream handling.
 *
 * @param {string} endpoint - API endpoint to fetch (without base URL)
 * @param {boolean} suppressNotFoundErrors - Whether to suppress 404 error messages (default: false)
 * @returns {Promise<Object|null>} - JSON response or null for 404s
 * @throws {Error} For network errors or non-404 HTTP errors
 */
export const fetchFromApi = async (
    endpoint,
    suppressNotFoundErrors = false
) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);

        if (!response.ok) {
            if (response.status === 404) {
                // Only log the warning if we're not suppressing not-found errors
                if (!suppressNotFoundErrors) {
                    console.warn(`Resource not found: ${endpoint}`);
                }
                return null;
            }
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        // Only log the error if it's not a 404 or we're not suppressing not-found errors
        if (!(error.message.includes("not found") && suppressNotFoundErrors)) {
            console.error(`Error fetching from API: ${error.message}`);
        }
        throw error;
    }
};

/**
 * Formats raw Pokémon data into a consistent structure
 *
 * Standardizes Pokémon data from the API for consistent display throughout the app:
 * - Formats ID with leading zeros (for sorting and display)
 * - Capitalizes name for proper display
 * - Converts weight from hectograms to kilograms
 * - Converts height from decimeters to meters
 * - Formats type names with proper capitalization
 *
 * @param {Object} data - Raw Pokémon data from API
 * @returns {Object} Formatted Pokémon data ready for display
 */
export const formatPokemonData = (data) => ({
    id: data.id.toString().padStart(4, "0"),
    name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
    weight: (data.weight / 10).toFixed(1), // Convert hectograms to kg
    height: (data.height / 10).toFixed(1), // Convert decimeters to meters
    types: data.types.map(
        (type) =>
            type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1)
    ),
});
