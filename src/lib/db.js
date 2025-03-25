import { PrismaClient } from "@prisma/client";

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global;
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Get a single Pokémon by ID or name
export async function getPokemonFromDB(idOrName) {
    try {
        let where = {};

        // Check if idOrName is a number
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

        // Add filter for ID <= 1025
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

// Get filtered Pokémon list with pagination
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
        // Build the where clause with ID filter as the baseline
        let where = {
            id: {
                lte: 1025, // Filter for standard Pokémon only
            },
        };

        // Handle search query
        if (searchQuery) {
            where = {
                ...where,
                OR: [
                    { name: { contains: searchQuery, mode: "insensitive" } },
                    // If search query is a number, try to match it as an ID
                    isNaN(parseInt(searchQuery))
                        ? undefined
                        : {
                              id: {
                                  equals: parseInt(searchQuery),
                                  lte: 1025, // Maintain the ID filter
                              },
                          },
                ].filter(Boolean), // Remove undefined values
            };
        }

        // Generation filtering
        if (generation) {
            where = {
                ...where,
                generationId: parseInt(generation),
            };
        }

        // Game filtering (using generation as proxy)
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

        // Type filtering - efficient with database
        if (types && types.length > 0) {
            where = {
                ...where,
                types: {
                    hasSome: types.map((type) => type.toLowerCase()),
                },
            };
        }

        // Determine sorting
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

        // Execute query with all filters applied
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

        // Format results to match expected API format
        return pokemon.map((p) => ({
            id: p.id.toString().padStart(4, "0"),
            name: p.name,
        }));
    } catch (error) {
        console.error("Error fetching Pokémon list:", error);
        return [];
    }
}

// Get all Pokémon types (excluding Stellar)
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

// Generate a daily seed based on Norway time
function getDailyNorwaySeed() {
    // Get current date in Norway time (UTC+1/UTC+2)
    const now = new Date();

    // Convert to Norway time
    // Create date formatter using 'no' (Norwegian) locale and Europe/Oslo timezone
    const formatter = new Intl.DateTimeFormat("no", {
        timeZone: "Europe/Oslo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    // Get the date string in Norway time
    const norwayDateString = formatter.format(now);

    // We'll return the date string, which will be used as the seed for random selection
    // This ensures the same Pokémon are featured all day
    return norwayDateString.replace(/\D/g, ""); // Remove non-digits to get YYYYMMDD format
}

// Get featured Pokémon (random selection that changes daily at 00:01 Norway time)
export async function getFeaturedPokemonFromDB(count = 4) {
    try {
        // Get the daily seed based on Norway time
        const dailySeed = getDailyNorwaySeed();

        // Use the daily seed to get a consistent set of featured Pokémon for the day
        // We use a PostgreSQL-specific function to set the random seed
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

        // Fallback to fixed Pokémon if there's an error
        return [
            { name: "Bulbasaur", id: "0001" },
            { name: "Pikachu", id: "0025" },
            { name: "Charizard", id: "0006" },
            { name: "Lucario", id: "0448" },
        ];
    }
}

/**
 * Get a single Pokémon with complete data including sprites
 *
 * This is an extension of the getPokemonFromDB function that also fetches sprite data
 * for use with the getPokemonSprite server action
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

        // Add filter for ID <= 1025
        where = {
            ...where,
            id: {
                ...where.id,
                lte: 1025,
            },
        };

        // Select the Pokemon with sprite data
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
