/**
 * Shared utilities for Pokemon data processing
 */

/**
 * Gets best available sprite URL from sprites object
 */
export function extractBestSpriteUrl(sprites) {
    if (!sprites) return null;

    // Try official artwork first (highest quality)
    if (sprites.official && typeof sprites.official === "string") {
        return sprites.official;
    }

    if (sprites.official && sprites.official["official_artwork"]) {
        return sprites.official["official_artwork"];
    }

    // Try default sprite
    if (sprites.default && typeof sprites.default === "string") {
        return sprites.default;
    }

    if (
        sprites["official-artwork"] &&
        sprites["official-artwork"].front_default
    ) {
        return sprites["official-artwork"].front_default;
    }

    // Look for any key with "official" in it
    const spriteKeys = Object.keys(sprites);
    for (const key of spriteKeys) {
        if (key.includes("official")) {
            return sprites[key];
        }
    }

    // Last resort - any valid URL
    for (const key of spriteKeys) {
        const value = sprites[key];
        if (typeof value === "string" && value.startsWith("http")) {
            return value;
        }
    }

    return null;
}

/**
 * Adds leading zeros to Pokemon ID
 */
export function formatPokemonId(id, padLength = 4) {
    return String(id).padStart(padLength, "0");
}

/**
 * Capitalizes first letter of string
 */
export function capitalizeFirstLetter(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formats Pokemon types with capitalized names
 */
export function formatPokemonTypes(types) {
    if (!types || !Array.isArray(types)) return [];

    return types.map((type) => {
        // Handle both string types and object types
        const typeName =
            typeof type === "string"
                ? type
                : type.type?.name || type.name || "";
        return capitalizeFirstLetter(typeName);
    });
}
