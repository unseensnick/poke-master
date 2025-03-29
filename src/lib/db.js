import { DEFAULT_FEATURED_POKEMON } from "@/lib/pokemon-constants";
import { PrismaClient } from "@prisma/client";

// Create persistent database connection
const globalForPrisma = global;
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// System constants
const MAX_POKEMON_ID = 1025;

// Memory cache for featured Pokemon
let featuredPokemonCache = {
    date: null,
    pokemon: null,
};

// Game to generation mapping
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
 * Safely executes database operation with error handling
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
 * Creates database where clause from ID or name
 */
function createSearchCondition(idOrName) {
    let where = {};

    if (typeof idOrName === "number" || !isNaN(parseInt(idOrName))) {
        where = { id: parseInt(idOrName) };
    } else {
        where = {
            name: {
                contains: idOrName.toString(),
                mode: "insensitive",
            },
        };
    }

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
 * Formats Pokemon with consistent ID padding
 */
function formatPokemonResult(pokemon) {
    return {
        id: pokemon.id.toString().padStart(4, "0"),
        name: pokemon.name,
    };
}

/**
 * Gets current date string in Norway timezone
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
 * Gets date parts from Norway timezone date
 */
function getNorwayDateParts() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("no", {
        timeZone: "Europe/Oslo",
        year: "numeric",
        month: "numeric",
        day: "numeric",
    });

    return formatter.formatToParts(now).reduce((acc, part) => {
        if (part.type !== "literal") {
            acc[part.type] = parseInt(part.value);
        }
        return acc;
    }, {});
}

/**
 * Creates deterministic daily seed value based on Norway date
 */
function getDailyNorwaySeed() {
    const norwayDate = getNorwayDateParts();

    // Calculate day of year for increased seed variety
    const startOfYear = new Date(Date.UTC(norwayDate.year, 0, 1));
    const timezoneOffset = new Date().getTimezoneOffset() * 60000;
    const startOfDay = new Date(
        Date.UTC(norwayDate.year, norwayDate.month - 1, norwayDate.day)
    );
    startOfDay.setTime(startOfDay.getTime() + timezoneOffset);
    const dayOfYear = Math.floor((startOfDay - startOfYear) / 86400000) + 1;

    // Create stable daily seed value
    return dayOfYear / 1000 + (norwayDate.year % 100) / 10000;
}

/**
 * Finds Pokemon by ID or name
 */
export async function getPokemonFromDB(idOrName) {
    return safeDbOperation(async () => {
        const where = createSearchCondition(idOrName);
        return await prisma.pokemon.findFirst({ where });
    }, `Error getting Pokémon ${idOrName}:`);
}

/**
 * Gets filtered Pokemon list with pagination
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
            // Base filter for standard Pokemon
            let where = { id: { lte: MAX_POKEMON_ID } };

            // Add text search
            if (searchQuery) {
                where = {
                    ...where,
                    OR: [
                        {
                            name: {
                                contains: searchQuery,
                                mode: "insensitive",
                            },
                        },
                        isNaN(parseInt(searchQuery))
                            ? undefined
                            : {
                                  id: {
                                      equals: parseInt(searchQuery),
                                      lte: MAX_POKEMON_ID,
                                  },
                              },
                    ].filter(Boolean),
                };
            }

            // Generation filter
            if (generation) {
                where = {
                    ...where,
                    generationId: parseInt(generation),
                };
            }

            // Game filter (via generation)
            if (game && GAME_TO_GENERATION[game]) {
                where = {
                    ...where,
                    generationId: GAME_TO_GENERATION[game],
                };
            }

            // Type filter
            if (types && types.length > 0) {
                where = {
                    ...where,
                    types: {
                        hasSome: types.map((type) => type.toLowerCase()),
                    },
                };
            }

            // Sort order
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

            // Execute query
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

            return pokemon.map(formatPokemonResult);
        },
        "Error fetching Pokémon list:",
        []
    );
}

/**
 * Gets all Pokemon types
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
 * Gets daily featured Pokemon list with deterministic randomization
 */
export async function getFeaturedPokemonFromDB(count = 4) {
    return safeDbOperation(
        async () => {
            const currentDateString = getNorwayDateString();

            // Return cached data if available for today
            if (
                featuredPokemonCache.date === currentDateString &&
                featuredPokemonCache.pokemon
            ) {
                return featuredPokemonCache.pokemon;
            }

            // Get deterministic seed for today
            const dailySeed = getDailyNorwaySeed();
            console.log(
                `Using seed ${dailySeed} for date ${currentDateString}`
            );

            // Get all Pokemon
            const allPokemon = await prisma.pokemon.findMany({
                where: { id: { lte: MAX_POKEMON_ID } },
                select: { id: true, name: true },
                orderBy: { id: "asc" },
            });

            // Deterministically shuffle Pokemon
            const shuffled = [...allPokemon];
            let currentIndex = shuffled.length;
            let seedValue = dailySeed * 10000;

            while (currentIndex > 0) {
                seedValue = (seedValue * 9301 + 49297) % 233280;
                const randomIndex = Math.floor(
                    (seedValue / 233280) * currentIndex
                );
                currentIndex--;

                [shuffled[currentIndex], shuffled[randomIndex]] = [
                    shuffled[randomIndex],
                    shuffled[currentIndex],
                ];
            }

            // Select first N Pokemon
            const featured = shuffled.slice(0, count).map(formatPokemonResult);

            // Cache result
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
 * Gets Pokemon with sprite data
 */
export async function getPokemonWithSpritesFromDB(pokemonId) {
    return safeDbOperation(async () => {
        const where = createSearchCondition(pokemonId);

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
