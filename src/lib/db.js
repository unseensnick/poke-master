import { DEFAULT_FEATURED_POKEMON } from "@/lib/pokemon-constants";
import { PrismaClient } from "@prisma/client";

// Create a single database connection that persists between hot reloads in development
const globalForPrisma = global;
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Constants
const MAX_POKEMON_ID = 1025; // Maximum ID for standard Pokemon

// Memory cache for featured Pokemon
let featuredPokemonCache = {
    date: null,
    pokemon: null,
};

// Map of games to their generation numbers
const GAME_TO_GENERATION = {
    // Generation 1
    "red-blue": 1,
    yellow: 1,

    // Generation 2
    "gold-silver": 2,
    crystal: 2,

    // Generation 3
    "ruby-sapphire": 3,
    emerald: 3,
    "firered-leafgreen": 3,

    // Generation 4
    "diamond-pearl": 4,
    platinum: 4,
    "heartgold-soulsilver": 4,

    // Generation 5
    "black-white": 5,
    "black2-white2": 5,

    // Generation 6
    "x-y": 6,
    "omega-ruby-alpha-sapphire": 6,

    // Generation 7
    "sun-moon": 7,
    "ultra-sun-ultra-moon": 7,
    "lets-go-pikachu-eevee": 7,

    // Generation 8
    "sword-shield": 8,
    "brilliant-diamond-shining-pearl": 8,
    "legends-arceus": 8,

    // Generation 9
    "scarlet-violet": 9,
};

/**
 * Helper function for error handling in database operations
 *
 * @param {Function} action - Database operation to perform
 * @param {string} errorMessage - Message to log on error
 * @param {any} defaultValue - Value to return on error
 * @returns {Promise<any>} Result of the action or defaultValue on error
 */
async function safeDbOperation(action, errorMessage, defaultValue = null) {
    try {
        return await action();
    } catch (error) {
        console.error(errorMessage, error);
        return defaultValue;
    }
}

/**
 * Helper to create search conditions based on ID or name
 *
 * @param {string|number} idOrName - ID or name to search for
 * @returns {object} Database where clause
 */
function createSearchCondition(idOrName) {
    let where = {};

    // Determine if searching by ID (number) or name (string)
    if (typeof idOrName === "number" || !isNaN(parseInt(idOrName))) {
        where = { id: parseInt(idOrName) };
    } else {
        // Search by name (case-insensitive)
        where = {
            name: {
                contains: idOrName.toString(),
                mode: "insensitive",
            },
        };
    }

    // Limit to standard Pokemon only
    where = {
        ...where,
        id: {
            ...where.id,
            lte: MAX_POKEMON_ID,
        },
    };

    return where;
}

/**
 * Format Pokemon result with consistent ID padding
 *
 * @param {Object} pokemon - Pokemon database record
 * @returns {Object} Formatted Pokemon data
 */
function formatPokemonResult(pokemon) {
    return {
        id: pokemon.id.toString().padStart(4, "0"),
        name: pokemon.name,
    };
}

/**
 * Get current date string in Norway timezone
 *
 * @returns {string} Date string in Norway timezone
 */
function getNorwayDateString() {
    const now = new Date();
    const dateFormatter = new Intl.DateTimeFormat("no", {
        timeZone: "Europe/Oslo",
        year: "numeric",
        month: "numeric",
        day: "numeric",
    });
    return dateFormatter.format(now);
}

/**
 * Get date parts from Norway timezone date
 *
 * @returns {Object} Date parts (year, month, day)
 */
function getNorwayDateParts() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("no", {
        timeZone: "Europe/Oslo",
        year: "numeric",
        month: "numeric",
        day: "numeric",
    });

    // Extract date parts (year, month, day) from the formatted date
    return formatter.formatToParts(now).reduce((acc, part) => {
        if (part.type !== "literal") {
            acc[part.type] = parseInt(part.value);
        }
        return acc;
    }, {});
}

/**
 * Creates a consistent daily seed value based on the date in Norway time
 *
 * @returns {number} A number between 0-1 that's the same all day
 */
function getDailyNorwaySeed() {
    const norwayDate = getNorwayDateParts();

    // Calculate day of year (1-366) for more variety in the seed
    const startOfYear = new Date(Date.UTC(norwayDate.year, 0, 1));
    const timezoneOffset = new Date().getTimezoneOffset() * 60000;
    const startOfDay = new Date(
        Date.UTC(norwayDate.year, norwayDate.month - 1, norwayDate.day)
    );
    startOfDay.setTime(startOfDay.getTime() + timezoneOffset);
    const dayOfYear = Math.floor((startOfDay - startOfYear) / 86400000) + 1;

    // Create a number between 0-1 that only changes once per day
    return dayOfYear / 1000 + (norwayDate.year % 100) / 10000;
}

/**
 * Finds a single Pokemon by ID or name
 *
 * @param {string|number} idOrName - The Pokemon's ID number or name
 * @returns {Promise<Object|null>} Pokemon data object or null if not found
 */
export async function getPokemonFromDB(idOrName) {
    return safeDbOperation(async () => {
        const where = createSearchCondition(idOrName);
        return await prisma.pokemon.findFirst({ where });
    }, `Error getting Pokémon ${idOrName}:`);
}

/**
 * Gets a filtered list of Pokemon with pagination
 *
 * @param {Object} options - Search and filter options
 * @returns {Promise<Array>} List of Pokemon matching the criteria
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
    return safeDbOperation(
        async () => {
            // Start with base filter for standard Pokemon
            let where = { id: { lte: MAX_POKEMON_ID } };

            // Add text search if provided
            if (searchQuery) {
                where = {
                    ...where,
                    OR: [
                        // Search by name
                        {
                            name: {
                                contains: searchQuery,
                                mode: "insensitive",
                            },
                        },
                        // Search by ID if searchQuery is a number
                        isNaN(parseInt(searchQuery))
                            ? undefined
                            : {
                                  id: {
                                      equals: parseInt(searchQuery),
                                      lte: MAX_POKEMON_ID,
                                  },
                              },
                    ].filter(Boolean), // Remove undefined values
                };
            }

            // Filter by generation
            if (generation) {
                where = {
                    ...where,
                    generationId: parseInt(generation),
                };
            }

            // Filter by game (using generation as proxy)
            if (game && GAME_TO_GENERATION[game]) {
                where = {
                    ...where,
                    generationId: GAME_TO_GENERATION[game],
                };
            }

            // Filter by types
            if (types && types.length > 0) {
                where = {
                    ...where,
                    types: {
                        hasSome: types.map((type) => type.toLowerCase()),
                    },
                };
            }

            // Set up sort order
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

            // Run the database query
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
            return pokemon.map(formatPokemonResult);
        },
        "Error fetching Pokémon list:",
        []
    );
}

/**
 * Gets all Pokemon types from the database
 *
 * @returns {Promise<Array>} List of Pokemon types
 */
export async function getPokemonTypesFromDB() {
    return safeDbOperation(
        async () => {
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
        },
        "Error fetching Pokémon types:",
        []
    );
}

/**
 * Gets a list of featured Pokemon that changes daily
 *
 * @param {number} count - Number of Pokemon to return
 * @returns {Promise<Array>} List of featured Pokemon
 */
export async function getFeaturedPokemonFromDB(count = 4) {
    return safeDbOperation(
        async () => {
            const currentDateString = getNorwayDateString();

            // Return cached results if we already have today's featured Pokemon
            if (
                featuredPokemonCache.date === currentDateString &&
                featuredPokemonCache.pokemon
            ) {
                return featuredPokemonCache.pokemon;
            }

            // Get a seed value that's consistent for the whole day
            const dailySeed = getDailyNorwaySeed();
            console.log(
                `Using seed ${dailySeed} for date ${currentDateString}`
            );

            // Get all eligible Pokemon
            const allPokemon = await prisma.pokemon.findMany({
                where: { id: { lte: MAX_POKEMON_ID } },
                select: { id: true, name: true },
                orderBy: { id: "asc" },
            });

            // Create a shuffled copy of the Pokemon list
            const shuffled = [...allPokemon];
            let currentIndex = shuffled.length;
            let seedValue = dailySeed * 10000;

            // Shuffle the array using Fisher-Yates algorithm with our custom seed
            while (currentIndex > 0) {
                seedValue = (seedValue * 9301 + 49297) % 233280;
                const randomIndex = Math.floor(
                    (seedValue / 233280) * currentIndex
                );
                currentIndex--;

                // Swap elements
                [shuffled[currentIndex], shuffled[randomIndex]] = [
                    shuffled[randomIndex],
                    shuffled[currentIndex],
                ];
            }

            // Take the first 'count' Pokemon after shuffling
            const featured = shuffled.slice(0, count).map(formatPokemonResult);

            // Save to cache
            featuredPokemonCache = {
                date: currentDateString,
                pokemon: featured,
            };

            return featured;
        },
        "Error fetching featured Pokémon:",
        DEFAULT_FEATURED_POKEMON
    );
}

/**
 * Gets a Pokemon with its sprite data
 *
 * @param {string|number} pokemonId - Pokemon ID or name
 * @returns {Promise<Object|null>} Pokemon with sprites field or null if not found
 */
export async function getPokemonWithSpritesFromDB(pokemonId) {
    return safeDbOperation(async () => {
        const where = createSearchCondition(pokemonId);

        // Get Pokemon with sprite data included
        return await prisma.pokemon.findFirst({
            where,
            select: {
                id: true,
                name: true,
                sprites: true,
            },
        });
    }, `Error getting Pokémon with sprites for ${pokemonId}:`);
}
