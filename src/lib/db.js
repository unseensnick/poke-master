import { DEFAULT_FEATURED_POKEMON } from "@/lib/pokemon-constants";
import { PrismaClient } from "@prisma/client";

// Prevent multiple database connections in development
const globalForPrisma = global;
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Gets a single Pokemon by ID or name
 *
 * @param {string|number} idOrName - Pokemon ID or name
 * @returns {Object|null} Pokemon data or null if not found
 */
export async function getPokemonFromDB(idOrName) {
    try {
        let where = {};

        // Check if search term is a number or string
        if (typeof idOrName === "number" || !isNaN(parseInt(idOrName))) {
            where = { id: parseInt(idOrName) };
        } else {
            // Case-insensitive name search
            where = {
                name: {
                    contains: idOrName.toString(),
                    mode: "insensitive",
                },
            };
        }

        // Only show standard Pokemon (ID <= 1025)
        where = {
            ...where,
            id: {
                ...where.id,
                lte: 1025,
            },
        };

        const pokemon = await prisma.pokemon.findFirst({ where });
        return pokemon;
    } catch (error) {
        console.error(`Error getting Pokémon ${idOrName}:`, error);
        return null;
    }
}

/**
 * Gets filtered Pokemon list with pagination
 *
 * @param {Object} options - Filter and pagination options
 * @param {number} options.limit - Max results to return
 * @param {number} options.offset - Starting position
 * @param {Array} options.types - Pokemon types to include
 * @param {number} options.generation - Generation to filter by
 * @param {string} options.game - Game to filter by
 * @param {string} options.searchQuery - Text to search for
 * @param {string} options.sortOrder - How to sort results
 * @returns {Array} Filtered Pokemon list
 */
export async function getPokemonListFromDB({
    limit = 20,
    offset = 0,
    types = [],
    generation = null,
    game = null,
    searchQuery = "",
    sortOrder = "id-asc",
}) {
    try {
        // Start with ID filter (standard Pokemon only)
        let where = {
            id: {
                lte: 1025,
            },
        };

        // Add text search if provided
        if (searchQuery) {
            where = {
                ...where,
                OR: [
                    { name: { contains: searchQuery, mode: "insensitive" } },
                    // If search is a number, also try matching ID
                    isNaN(parseInt(searchQuery))
                        ? undefined
                        : {
                              id: {
                                  equals: parseInt(searchQuery),
                                  lte: 1025,
                              },
                          },
                ].filter(Boolean), // Remove undefined values
            };
        }

        // Filter by generation if provided
        if (generation) {
            where = {
                ...where,
                generationId: parseInt(generation),
            };
        }

        // Filter by game (using generation as proxy)
        if (game) {
            const gameToGen = {
                // Generation 1
                "red-blue": 1,
                yellow: 1,

                // Generation 2
                "gold-silver": 2,
                crystal: 2,

                // And so on for other games...
            };

            if (gameToGen[game]) {
                where = {
                    ...where,
                    generationId: gameToGen[game],
                };
            }
        }

        // Filter by types if provided
        if (types && types.length > 0) {
            where = {
                ...where,
                types: {
                    hasSome: types.map((type) => type.toLowerCase()),
                },
            };
        }

        // Determine sort order
        let orderBy = {};
        switch (sortOrder) {
            case "id-asc":
                orderBy = { id: "asc" };
                break;
            case "id-desc":
                orderBy = { id: "desc" };
                break;
            case "name-asc":
                orderBy = { name: "asc" };
                break;
            case "name-desc":
                orderBy = { name: "desc" };
                break;
            default:
                orderBy = { id: "asc" };
        }

        // Execute database query
        const pokemon = await prisma.pokemon.findMany({
            where,
            orderBy,
            skip: offset,
            take: limit,
            select: {
                id: true,
                name: true,
            },
        });

        // Format results
        return pokemon.map((p) => ({
            id: p.id.toString().padStart(4, "0"),
            name: p.name,
        }));
    } catch (error) {
        console.error("Error fetching Pokémon list:", error);
        return [];
    }
}

/**
 * Gets all Pokemon types (excluding Stellar)
 *
 * @returns {Array} List of Pokemon types
 */
export async function getPokemonTypesFromDB() {
    try {
        return await prisma.pokemonType.findMany({
            where: {
                NOT: {
                    name: {
                        equals: "stellar",
                        mode: "insensitive",
                    },
                },
            },
            orderBy: { name: "asc" },
        });
    } catch (error) {
        console.error("Error fetching Pokémon types:", error);
        return [];
    }
}

/**
 * Creates a daily seed based on Norway time
 * Used for consistent random Pokemon selection
 *
 * @returns {string} Date string for seeding
 */
function getDailyNorwaySeed() {
    // Get current date in Norway time (UTC+1/UTC+2)
    const now = new Date();

    // Convert to Norway time
    const formatter = new Intl.DateTimeFormat("no", {
        timeZone: "Europe/Oslo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    // Get date string in Norway time
    const norwayDateString = formatter.format(now);

    // Return in YYYYMMDD format
    return norwayDateString.replace(/\D/g, "");
}

/**
 * Gets featured Pokemon (changes daily)
 *
 * @param {number} count - Number of Pokemon to return
 * @returns {Array} Featured Pokemon
 */
export async function getFeaturedPokemonFromDB(count = 4) {
    try {
        // Get seed for consistent daily selection
        const dailySeed = getDailyNorwaySeed();

        // Use seed to get the same Pokemon all day
        const featuredPokemon = await prisma.$queryRaw`
            SELECT id, name 
            FROM (
                SELECT *, setseed(${parseFloat("0." + dailySeed)})
                FROM "Pokemon"
                WHERE id <= 1025
            ) AS seeded_pokemon
            ORDER BY random() 
            LIMIT ${count}
        `;

        return featuredPokemon.map((p) => ({
            id: p.id.toString().padStart(4, "0"),
            name: p.name,
        }));
    } catch (error) {
        console.error("Error fetching featured Pokémon:", error);

        // Return fallback Pokemon from constants
        return DEFAULT_FEATURED_POKEMON;
    }
}

/**
 * Gets a single Pokemon with sprite data
 *
 * @param {string|number} pokemonId - Pokemon ID or name
 * @returns {Object|null} Pokemon with sprites or null
 */
export async function getPokemonWithSpritesFromDB(pokemonId) {
    try {
        let where = {};

        // Check if pokemonId is a number
        if (typeof pokemonId === "number" || !isNaN(parseInt(pokemonId))) {
            where = { id: parseInt(pokemonId) };
        } else {
            // Case-insensitive name search
            where = {
                name: {
                    contains: pokemonId.toString(),
                    mode: "insensitive",
                },
            };
        }

        // Only show standard Pokemon
        where = {
            ...where,
            id: {
                ...where.id,
                lte: 1025,
            },
        };

        // Get Pokemon with sprite data
        const pokemon = await prisma.pokemon.findFirst({
            where,
            select: {
                id: true,
                name: true,
                sprites: true,
            },
        });

        return pokemon;
    } catch (error) {
        console.error(
            `Error getting Pokémon with sprites for ${pokemonId}:`,
            error
        );
        return null;
    }
}
