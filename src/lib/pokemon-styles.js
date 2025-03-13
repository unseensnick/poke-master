/**
 * Pokemon styling utilities for consistent visual theming across components
 *
 * This module provides helper functions to apply type-based styling throughout the app,
 * ensuring a consistent look and making it easier to style Pokemon-related UI elements.
 * All utilities are compatible with Tailwind CSS v4's "rgb() from" syntax.
 */

/**
 * Converts a Pokemon type name to its CSS color variable
 *
 * @param {string} type - Pokemon type (like "water", "fire", etc.)
 * @returns {string} CSS variable reference (e.g., "var(--color-pokemon-water)")
 */
export const getTypeColor = (type) => {
    return `var(--color-pokemon-${type?.toLowerCase() || "normal"})`;
};

/**
 * Adds transparency to a color using the appropriate Tailwind v4 syntax
 *
 * This is useful for creating semi-transparent versions of type colors
 * without having to define new CSS variables for each opacity level.
 *
 * @param {string} color - Color value (can be CSS variable or direct rgb value)
 * @param {number} opacity - Transparency level (0=transparent, 1=solid)
 * @returns {string} Color with opacity applied in the correct format
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
 * Creates styles for type badges with appropriate colors and readability enhancements
 *
 * The text shadow improves readability, especially for lighter type colors
 * where white text might be harder to read without contrast enhancement.
 *
 * @param {string} type - Pokemon type name
 * @returns {object} Style object with background color, text color and text shadow
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
 * Extracts and normalizes type information from Pokemon data
 *
 * @param {Object} pokemonData - Pokemon data object
 * @param {number|null} typeCount - Optional override for number of types
 * @returns {Object} Object with effectiveTypeCount and type names
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
 * Creates background gradient styles based on Pokemon's type(s)
 *
 * Different gradients are generated based on how many types the Pokemon has:
 * - Single type: subtle gradient of the same color
 * - Two types: gradient transitioning between both type colors
 * - Three types: three-color gradient with middle transition point
 *
 * @param {number} typeCount - Number of types to use (1-3)
 * @param {string[]} types - Array of Pokemon type names
 * @returns {object} Style object with appropriate background gradient
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
        // Three or more types gradient
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
 * Creates border gradient styles based on Pokemon's type(s)
 *
 * Similar to background gradients, but specifically for card borders:
 * - Single type: gradient from full color to semi-transparent
 * - Two types: gradient transitioning between both type colors
 * - Three types: more complex gradient with color stops for a smoother blend
 *
 * @param {number} typeCount - Number of types to use (1-3)
 * @param {string[]} types - Array of Pokemon type names
 * @returns {object} Style object with border gradient definition
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
        // Three or more types border
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
 * Selects an appropriate text color based on a Pokemon type's brightness
 *
 * Some Pokemon types have lighter colors (like Electric or Normal) which need
 * dark text for readability, while most types work better with white text.
 *
 * @param {string} type - Pokemon type name
 * @returns {object} Style object with text color and shadow for optimal contrast
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
 * Generates top-left corner accent style for Pokemon card
 *
 * @param {number} effectiveTypeCount - Number of types to consider
 * @param {string} primaryType - Primary Pokemon type
 * @returns {Object} Style object for top-left corner accent
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
 * Generates bottom-right corner accent style for Pokemon card
 *
 * @param {number} effectiveTypeCount - Number of types to consider
 * @param {string} primaryType - Primary Pokemon type
 * @param {string} secondaryType - Secondary Pokemon type
 * @param {string} tertiaryType - Tertiary Pokemon type
 * @returns {Object} Style object for bottom-right corner accent
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
 * Generates left side accent style for triple-type Pokemon
 *
 * @param {string} secondaryType - Secondary Pokemon type
 * @returns {Object} Style object for left side accent
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
 * Generates right side accent style for triple-type Pokemon
 *
 * @param {string} secondaryType - Secondary Pokemon type
 * @returns {Object} Style object for right side accent
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
 * Generates image glow effect style for hover state
 *
 * @param {string} primaryType - Primary Pokemon type
 * @returns {Object} Style object for image glow effect
 */
export const getImageGlowStyle = (primaryType) => {
    return {
        opacity: 0.6,
        boxShadow: `inset 0 0 20px 5px rgb(from var(--color-pokemon-${primaryType}) r g b / 0.3)`,
    };
};
