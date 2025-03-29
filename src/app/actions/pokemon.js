"use server";

import {
    getFeaturedPokemonFromDB,
    getPokemonFromDB,
    getPokemonListFromDB,
    getPokemonTypesFromDB,
    getPokemonWithSpritesFromDB,
    prisma,
} from "@/lib/db";
import { DEFAULT_FEATURED_POKEMON } from "@/lib/pokemon-constants";
import {
    extractBestSpriteUrl,
    formatPokemonId,
    formatPokemonTypes,
} from "@/lib/pokemon-utils";

/**
 * Retrieves a single Pokémon by ID or name
 * @param {string|number} idOrName - Pokémon ID or name
 * @returns {Promise<Object|null>} Formatted Pokémon data with id, name, weight, height, types
 */
export async function getPokemon(idOrName) {
    try {
        const pokemon = await getPokemonFromDB(idOrName);
        if (!pokemon) return null;

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
 * Fetches a Pokémon's sprite URL by ID
 * @param {number} pokemonId - Numeric Pokémon ID
 * @returns {Promise<string|null>} Best available sprite URL
 */
export async function getPokemonSprite(pokemonId) {
    try {
        const pokemon = await getPokemonWithSpritesFromDB(pokemonId);

        if (!pokemon || !pokemon.sprites) return null;
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
 * Retrieves a paginated and filtered list of Pokémon
 * @param {Object} params - Query parameters
 * @param {number} [params.limit=20] - Results per page
 * @param {number} [params.offset=0] - Starting position for pagination
 * @param {string[]} [params.types=[]] - Filter by Pokémon types
 * @param {number|null} [params.generation=null] - Filter by generation
 * @param {string|null} [params.game=null] - Filter by game
 * @param {string} [params.searchQuery=""] - Search by name or ID
 * @param {string} [params.sortOrder="id-asc"] - Sorting method
 * @returns {Promise<Array>} List of matching Pokémon
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
 * Gets all available Pokémon types
 * @returns {Promise<Array>} List of Pokémon types
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
 * Retrieves featured Pokémon for display
 * @param {number} [count=4] - Number of Pokémon to return
 * @returns {Promise<Array>} Featured Pokémon data
 */
export async function getFeaturedPokemon(count = 4) {
    try {
        return await getFeaturedPokemonFromDB(count);
    } catch (error) {
        console.error("Error fetching featured Pokémon:", error);
        return DEFAULT_FEATURED_POKEMON;
    }
}

/**
 * Core data fetching function for both explore and home pages
 * Optimizes API calls by fetching multiple data types in a single request
 *
 * @param {Object} params - Query parameters
 * @param {number} [params.limit=20] - Results per page
 * @param {number} [params.offset=0] - Starting position
 * @param {string[]} [params.types=[]] - Type filters
 * @param {number|null} [params.generation=null] - Generation filter
 * @param {string|null} [params.game=null] - Game filter
 * @param {string} [params.searchQuery=""] - Text search
 * @param {string} [params.sortOrder="id-asc"] - Sort mode
 * @param {boolean} [params.includeTypes=false] - Include type data
 * @param {boolean} [params.includeFeatured=false] - Include featured Pokémon
 * @param {number} [params.featuredCount=4] - Number of featured Pokémon
 * @param {boolean} [params.includeFullData=true] - Include sprites and stats
 * @param {string} [params.primaryDataType="list"] - Main data to fetch ("list" or "featured")
 * @returns {Promise<Object>} Combined Pokémon data object
 */
async function getPokemonPageData(params = {}) {
    try {
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
            primaryDataType = "list",
        } = params;

        const response = {};

        // Fetch primary data based on page type
        if (primaryDataType === "list") {
            const basicPokemonList = await getPokemonListFromDB({
                limit,
                offset,
                types,
                generation,
                game,
                searchQuery,
                sortOrder,
            });

            response.pokemonList = basicPokemonList;

            if (includeFullData && basicPokemonList.length > 0) {
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
            let featuredPokemon = await getFeaturedPokemonFromDB(featuredCount);
            response.featuredPokemon = featuredPokemon;

            if (includeFullData && featuredPokemon.length > 0) {
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

        // Get optional data if requested
        if (includeTypes) {
            response.pokemonTypes = await getPokemonTypesFromDB();
        }

        if (includeFeatured && primaryDataType !== "featured") {
            response.featuredPokemon = await getFeaturedPokemonFromDB(
                featuredCount
            );

            if (includeFullData && response.featuredPokemon.length > 0) {
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
        return {
            pokemonList: [],
            pokemonTypes: [],
            featuredPokemon: [],
        };
    }
}

/**
 * Enriches basic Pokémon data with sprites and detailed information
 *
 * @param {number[]} pokemonIds - Array of Pokémon IDs to fetch
 * @param {Object[]} basicPokemonList - Basic Pokémon data (used to preserve order)
 * @returns {Promise<Array>} Enhanced Pokémon data with sprites and detailed stats
 */
async function fetchFullPokemonData(pokemonIds, basicPokemonList) {
    try {
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

        const enrichedPokemonData = fullPokemonData.map((pokemon) => {
            const spriteUrl = extractBestSpriteUrl(pokemon.sprites);

            return {
                id: formatPokemonId(pokemon.id),
                name: pokemon.name,
                weight: pokemon.weight.toFixed(1),
                height: pokemon.height.toFixed(1),
                types: formatPokemonTypes(pokemon.types),
                spriteUrl: spriteUrl,
            };
        });

        // Preserve original sort order from the basic list
        const sortedPokemonList = [];
        basicPokemonList.forEach((basicPokemon) => {
            const fullPokemon = enrichedPokemonData.find((p) => {
                const pIdNumber = parseInt(p.id.replace(/\D/g, ""));
                const basicIdNumber = parseInt(
                    basicPokemon.id.replace(/\D/g, "")
                );

                return (
                    pIdNumber === basicIdNumber ||
                    p.name.toLowerCase() === basicPokemon.name.toLowerCase()
                );
            });

            sortedPokemonList.push(fullPokemon || basicPokemon);
        });

        return sortedPokemonList;
    } catch (error) {
        console.error("Error fetching full Pokemon data:", error);
        return basicPokemonList;
    }
}

/**
 * Fetches optimized data for the Explore page
 * Combines Pokémon list, type data, and optional featured Pokémon in a single query
 *
 * @param {Object} params - Query parameters (same as getPokemonPageData)
 * @returns {Promise<Object>} Combined data with pokemonList, pokemonTypes, and optionally featuredPokemon
 */
export async function getExplorePageData(params = {}) {
    return getPokemonPageData({
        ...params,
        includeTypes: params.includeTypes ?? true,
        primaryDataType: "list",
    });
}

/**
 * Fetches optimized data for the Home page
 * Focuses on featured Pokémon with optional type data
 *
 * @param {Object} params - Query parameters (same as getPokemonPageData)
 * @returns {Promise<Object>} Combined data with featuredPokemon and optionally pokemonTypes
 */
export async function getHomePageData(params = {}) {
    return getPokemonPageData({
        ...params,
        primaryDataType: "featured",
        featuredCount: params.featuredCount ?? 4,
    });
}
