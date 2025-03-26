/**
 * Shared utilities for Pokemon data processing
 * Contains reusable functions for both client and server-side code
 */

/**
 * Extracts the best available sprite URL from a Pokemon's sprites object
 *
 * This function handles the complex structure of sprite data that can vary
 * between different Pokemon API responses. It attempts to find the highest
 * quality sprite using a priority-based approach:
 * 1. Official artwork (preferred)
 * 2. Default sprite
 * 3. Any URL containing "official"
 * 4. Any valid sprite URL as a last resort
 *
 * @param {Object} sprites - The sprites object from Pokemon data
 * @returns {string|null} - The best available sprite URL or null if none found
 */
export function extractBestSpriteUrl(sprites) {
    if (!sprites) return null;

    // Try various sprite paths based on the structure
    if (sprites.official && typeof sprites.official === "string") {
        return sprites.official;
    }

    if (sprites.official && sprites.official["official_artwork"]) {
        return sprites.official["official_artwork"];
    }

    if (sprites.default && typeof sprites.default === "string") {
        return sprites.default;
    }

    if (
        sprites["official-artwork"] &&
        sprites["official-artwork"].front_default
    ) {
        return sprites["official-artwork"].front_default;
    }

    // Check for any key with "official" in it
    const spriteKeys = Object.keys(sprites);
    for (const key of spriteKeys) {
        if (key.includes("official")) {
            return sprites[key];
        }
    }

    // Last resort, look for any URL
    for (const key of spriteKeys) {
        const value = sprites[key];
        if (typeof value === "string" && value.startsWith("http")) {
            return value;
        }
    }

    return null;
}

/**
 * Formats a Pokemon ID to a padded string with leading zeros
 *
 * @param {number|string} id - The Pokemon ID to format
 * @param {number} padLength - The length to pad to (default: 4)
 * @returns {string} - The formatted ID string (e.g., "0025" for Pikachu)
 */
export function formatPokemonId(id, padLength = 4) {
    return String(id).padStart(padLength, "0");
}

/**
 * Capitalizes the first letter of a string
 * Used for formatting Pokemon types and names
 *
 * @param {string} str - The string to capitalize
 * @returns {string} - The capitalized string
 */
export function capitalizeFirstLetter(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formats type names from a Pokemon's types array
 *
 * @param {Array} types - Array of type strings or objects with name property
 * @returns {Array} - Array of capitalized type names
 */
export function formatPokemonTypes(types) {
    if (!types || !Array.isArray(types)) return [];

    return types.map((type) => {
        // Handle both string types and object types (with name property)
        const typeName =
            typeof type === "string"
                ? type
                : type.type?.name || type.name || "";
        return capitalizeFirstLetter(typeName);
    });
}
