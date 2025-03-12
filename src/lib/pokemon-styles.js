/**
 * Styling utilities for Pokemon cards using CSS variables
 * Tailwind CSS v4 compatible with rgb() from syntax
 */

/**
 * Gets the CSS variable for a Pokemon type color
 *
 * @param {string} type - Pokemon type name
 * @returns {string} CSS variable reference
 */
export const getTypeColor = (type) => {
    return `var(--color-pokemon-${type?.toLowerCase() || "normal"})`;
};

/**
 * Applies opacity to a color using Tailwind v4 syntax
 *
 * @param {string} color - Color value (CSS var or rgb)
 * @param {number} opacity - Opacity value (0-1)
 * @returns {string} Color with opacity
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
 * Generates style object for type badges
 *
 * @param {string} type - Pokemon type
 * @returns {object} Style object with background, text color and shadow
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
 * Generates background gradient based on Pokemon's types
 *
 * @param {number} typeCount - Number of types to consider (1-3)
 * @param {string[]} types - Array of Pokemon types
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
 * Generates border gradient based on Pokemon's types
 *
 * @param {number} typeCount - Number of types to consider (1-3)
 * @param {string[]} types - Array of Pokemon types
 * @returns {object} Style object with border gradient
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
 * Determines appropriate text color based on background type
 *
 * @param {string} type - Pokemon type
 * @returns {object} Style object with text color and shadow
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
