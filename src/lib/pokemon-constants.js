/**
 * Shared Pokémon constants for use across the application
 * Centralizing these values prevents duplication and ensures consistency
 */

// Pokémon generations data
export const GENERATIONS = [
    {
        id: 1,
        name: "Generation I",
        games: "Red, Blue, Yellow",
        range: [1, 151],
    },
    {
        id: 2,
        name: "Generation II",
        games: "Gold, Silver, Crystal",
        range: [152, 251],
    },
    {
        id: 3,
        name: "Generation III",
        games: "Ruby, Sapphire, Emerald",
        range: [252, 386],
    },
    {
        id: 4,
        name: "Generation IV",
        games: "Diamond, Pearl, Platinum",
        range: [387, 493],
    },
    { id: 5, name: "Generation V", games: "Black, White", range: [494, 649] },
    { id: 6, name: "Generation VI", games: "X, Y", range: [650, 721] },
    { id: 7, name: "Generation VII", games: "Sun, Moon", range: [722, 809] },
    {
        id: 8,
        name: "Generation VIII",
        games: "Sword, Shield",
        range: [810, 905],
    },
    {
        id: 9,
        name: "Generation IX",
        games: "Scarlet, Violet",
        range: [906, 1025],
    },
];

// Pokémon games data (simplified to main series)
export const GAMES = [
    { id: "red-blue", name: "Red & Blue", generation: 1 },
    { id: "yellow", name: "Yellow", generation: 1 },
    { id: "gold-silver", name: "Gold & Silver", generation: 2 },
    { id: "crystal", name: "Crystal", generation: 2 },
    { id: "ruby-sapphire", name: "Ruby & Sapphire", generation: 3 },
    { id: "emerald", name: "Emerald", generation: 3 },
    { id: "firered-leafgreen", name: "FireRed & LeafGreen", generation: 3 },
    { id: "diamond-pearl", name: "Diamond & Pearl", generation: 4 },
    { id: "platinum", name: "Platinum", generation: 4 },
    {
        id: "heartgold-soulsilver",
        name: "HeartGold & SoulSilver",
        generation: 4,
    },
    { id: "black-white", name: "Black & White", generation: 5 },
    { id: "black2-white2", name: "Black 2 & White 2", generation: 5 },
    { id: "x-y", name: "X & Y", generation: 6 },
    {
        id: "omega-ruby-alpha-sapphire",
        name: "Omega Ruby & Alpha Sapphire",
        generation: 6,
    },
    { id: "sun-moon", name: "Sun & Moon", generation: 7 },
    {
        id: "ultra-sun-ultra-moon",
        name: "Ultra Sun & Ultra Moon",
        generation: 7,
    },
    {
        id: "lets-go-pikachu-eevee",
        name: "Let's Go, Pikachu! & Let's Go, Eevee!",
        generation: 7,
    },
    { id: "sword-shield", name: "Sword & Shield", generation: 8 },
    {
        id: "brilliant-diamond-shining-pearl",
        name: "Brilliant Diamond & Shining Pearl",
        generation: 8,
    },
    { id: "legends-arceus", name: "Legends: Arceus", generation: 8 },
    { id: "scarlet-violet", name: "Scarlet & Violet", generation: 9 },
];

// Sort options for Pokémon lists
export const SORT_OPTIONS = [
    { value: "id-asc", label: "ID (Ascending)" },
    { value: "id-desc", label: "ID (Descending)" },
    { value: "name-asc", label: "Name (A-Z)" },
    { value: "name-desc", label: "Name (Z-A)" },
];

/**
 * Default featured Pokémon for fallback when API calls fail
 * Used across both client and server-side code
 */
export const DEFAULT_FEATURED_POKEMON = [
    { name: "Bulbasaur", id: "0001" },
    { name: "Pikachu", id: "0025" },
    { name: "Charizard", id: "0006" },
    { name: "Lucario", id: "0448" },
];
