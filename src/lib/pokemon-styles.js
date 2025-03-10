/**
 * Styling utility functions for Pokemon cards using CSS variables
 */

export const getTypeColor = (type) => {
    return `var(--color-${type?.toLowerCase() || "normal"})`;
};

export const getColorWithOpacity = (color, opacity) => {
    if (typeof color === "string" && color.startsWith("var")) {
        return `rgb(from ${color} r g b / ${opacity})`;
    } else if (typeof color === "string" && color.startsWith("rgb")) {
        return color.replace("rgb", "rgba").replace(")", `, ${opacity})`);
    }
    return color;
};

/**
 * Returns the background and text color styles for type badges
 */
export const getTypeStyle = (type) => {
    const typeLower = type?.toLowerCase() || "normal";
    return {
        backgroundColor: `var(--color-${typeLower})`,
        color: "white",
    };
};

/**
 * Generates background gradient based on Pokemon's types
 */
export const getBackgroundStyle = (typeCount, types = []) => {
    const typeColors = types.map((type) => type?.toLowerCase() || "normal");

    if (typeCount === 1) {
        // Single type gradient
        const type = typeColors[0] || "normal";
        return {
            background: `linear-gradient(170deg, rgb(from var(--color-${type}) r g b / 0.08) 0%, rgb(from var(--color-${type}) r g b / 0.15) 100%)`,
        };
    } else if (typeCount === 2) {
        // Two types gradient
        const type1 = typeColors[0] || "normal";
        const type2 = typeColors[1] || type1;
        return {
            background: `linear-gradient(170deg, rgb(from var(--color-${type1}) r g b / 0.15) 0%, rgb(from var(--color-${type2}) r g b / 0.15) 100%)`,
        };
    } else if (typeCount >= 3) {
        // Three or more types gradient
        const type1 = typeColors[0] || "normal";
        const type2 = typeColors[1] || type1;
        const type3 = typeColors[2] || type2;
        return {
            background: `linear-gradient(170deg, rgb(from var(--color-${type1}) r g b / 0.10) 0%, rgb(from var(--color-${type2}) r g b / 0.10) 50%, rgb(from var(--color-${type3}) r g b / 0.10) 100%)`,
        };
    }

    // Fallback
    return {
        background: `linear-gradient(170deg, rgb(from var(--color-normal) r g b / 0.08) 0%, rgb(from var(--color-normal) r g b / 0.15) 100%)`,
    };
};

/**
 * Generates border gradient based on Pokemon's types
 */
export const getBorderStyle = (typeCount, types = []) => {
    const typeColors = types.map((type) => type?.toLowerCase() || "normal");

    if (typeCount === 1) {
        // Single type
        const type = typeColors[0] || "normal";
        return {
            background: `linear-gradient(to bottom right, var(--color-${type}), rgb(from var(--color-${type}) r g b / 0.7)) border-box`,
        };
    } else if (typeCount === 2) {
        // Two types
        const type1 = typeColors[0] || "normal";
        const type2 = typeColors[1] || type1;
        return {
            background: `linear-gradient(to bottom right, var(--color-${type1}), var(--color-${type2})) border-box`,
        };
    } else if (typeCount >= 3) {
        // Three or more types
        const type1 = typeColors[0] || "normal";
        const type2 = typeColors[1] || type1;
        const type3 = typeColors[2] || type2;
        return {
            background: `linear-gradient(135deg, var(--color-${type1}) 0%, var(--color-${type1}) 25%, var(--color-${type2}) 40%, var(--color-${type2}) 60%, var(--color-${type3}) 75%, var(--color-${type3}) 100%) border-box`,
        };
    }

    // Fallback
    return {
        background: `linear-gradient(to bottom right, var(--color-normal), rgb(from var(--color-normal) r g b / 0.7)) border-box`,
    };
};
