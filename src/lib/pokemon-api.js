/**
 * Constants and utilities for interacting with the Pokemon API
 */

// Fallback images when Pokemon data is unavailable
export const POKE_BALL =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
export const QUESTION_MARK =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";

// Base URL for the Pokemon API
export const API_BASE_URL = "https://pokeapi.co/api/v2";

// Sprite image URLs
export const SPRITE_URLS = {
    // Higher quality images for modern interfaces
    officialArtwork:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/",
    // Default sprites for fallback or retro styling
    default:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/",
};

/**
 * Fetches data from the Pokemon API
 *
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {boolean} suppressNotFoundErrors - Whether to suppress 404 logs
 * @returns {Promise<Object|null>} JSON response or null for 404s
 */
export const fetchFromApi = async (
    endpoint,
    suppressNotFoundErrors = false
) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);

        if (!response.ok) {
            if (response.status === 404) {
                // Only log warning if we're not suppressing not-found errors
                if (!suppressNotFoundErrors) {
                    console.warn(`Resource not found: ${endpoint}`);
                }
                return null;
            }
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        // Don't log if it's a 404 and we're suppressing not-found errors
        if (!(error.message.includes("not found") && suppressNotFoundErrors)) {
            console.error(`Error fetching from API: ${error.message}`);
        }
        throw error;
    }
};

/**
 * Formats raw Pokemon data into a consistent structure
 *
 * @param {Object} data - Raw Pokemon data from API
 * @returns {Object} Formatted Pokemon data for display
 */
export const formatPokemonData = (data) => ({
    id: data.id.toString().padStart(4, "0"),
    name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
    weight: (data.weight / 10).toFixed(1), // Convert to kg
    height: (data.height / 10).toFixed(1), // Convert to meters
    types: data.types.map(
        (type) =>
            type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1)
    ),
});
