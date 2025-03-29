/**
 * Constants and utilities for Pokemon API interaction
 */

// Fallback images
export const POKE_BALL =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
export const QUESTION_MARK =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";

// API endpoint
export const API_BASE_URL = "https://pokeapi.co/api/v2";

// Sprite image repositories
export const SPRITE_URLS = {
    officialArtwork:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/",
    default:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/",
};

/**
 * Fetches data from the Pokemon API with error handling
 */
export const fetchFromApi = async (
    endpoint,
    suppressNotFoundErrors = false
) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);

        if (!response.ok) {
            if (response.status === 404) {
                if (!suppressNotFoundErrors) {
                    console.warn(`Resource not found: ${endpoint}`);
                }
                return null;
            }
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        if (!(error.message.includes("not found") && suppressNotFoundErrors)) {
            console.error(`Error fetching from API: ${error.message}`);
        }
        throw error;
    }
};

/**
 * Formats raw Pokemon data into a consistent structure
 */
export const formatPokemonData = (data) => ({
    id: data.id.toString().padStart(4, "0"),
    name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
    weight: (data.weight / 10).toFixed(1), // kg
    height: (data.height / 10).toFixed(1), // meters
    types: data.types.map(
        (type) =>
            type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1)
    ),
});
