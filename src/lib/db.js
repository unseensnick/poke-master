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
 * @returns {number} A consistent number 0-1 for the day
 */
function getDailyNorwaySeed() {
    // Get current date in Norway time (UTC+1/UTC+2)
    const now = new Date();

    // Convert to Norway time
    const formatter = new Intl.DateTimeFormat("no", {
        timeZone: "Europe/Oslo",
        year: "numeric",
        month: "numeric",
        day: "numeric",
    });

    // Get date parts in Norway time
    const norwayDate = formatter.formatToParts(now).reduce((acc, part) => {
        if (part.type !== "literal") {
            acc[part.type] = parseInt(part.value);
        }
        return acc;
    }, {});

    // Calculate day of year (a number between 1-366)
    const startOfYear = new Date(Date.UTC(norwayDate.year, 0, 1));
    const timezoneOffset = new Date().getTimezoneOffset() * 60000;
    const startOfDay = new Date(
        Date.UTC(norwayDate.year, norwayDate.month - 1, norwayDate.day)
    );
    startOfDay.setTime(startOfDay.getTime() + timezoneOffset);
    const dayOfYear = Math.floor((startOfDay - startOfYear) / 86400000) + 1;

    // Create a deterministic seed between 0 and 1
    // Use day of year / 1000 to get a stable value that works well with PostgreSQL's setseed
    return dayOfYear / 1000 + (norwayDate.year % 100) / 10000;
}

// Cache for featured Pokemon to avoid inconsistencies on refresh
let featuredPokemonCache = {
    date: null,
    pokemon: null,
};

/**
 * Gets featured Pokemon (changes daily)
 *
 * @param {number} count - Number of Pokemon to return
 * @returns {Array} Featured Pokemon
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

        // Check if we have cached data for today
        if (
            featuredPokemonCache.date === currentDateString &&
            featuredPokemonCache.pokemon
        ) {
            return featuredPokemonCache.pokemon;
        }

        // Get consistent daily seed
        const dailySeed = getDailyNorwaySeed();
        console.log(`Using seed ${dailySeed} for date ${currentDateString}`);

        // Create a more stable query
        // Get all Pokemon IDs first, then use JavaScript to select a fixed set
        const allPokemon = await prisma.pokemon.findMany({
            where: { id: { lte: 1025 } },
            select: { id: true, name: true },
            orderBy: { id: "asc" },
        });

        // Use the seed to deterministically select Pokemon
        const seedRandom = (seed, max) => {
            // Simple deterministic random number generator
            const x = Math.sin(seed) * 10000;
            return Math.floor((x - Math.floor(x)) * max);
        };

        // Use the seed to shuffle array
        const shuffled = [...allPokemon];
        let currentIndex = shuffled.length;
        let seedValue = dailySeed * 10000;

        // Fisher-Yates shuffle algorithm with our seeded random
        while (currentIndex > 0) {
            seedValue = (seedValue * 9301 + 49297) % 233280;
            const randomIndex = Math.floor((seedValue / 233280) * currentIndex);
            currentIndex--;
            [shuffled[currentIndex], shuffled[randomIndex]] = [
                shuffled[randomIndex],
                shuffled[currentIndex],
            ];
        }

        // Take the first 'count' Pokemon
        const featured = shuffled.slice(0, count).map((p) => ({
            id: p.id.toString().padStart(4, "0"),
            name: p.name,
        }));

        // Cache the results
        featuredPokemonCache = {
            date: currentDateString,
            pokemon: featured,
        };

        return featured;
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
