import { DEFAULT_FEATURED_POKEMON } from "@/lib/pokemon-constants";
import { PrismaClient } from "@prisma/client";

// Create a single database connection that persists between hot reloads in development
const globalForPrisma = global;
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Finds a single Pokemon by ID or name
 *
 * @param {string|number} idOrName - The Pokemon's ID number or name
 * @returns {Object|null} Pokemon data object or null if not found
 */
export async function getPokemonFromDB(idOrName) {
    try {
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

        // Limit to standard Pokemon only (ID <= 1025)
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
 * Gets a filtered list of Pokemon with pagination
 *
 * @param {Object} options - Search and filter options
 * @param {number} options.limit - Maximum number of results to return
 * @param {number} options.offset - Starting position for pagination
 * @param {Array} options.types - Pokemon types to include (e.g., ["fire", "water"])
 * @param {number} options.generation - Generation number to filter by (1-9)
 * @param {string} options.game - Game ID to filter by (e.g., "red-blue")
 * @param {string} options.searchQuery - Text to search for in Pokemon names
 * @param {string} options.sortOrder - How to sort results (e.g., "id-asc", "name-desc")
 * @returns {Array} List of Pokemon matching the criteria
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
        // Start with base filter for standard Pokemon
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
                    // Search by name
                    { name: { contains: searchQuery, mode: "insensitive" } },
                    // Search by ID if searchQuery is a number
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
            // Map each game to its generation number
            const gameToGen = {
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

        // Format IDs with leading zeros (e.g., 0001, 0025)
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
 * Gets all Pokemon types from the database
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
 * Creates a consistent daily seed value based on the date in Norway time
 * This ensures the same random Pokemon are selected all day
 *
 * @returns {number} A number between 0-1 that's the same all day
 */
function getDailyNorwaySeed() {
    // Get current date in Norway time zone
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("no", {
        timeZone: "Europe/Oslo",
        year: "numeric",
        month: "numeric",
        day: "numeric",
    });

    // Extract date parts (year, month, day) from the formatted date
    const norwayDate = formatter.formatToParts(now).reduce((acc, part) => {
        if (part.type !== "literal") {
            acc[part.type] = parseInt(part.value);
        }
        return acc;
    }, {});

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

// Memory cache to keep featured Pokemon consistent during page refreshes
let featuredPokemonCache = {
    date: null,
    pokemon: null,
};

/**
 * Gets a list of featured Pokemon that changes daily
 *
 * @param {number} count - Number of Pokemon to return
 * @returns {Array} List of featured Pokemon
 */
export async function getFeaturedPokemonFromDB(count = 4) {
    try {
        // Get current date in Norway timezone
        const now = new Date();
        const dateFormatter = new Intl.DateTimeFormat("no", {
            timeZone: "Europe/Oslo",
            year: "numeric",
            month: "numeric",
            day: "numeric",
        });
        const currentDateString = dateFormatter.format(now);

        // Return cached results if we already have today's featured Pokemon
        if (
            featuredPokemonCache.date === currentDateString &&
            featuredPokemonCache.pokemon
        ) {
            return featuredPokemonCache.pokemon;
        }

        // Get a seed value that's consistent for the whole day
        const dailySeed = getDailyNorwaySeed();
        console.log(`Using seed ${dailySeed} for date ${currentDateString}`);

        // Get all eligible Pokemon
        const allPokemon = await prisma.pokemon.findMany({
            where: { id: { lte: 1025 } },
            select: { id: true, name: true },
            orderBy: { id: "asc" },
        });

        // Create a shuffled copy of the Pokemon list
        const shuffled = [...allPokemon];
        let currentIndex = shuffled.length;
        let seedValue = dailySeed * 10000;

        // Shuffle the array using Fisher-Yates algorithm with our custom seed
        // This ensures we get the same "random" selection every time with the same seed
        while (currentIndex > 0) {
            seedValue = (seedValue * 9301 + 49297) % 233280;
            const randomIndex = Math.floor((seedValue / 233280) * currentIndex);
            currentIndex--;

            // Swap elements
            [shuffled[currentIndex], shuffled[randomIndex]] = [
                shuffled[randomIndex],
                shuffled[currentIndex],
            ];
        }

        // Take the first 'count' Pokemon after shuffling
        const featured = shuffled.slice(0, count).map((p) => ({
            id: p.id.toString().padStart(4, "0"),
            name: p.name,
        }));

        // Save to cache
        featuredPokemonCache = {
            date: currentDateString,
            pokemon: featured,
        };

        return featured;
    } catch (error) {
        console.error("Error fetching featured Pokémon:", error);
        // Return default Pokemon list if there's an error
        return DEFAULT_FEATURED_POKEMON;
    }
}

/**
 * Gets a Pokemon with its sprite data
 *
 * @param {string|number} pokemonId - Pokemon ID or name
 * @returns {Object|null} Pokemon with sprites field or null if not found
 */
export async function getPokemonWithSpritesFromDB(pokemonId) {
    try {
        let where = {};

        // Determine if searching by ID or name
        if (typeof pokemonId === "number" || !isNaN(parseInt(pokemonId))) {
            where = { id: parseInt(pokemonId) };
        } else {
            where = {
                name: {
                    contains: pokemonId.toString(),
                    mode: "insensitive",
                },
            };
        }

        // Limit to standard Pokemon
        where = {
            ...where,
            id: {
                ...where.id,
                lte: 1025,
            },
        };

        // Get Pokemon with sprite data included
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
