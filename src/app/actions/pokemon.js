"use server";

import {
    getFeaturedPokemonFromDB,
    getPokemonFromDB,
    getPokemonListFromDB,
    getPokemonTypesFromDB,
    prisma,
} from "@/lib/db";
import { DEFAULT_FEATURED_POKEMON } from "@/lib/pokemon-constants";
import {
    extractBestSpriteUrl,
    formatPokemonId,
    formatPokemonTypes,
} from "@/lib/pokemon-utils";

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
            id: formatPokemonId(pokemon.id),
            name: pokemon.name,
            weight: pokemon.weight.toFixed(1),
            height: pokemon.height.toFixed(1),
            types: formatPokemonTypes(pokemon.types),
        };
    } catch (error) {
        console.error(`Error getting Pokémon ${idOrName}:`, error);
        return null;
    }
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
        // Return fallback data if there's an error - now using the shared constant
        return DEFAULT_FEATURED_POKEMON;
    }
}

/**
 * Shared base function for Pokemon data fetching that handles both explore and home page needs
 * This consolidates the duplicate code between getExplorePageData and getHomePageData
 */
async function getPokemonPageData(params = {}) {
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
            includeTypes = false,
            includeFeatured = false,
            featuredCount = 4,
            includeFullData = true,
            primaryDataType = "list", // Can be "list" or "featured"
        } = params;

        // Initialize response object
        const response = {};

        // STEP 1: Get primary data based on the type requested
        if (primaryDataType === "list") {
            // Get basic Pokemon list first (for explore page scenario)
            const basicPokemonList = await getPokemonListFromDB({
                limit,
                offset,
                types,
                generation,
                game,
                searchQuery,
                sortOrder,
            });

            // Default to basic list, will be overridden with full data if requested
            response.pokemonList = basicPokemonList;

            // If we need complete data and have results, enrich the data
            if (includeFullData && basicPokemonList.length > 0) {
                // FIXED: Parse IDs correctly to handle padded string IDs
                const pokemonIds = basicPokemonList.map((p) =>
                    parseInt(p.id.replace(/\D/g, ""))
                );
                const fullPokemonData = await fetchFullPokemonData(
                    pokemonIds,
                    basicPokemonList
                );
                response.pokemonList = fullPokemonData;
            }
        } else if (primaryDataType === "featured") {
            // Get featured Pokemon (for home page scenario)
            let featuredPokemon = await getFeaturedPokemonFromDB(featuredCount);

            // Default to basic featured data, will be overridden with full data if requested
            response.featuredPokemon = featuredPokemon;

            // If we need complete data and have results, enrich the data
            if (includeFullData && featuredPokemon.length > 0) {
                // FIXED: Parse IDs correctly to handle padded string IDs
                const pokemonIds = featuredPokemon.map((p) =>
                    parseInt(p.id.replace(/\D/g, ""))
                );
                const fullPokemonData = await fetchFullPokemonData(
                    pokemonIds,
                    featuredPokemon
                );
                response.featuredPokemon = fullPokemonData;
            }
        }

        // STEP 2: Get optional data as requested
        // Handle including types if requested
        if (includeTypes) {
            response.pokemonTypes = await getPokemonTypesFromDB();
        }

        // Handle including featured Pokemon if requested (for explore page)
        if (includeFeatured && primaryDataType !== "featured") {
            response.featuredPokemon = await getFeaturedPokemonFromDB(
                featuredCount
            );

            // Also enrich featured data if needed
            if (includeFullData && response.featuredPokemon.length > 0) {
                // FIXED: Parse IDs correctly to handle padded string IDs
                const featuredIds = response.featuredPokemon.map((p) =>
                    parseInt(p.id.replace(/\D/g, ""))
                );
                const fullFeaturedData = await fetchFullPokemonData(
                    featuredIds,
                    response.featuredPokemon
                );
                response.featuredPokemon = fullFeaturedData;
            }
        }

        return response;
    } catch (error) {
        console.error("Error in shared Pokemon data fetching:", error);
        // Return an empty response
        return {
            pokemonList: [],
            pokemonTypes: [],
            featuredPokemon: [],
        };
    }
}

/**
 * Helper function to fetch and format full Pokemon data
 * Extracted to avoid code duplication within getPokemonPageData
 */
async function fetchFullPokemonData(pokemonIds, basicPokemonList) {
    try {
        // Fetch complete data for all Pokémon at once with a single query
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
        const enrichedPokemonData = fullPokemonData.map((pokemon) => {
            // Extract the best sprite URL from the sprites object
            const spriteUrl = extractBestSpriteUrl(pokemon.sprites);

            // Return formatted Pokémon data with sprite URL included
            return {
                id: formatPokemonId(pokemon.id),
                name: pokemon.name,
                weight: pokemon.weight.toFixed(1),
                height: pokemon.height.toFixed(1),
                types: formatPokemonTypes(pokemon.types),
                spriteUrl: spriteUrl,
            };
        });

        // Sort the results to match the original sort order from the basic list
        const sortedPokemonList = [];
        basicPokemonList.forEach((basicPokemon) => {
            // FIXED: Improve matching to handle differences in ID formatting
            const fullPokemon = enrichedPokemonData.find((p) => {
                // Match by ID without leading zeros
                const pIdNumber = parseInt(p.id.replace(/\D/g, ""));
                const basicIdNumber = parseInt(
                    basicPokemon.id.replace(/\D/g, "")
                );

                return (
                    pIdNumber === basicIdNumber ||
                    p.name.toLowerCase() === basicPokemon.name.toLowerCase()
                );
            });
            if (fullPokemon) {
                sortedPokemonList.push(fullPokemon);
            } else {
                // Fallback to basic data if full data wasn't found
                sortedPokemonList.push(basicPokemon);
            }
        });

        return sortedPokemonList;
    } catch (error) {
        console.error("Error fetching full Pokemon data:", error);
        // Return the original list if there was an error
        return basicPokemonList;
    }
}

/**
 * Consolidated data fetching for explore page with complete Pokémon data
 * This enhanced version prefetches all needed data for Pokémon cards,
 * eliminating the need for separate requests for each card
 */
export async function getExplorePageData(params = {}) {
    return getPokemonPageData({
        ...params,
        includeTypes: params.includeTypes ?? true,
        primaryDataType: "list",
    });
}

/**
 * Consolidated data fetching for home page
 */
export async function getHomePageData(params = {}) {
    return getPokemonPageData({
        ...params,
        primaryDataType: "featured",
        featuredCount: params.featuredCount ?? 4,
    });
}
