"use server";

import {
    getFeaturedPokemonFromDB,
    getPokemonFromDB,
    getPokemonListFromDB,
    getPokemonTypesFromDB,
    prisma,
} from "@/lib/db";

/**
 * Get a single Pokémon by ID or name
 */
export async function getPokemon(idOrName) {
    try {
        const pokemon = await getPokemonFromDB(idOrName);

        if (!pokemon) {
            return null;
        }

        // Format to match the expected structure used by components
        return {
            id: pokemon.id.toString().padStart(4, "0"),
            name: pokemon.name,
            weight: pokemon.weight.toFixed(1),
            height: pokemon.height.toFixed(1),
            types: pokemon.types.map(
                (type) => type.charAt(0).toUpperCase() + type.slice(1)
            ),
        };
    } catch (error) {
        console.error(`Error getting Pokémon ${idOrName}:`, error);
        return null;
    }
}

/**
 * Extract the best sprite URL from a Pokémon's sprites object
 */
function extractBestSpriteUrl(sprites) {
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
 * Get a Pokémon sprite URL by ID
 */
export async function getPokemonSprite(pokemonId) {
    try {
        // Fetch Pokemon with sprites field from the database
        const pokemon = await prisma.pokemon.findUnique({
            where: { id: pokemonId },
            select: {
                sprites: true,
            },
        });

        if (!pokemon || !pokemon.sprites) {
            return null;
        }

        return extractBestSpriteUrl(pokemon.sprites);
    } catch (error) {
        console.error(
            `Error getting Pokémon sprite for ID ${pokemonId}:`,
            error
        );
        return null;
    }
}

/**
 * Get a filtered list of Pokémon with pagination
 */
export async function getPokemonList(params = {}) {
    try {
        const {
            limit = 20,
            offset = 0,
            types = [],
            generation = null,
            game = null,
            searchQuery = "",
            sortOrder = "id-asc",
        } = params;

        return await getPokemonListFromDB({
            limit,
            offset,
            types,
            generation,
            game,
            searchQuery,
            sortOrder,
        });
    } catch (error) {
        console.error("Error fetching Pokémon list:", error);
        return [];
    }
}

/**
 * Get all Pokémon types
 */
export async function getPokemonTypes() {
    try {
        return await getPokemonTypesFromDB();
    } catch (error) {
        console.error("Error fetching Pokémon types:", error);
        return [];
    }
}

/**
 * Get featured Pokémon
 */
export async function getFeaturedPokemon(count = 4) {
    try {
        return await getFeaturedPokemonFromDB(count);
    } catch (error) {
        console.error("Error fetching featured Pokémon:", error);
        // Return fallback data if there's an error
        return [
            { name: "Bulbasaur", id: "0001" },
            { name: "Pikachu", id: "0025" },
            { name: "Charizard", id: "0006" },
            { name: "Lucario", id: "0448" },
        ];
    }
}

/**
 * Consolidated data fetching for explore page with complete Pokémon data
 * This enhanced version prefetches all needed data for Pokémon cards,
 * eliminating the need for separate requests for each card
 */
export async function getExplorePageData(params = {}) {
    try {
        // Extract parameters with defaults
        const {
            limit = 20,
            offset = 0,
            types = [],
            generation = null,
            game = null,
            searchQuery = "",
            sortOrder = "id-asc",
            includeTypes = true,
            includeFeatured = false,
            featuredCount = 4,
            includeFullData = true, // Controls whether to fetch full details
        } = params;

        // First, get the basic list of matching Pokémon IDs and names
        const basicPokemonList = await getPokemonListFromDB({
            limit,
            offset,
            types,
            generation,
            game,
            searchQuery,
            sortOrder,
        });

        // If we need complete data, fetch details for each Pokémon
        let pokemonList = basicPokemonList;

        if (includeFullData && basicPokemonList.length > 0) {
            // Fetch complete data for all Pokémon at once with a single query
            // This is more efficient than fetching them one by one
            const pokemonIds = basicPokemonList.map((p) => parseInt(p.id));

            const fullPokemonData = await prisma.pokemon.findMany({
                where: {
                    id: {
                        in: pokemonIds,
                    },
                },
                select: {
                    id: true,
                    name: true,
                    weight: true,
                    height: true,
                    types: true,
                    sprites: true,
                },
            });

            // Map the full data to the format expected by components
            pokemonList = fullPokemonData.map((pokemon) => {
                // Extract the best sprite URL from the sprites object
                const spriteUrl = extractBestSpriteUrl(pokemon.sprites);

                // Return formatted Pokémon data with sprite URL included
                return {
                    id: pokemon.id.toString().padStart(4, "0"),
                    name: pokemon.name,
                    weight: pokemon.weight.toFixed(1),
                    height: pokemon.height.toFixed(1),
                    types: pokemon.types.map(
                        (type) => type.charAt(0).toUpperCase() + type.slice(1)
                    ),
                    spriteUrl: spriteUrl,
                };
            });

            // Sort the results to match the original sort order from the basic list
            // This is needed because the database query might return in a different order
            const sortedPokemonList = [];
            basicPokemonList.forEach((basicPokemon) => {
                const fullPokemon = pokemonList.find(
                    (p) =>
                        p.id === basicPokemon.id ||
                        p.name.toLowerCase() === basicPokemon.name.toLowerCase()
                );
                if (fullPokemon) {
                    sortedPokemonList.push(fullPokemon);
                } else {
                    // Fallback to basic data if full data wasn't found
                    sortedPokemonList.push(basicPokemon);
                }
            });

            pokemonList = sortedPokemonList;
        }

        // Build the rest of the promises array for other data
        const promises = [];
        const resultKeys = [];

        // Conditionally add other data fetches
        if (includeTypes) {
            promises.push(getPokemonTypesFromDB());
            resultKeys.push("pokemonTypes");
        }

        if (includeFeatured) {
            promises.push(getFeaturedPokemonFromDB(featuredCount));
            resultKeys.push("featuredPokemon");
        }

        // Execute remaining database queries in parallel
        const otherResults = await Promise.all(promises);

        // Build response object with all data
        const response = { pokemonList };
        resultKeys.forEach((key, index) => {
            response[key] = otherResults[index];
        });

        return response;
    } catch (error) {
        console.error("Error fetching explore page data:", error);
        return {
            pokemonList: [],
            pokemonTypes: [],
            featuredPokemon: [],
        };
    }
}

/**
 * Consolidated data fetching for home page
 */
export async function getHomePageData(params = {}) {
    try {
        const {
            featuredCount = 4,
            includeTypes = false,
            includeFullData = true,
        } = params;

        // Get featured Pokémon
        let featuredPokemon = await getFeaturedPokemonFromDB(featuredCount);

        // If we need complete data for the featured Pokémon, fetch it
        if (includeFullData && featuredPokemon.length > 0) {
            const pokemonIds = featuredPokemon.map((p) => parseInt(p.id));

            const fullPokemonData = await prisma.pokemon.findMany({
                where: {
                    id: {
                        in: pokemonIds,
                    },
                },
                select: {
                    id: true,
                    name: true,
                    weight: true,
                    height: true,
                    types: true,
                    sprites: true,
                },
            });

            // Map the full data to the format expected by components
            featuredPokemon = fullPokemonData.map((pokemon) => {
                // Extract the best sprite URL from the sprites object
                const spriteUrl = extractBestSpriteUrl(pokemon.sprites);

                // Return formatted Pokémon data with sprite URL included
                return {
                    id: pokemon.id.toString().padStart(4, "0"),
                    name: pokemon.name,
                    weight: pokemon.weight.toFixed(1),
                    height: pokemon.height.toFixed(1),
                    types: pokemon.types.map(
                        (type) => type.charAt(0).toUpperCase() + type.slice(1)
                    ),
                    spriteUrl: spriteUrl,
                };
            });
        }

        // Create response object
        const response = { featuredPokemon };

        // Conditionally add types
        if (includeTypes) {
            response.pokemonTypes = await getPokemonTypesFromDB();
        }

        return response;
    } catch (error) {
        console.error("Error fetching home page data:", error);
        return {
            featuredPokemon: [
                { name: "Bulbasaur", id: "0001" },
                { name: "Pikachu", id: "0025" },
                { name: "Charizard", id: "0006" },
                { name: "Lucario", id: "0448" },
            ],
            pokemonTypes: [],
        };
    }
}
