/**
 * Direct PokeAPI interaction utilities with fallback handling
 */

// Fallback image URLs
export const POKE_BALL =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
export const MASTER_BALL =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png";

/**
 * Fetches and formats Pokemon data from PokeAPI
 *
 * @param {string|number} pokemonIdOrName - Pokemon ID or name
 * @returns {Promise<object>} - Formatted Pokemon data with id, name, weight, height, and types
 * @throws {Error} When API request fails or returns invalid data
 */
export const fetchPokemon = async (pokemonIdOrName) => {
    try {
        const cleanId = pokemonIdOrName?.toString().toLowerCase().trim();

        if (!cleanId) {
            throw new Error("Invalid Pokemon ID or name");
        }

        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${cleanId}`
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch Pokémon: ${response.status} ${response.statusText}`
            );
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error(`Invalid response format: ${contentType}`);
        }

        const data = await response.json();

        // Transform API data into a more usable format
        return {
            id: data.id.toString().padStart(3, "0"),
            name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
            weight: (data.weight / 10).toFixed(1), // Convert to kg
            height: (data.height / 10).toFixed(1), // Convert to m
            types: data.types.map(
                (type) =>
                    type.type.name.charAt(0).toUpperCase() +
                    type.type.name.slice(1)
            ),
        };
    } catch (error) {
        console.error(
            `Error fetching Pokémon data for '${pokemonIdOrName}':`,
            error
        );
        throw error; // Rethrow for proper error handling upstream
    }
};

/**
 * Fetches Pokemon image with fallbacks to default images
 *
 * @param {string} pokemonName - Pokemon name
 * @returns {Promise<string>} - URL to the Pokemon's image (or fallback)
 */
export const fetchPokemonImage = async (pokemonName) => {
    try {
        // Special case for fictional Pokemon
        if (!pokemonName || pokemonName === "???") {
            return MASTER_BALL;
        }

        const cleanName = pokemonName.toLowerCase().trim();
        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${cleanName}`
        );

        if (!response.ok) {
            console.warn(
                `Failed to fetch image for ${pokemonName}: ${response.status}`
            );
            return POKE_BALL;
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.warn(`Invalid response format: ${contentType}`);
            return POKE_BALL;
        }

        const data = await response.json();

        // Get the best available image with fallbacks
        return (
            data.sprites?.other?.["official-artwork"]?.front_default ||
            data.sprites?.front_default ||
            POKE_BALL
        );
    } catch (error) {
        console.error(`Error fetching image for ${pokemonName}:`, error);
        return POKE_BALL; // Return default image on error
    }
};
