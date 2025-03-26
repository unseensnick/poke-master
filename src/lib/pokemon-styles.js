/**
 * Pokemon styling utilities for consistent visual theming
 */

/**
 * Gets the CSS variable for a Pokemon type's color
 *
 * @param {string} type - Pokemon type (like "water", "fire")
 * @returns {string} CSS variable for the type color
 */
export const getTypeColor = (type) => {
    return `var(--color-pokemon-${type?.toLowerCase() || "normal"})`;
};

/**
 * Adds transparency to a color
 *
 * @param {string} color - Color value or CSS variable
 * @param {number} opacity - Transparency level (0-1)
 * @returns {string} Color with opacity applied
 */
export const getColorWithOpacity = (color, opacity) => {
    if (typeof color === "string" && color.startsWith("var")) {
        // Use Tailwind v4 rgb() from syntax
        return `rgb(from ${color} r g b / ${opacity})`;
    } else if (typeof color === "string" && color.startsWith("rgb")) {
        return color.replace("rgb", "rgba").replace(")", `, ${opacity})`);
    }
    return color;
};

/**
 * Creates style object for Pokemon type badges
 *
 * @param {string} type - Pokemon type name
 * @returns {object} Style object with background color and text styles
 */
export const getTypeStyle = (type) => {
    const typeLower = type?.toLowerCase() || "normal";
    return {
        backgroundColor: `var(--color-pokemon-${typeLower})`,
        color: "white",
        textShadow: "0px 1px 1px rgba(0, 0, 0, 0.5)", // Improves readability
    };
};

/**
 * Gets type information from Pokemon data
 *
 * @param {Object} pokemonData - Pokemon data object
 * @param {number|null} typeCount - Optional override for number of types
 * @returns {Object} Type count and type names
 */
export const extractTypeInfo = (pokemonData, typeCount = null) => {
    const effectiveTypeCount = pokemonData
        ? typeCount !== null
            ? typeCount
            : Math.min(pokemonData.types.length, 3)
        : 1;

    const typeColors = pokemonData
        ? pokemonData.types.map((type) => type.toLowerCase())
        : ["normal"];

    return {
        effectiveTypeCount,
        primaryType: typeColors[0] || "normal",
        secondaryType: typeColors[1] || typeColors[0] || "normal",
        tertiaryType:
            typeColors[2] || typeColors[1] || typeColors[0] || "normal",
    };
};

/**
 * Creates background gradient based on Pokemon types
 *
 * @param {number} typeCount - Number of types (1-3)
 * @param {string[]} types - Array of Pokemon type names
 * @returns {object} Style object with background gradient
 */
export const getBackgroundStyle = (typeCount, types = []) => {
    const typeColors = types.map((type) => type?.toLowerCase() || "normal");

    if (typeCount === 1) {
        // Single type gradient
        const type = typeColors[0] || "normal";
        return {
            background: `linear-gradient(170deg, rgb(from var(--color-pokemon-${type}) r g b / 0.08) 0%, rgb(from var(--color-pokemon-${type}) r g b / 0.15) 100%)`,
        };
    } else if (typeCount === 2) {
        // Two types gradient
        const type1 = typeColors[0] || "normal";
        const type2 = typeColors[1] || type1;
        return {
            background: `linear-gradient(170deg, rgb(from var(--color-pokemon-${type1}) r g b / 0.15) 0%, rgb(from var(--color-pokemon-${type2}) r g b / 0.15) 100%)`,
        };
    } else if (typeCount >= 3) {
        // Three types gradient
        const type1 = typeColors[0] || "normal";
        const type2 = typeColors[1] || type1;
        const type3 = typeColors[2] || type2;
        return {
            background: `linear-gradient(170deg, rgb(from var(--color-pokemon-${type1}) r g b / 0.10) 0%, rgb(from var(--color-pokemon-${type2}) r g b / 0.10) 50%, rgb(from var(--color-pokemon-${type3}) r g b / 0.10) 100%)`,
        };
    }

    // Fallback
    return {
        background: `linear-gradient(170deg, rgb(from var(--color-pokemon-normal) r g b / 0.08) 0%, rgb(from var(--color-pokemon-normal) r g b / 0.15) 100%)`,
    };
};

/**
 * Creates border gradient based on Pokemon types
 *
 * @param {number} typeCount - Number of types (1-3)
 * @param {string[]} types - Array of Pokemon type names
 * @returns {object} Style object for border gradient
 */
export const getBorderStyle = (typeCount, types = []) => {
    const typeColors = types.map((type) => type?.toLowerCase() || "normal");

    if (typeCount === 1) {
        // Single type border
        const type = typeColors[0] || "normal";
        return {
            background: `linear-gradient(to bottom right, var(--color-pokemon-${type}), rgb(from var(--color-pokemon-${type}) r g b / 0.7)) border-box`,
        };
    } else if (typeCount === 2) {
        // Two types border
        const type1 = typeColors[0] || "normal";
        const type2 = typeColors[1] || type1;
        return {
            background: `linear-gradient(to bottom right, var(--color-pokemon-${type1}), var(--color-pokemon-${type2})) border-box`,
        };
    } else if (typeCount >= 3) {
        // Three types border
        const type1 = typeColors[0] || "normal";
        const type2 = typeColors[1] || type1;
        const type3 = typeColors[2] || type2;
        return {
            background: `linear-gradient(135deg, var(--color-pokemon-${type1}) 0%, var(--color-pokemon-${type1}) 25%, var(--color-pokemon-${type2}) 40%, var(--color-pokemon-${type2}) 60%, var(--color-pokemon-${type3}) 75%, var(--color-pokemon-${type3}) 100%) border-box`,
        };
    }

    // Fallback
    return {
        background: `linear-gradient(to bottom right, var(--color-pokemon-normal), rgb(from var(--color-pokemon-normal) r g b / 0.7)) border-box`,
    };
};

/**
 * Gets text color based on Pokemon type's brightness
 *
 * @param {string} type - Pokemon type name
 * @returns {object} Style with text color and shadow
 */
export const getContrastTextColor = (type) => {
    // Types with light backgrounds need dark text
    const lightTypes = ["electric", "normal", "fairy"];
    const typeLower = type?.toLowerCase() || "normal";

    return lightTypes.includes(typeLower)
        ? {
              color: "rgba(0, 0, 0, 0.8)",
              textShadow: "0px 1px 1px rgba(255, 255, 255, 0.5)",
          }
        : { color: "white", textShadow: "0px 1px 1px rgba(0, 0, 0, 0.5)" };
};

/**
 * Creates top-left corner style for Pokemon card
 *
 * @param {number} effectiveTypeCount - Number of types
 * @param {string} primaryType - Primary Pokemon type
 * @returns {Object} Style for top-left corner
 */
export const getTopLeftAccentStyle = (effectiveTypeCount, primaryType) => {
    return {
        boxShadow:
            effectiveTypeCount === 1
                ? `inset 4px 4px 0 0 rgb(from var(--color-pokemon-${primaryType}) r g b / 0.5)`
                : effectiveTypeCount === 2
                ? `inset 4px 4px 0 0 rgb(from var(--color-pokemon-${primaryType}) r g b / 0.7)`
                : `inset 4px 4px 0 0 rgb(from var(--color-pokemon-${primaryType}) r g b / 0.6)`,
        filter: "blur(2px)",
        maskImage:
            "linear-gradient(135deg, rgba(0,0,0,1) 5%, rgba(0,0,0,0.9) 10%, rgba(0,0,0,0.8) 15%, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.4) 35%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.2) 45%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.05) 60%, transparent 70%)",
        WebkitMaskImage:
            "linear-gradient(135deg, rgba(0,0,0,1) 5%, rgba(0,0,0,0.9) 10%, rgba(0,0,0,0.8) 15%, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.4) 35%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.2) 45%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.05) 60%, transparent 70%)",
    };
};

/**
 * Creates bottom-right corner style for Pokemon card
 *
 * @param {number} effectiveTypeCount - Number of types
 * @param {string} primaryType - Primary Pokemon type
 * @param {string} secondaryType - Secondary Pokemon type
 * @param {string} tertiaryType - Tertiary Pokemon type
 * @returns {Object} Style for bottom-right corner
 */
export const getBottomRightAccentStyle = (
    effectiveTypeCount,
    primaryType,
    secondaryType,
    tertiaryType
) => {
    return {
        boxShadow:
            effectiveTypeCount === 1
                ? `inset -4px -4px 0 0 rgb(from var(--color-pokemon-${primaryType}) r g b / 0.5)`
                : effectiveTypeCount === 2
                ? `inset -4px -4px 0 0 rgb(from var(--color-pokemon-${secondaryType}) r g b / 0.7)`
                : `inset -4px -4px 0 0 rgb(from var(--color-pokemon-${tertiaryType}) r g b / 0.6)`,
        filter: "blur(2px)",
        maskImage:
            "linear-gradient(315deg, rgba(0,0,0,1) 5%, rgba(0,0,0,0.9) 10%, rgba(0,0,0,0.8) 15%, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.4) 35%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.2) 45%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.05) 60%, transparent 70%)",
        WebkitMaskImage:
            "linear-gradient(315deg, rgba(0,0,0,1) 5%, rgba(0,0,0,0.9) 10%, rgba(0,0,0,0.8) 15%, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.4) 35%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.2) 45%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.05) 60%, transparent 70%)",
    };
};

/**
 * Creates left side style for triple-type Pokemon
 *
 * @param {string} secondaryType - Secondary Pokemon type
 * @returns {Object} Style for left side
 */
export const getLeftSideAccentStyle = (secondaryType) => {
    return {
        borderLeft: `4px solid rgb(from var(--color-pokemon-${secondaryType}) r g b / 0.15)`,
        boxShadow: `0 0 10px 2px rgb(from var(--color-pokemon-${secondaryType}) r g b / 0.08)`,
        filter: "blur(3px)",
        maskImage:
            "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 80%, transparent 100%)",
        WebkitMaskImage:
            "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 80%, transparent 100%)",
    };
};

/**
 * Creates right side style for triple-type Pokemon
 *
 * @param {string} secondaryType - Secondary Pokemon type
 * @returns {Object} Style for right side
 */
export const getRightSideAccentStyle = (secondaryType) => {
    return {
        borderRight: `4px solid rgb(from var(--color-pokemon-${secondaryType}) r g b / 0.15)`,
        boxShadow: `0 0 10px 2px rgb(from var(--color-pokemon-${secondaryType}) r g b / 0.08)`,
        filter: "blur(3px)",
        maskImage:
            "linear-gradient(to left, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 80%, transparent 100%)",
        WebkitMaskImage:
            "linear-gradient(to left, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 80%, transparent 100%)",
    };
};

/**
 * Creates image glow effect for hover state
 *
 * @param {string} primaryType - Primary Pokemon type
 * @returns {Object} Style for image glow effect
 */
export const getImageGlowStyle = (primaryType) => {
    return {
        opacity: 0.6,
        boxShadow: `inset 0 0 20px 5px rgb(from var(--color-pokemon-${primaryType}) r g b / 0.3)`,
    };
};
