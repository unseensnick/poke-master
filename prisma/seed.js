const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fetch = require("node-fetch");

// Generation data with ID ranges
const GENERATIONS = [
    {
        id: 1,
        name: "Generation I",
        games: ["Red", "Blue", "Yellow"],
        range: [1, 151],
    },
    {
        id: 2,
        name: "Generation II",
        games: ["Gold", "Silver", "Crystal"],
        range: [152, 251],
    },
    {
        id: 3,
        name: "Generation III",
        games: ["Ruby", "Sapphire", "Emerald"],
        range: [252, 386],
    },
    {
        id: 4,
        name: "Generation IV",
        games: ["Diamond", "Pearl", "Platinum"],
        range: [387, 493],
    },
    {
        id: 5,
        name: "Generation V",
        games: ["Black", "White"],
        range: [494, 649],
    },
    { id: 6, name: "Generation VI", games: ["X", "Y"], range: [650, 721] },
    {
        id: 7,
        name: "Generation VII",
        games: ["Sun", "Moon"],
        range: [722, 809],
    },
    {
        id: 8,
        name: "Generation VIII",
        games: ["Sword", "Shield"],
        range: [810, 905],
    },
    {
        id: 9,
        name: "Generation IX",
        games: ["Scarlet", "Violet"],
        range: [906, 1025],
    },
];

/**
 * Determines Pokemon's generation from ID
 */
function determineGeneration(pokemonId) {
    const id = parseInt(pokemonId);

    if (isNaN(id)) {
        console.warn(`Invalid Pokémon ID: ${pokemonId}`);
        return 9; // Default to latest
    }

    for (const gen of GENERATIONS) {
        const [min, max] = gen.range;
        if (id >= min && id <= max) {
            return gen.id;
        }
    }

    console.warn(
        `Pokémon ID ${id} outside known ranges. Assigning to latest generation.`
    );
    return 9;
}

/**
 * Formats API data for database insertion
 */
function formatPokemonData(data) {
    return {
        id: data.id,
        name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
        weight: data.weight / 10, // kg
        height: data.height / 10, // meters
        types: data.types.map((type) => type.type.name),
        stats: {
            hp:
                data.stats.find((stat) => stat.stat.name === "hp")?.base_stat ||
                0,
            attack:
                data.stats.find((stat) => stat.stat.name === "attack")
                    ?.base_stat || 0,
            defense:
                data.stats.find((stat) => stat.stat.name === "defense")
                    ?.base_stat || 0,
            specialAttack:
                data.stats.find((stat) => stat.stat.name === "special-attack")
                    ?.base_stat || 0,
            specialDefense:
                data.stats.find((stat) => stat.stat.name === "special-defense")
                    ?.base_stat || 0,
            speed:
                data.stats.find((stat) => stat.stat.name === "speed")
                    ?.base_stat || 0,
        },
        abilities: data.abilities.map((ability) => ability.ability.name),
        sprites: {
            default: data.sprites.front_default,
            official: data.sprites.other["official-artwork"]?.front_default,
        },
        generationId: determineGeneration(data.id),
        baseExperience: data.base_experience,
    };
}

/**
 * Main database seeding function
 */
async function main() {
    console.log("Starting database seed...");

    // Seed Pokemon types
    console.log("Seeding Pokémon types...");
    const typesResponse = await fetch("https://pokeapi.co/api/v2/type");
    const typesData = await typesResponse.json();

    // Filter out shadow and unknown types
    for (const type of typesData.results.filter(
        (t) => !["shadow", "unknown"].includes(t.name)
    )) {
        await prisma.pokemonType.upsert({
            where: {
                name: type.name.charAt(0).toUpperCase() + type.name.slice(1),
            },
            update: {},
            create: {
                name: type.name.charAt(0).toUpperCase() + type.name.slice(1),
            },
        });
    }

    // Seed generations
    console.log("Seeding generations...");
    for (const gen of GENERATIONS) {
        await prisma.generation.upsert({
            where: { id: gen.id },
            update: gen,
            create: gen,
        });
    }

    // Seed Pokemon data
    console.log("Seeding Pokémon data...");

    // Get total count
    const countResponse = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=1"
    );
    const countData = await countResponse.json();
    const totalCount = countData.count;

    console.log(`Found ${totalCount} Pokémon to import`);

    // Process in batches
    const batchSize = 50;
    for (let offset = 0; offset < totalCount; offset += batchSize) {
        console.log(
            `Processing Pokémon ${offset} to ${offset + batchSize - 1}...`
        );

        // Get batch
        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon?limit=${batchSize}&offset=${offset}`
        );
        const data = await response.json();

        // Process each Pokemon
        for (const item of data.results) {
            try {
                console.log(`Processing Pokémon: ${item.name}...`);

                // Get details
                const pokemonResponse = await fetch(item.url);
                const pokemonData = await pokemonResponse.json();

                // Format and insert
                const formattedData = formatPokemonData(pokemonData);

                await prisma.pokemon.upsert({
                    where: { id: formattedData.id },
                    update: formattedData,
                    create: formattedData,
                });

                console.log(
                    `Added Pokémon: ${formattedData.name} (Generation: ${formattedData.generationId})`
                );
            } catch (error) {
                console.error(`Error processing Pokémon ${item.name}:`, error);
            }

            // API rate limiting
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }

    console.log("Seed completed successfully!");
}

// Execute seed
main()
    .catch((e) => {
        console.error("Error during seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
