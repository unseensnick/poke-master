import PokemonCard from "@/components/PokemonCard";

export default function ExplorePage() {
    const elementrio = {
        id: "????",
        name: "Elementrio",
        weight: "45.2",
        height: "1.3",
        types: ["Water", "Fire", "Electric"],
    };

    return (
        <div className="flex-1">
            <h1 className="text-3xl font-bold text-center mb-10">
                Pokémon Card Showcase
            </h1>
            <div className="container mx-auto px-4">
                <div className="flex flex-wrap justify-center gap-10">
                    {/* Using pokemonIdOrName prop (by ID) */}
                    <div>
                        <div className="text-center text-lg font-bold mb-4 text-muted-foreground">
                            By ID (Single-Type)
                        </div>
                        <PokemonCard pokemonIdOrName="25" />
                    </div>

                    {/* Using pokemonIdOrName prop (by name) */}
                    <div>
                        <div className="text-center text-lg font-bold mb-4 text-muted-foreground">
                            By Name (Dual-Type)
                        </div>
                        <PokemonCard pokemonIdOrName="bulbasaur" />
                    </div>

                    {/* Using pokemon object prop (original approach) */}
                    <div>
                        <div className="text-center text-lg font-bold mb-4 text-muted-foreground">
                            Custom Pokémon (Triple-Type)
                        </div>
                        <PokemonCard
                            pokemon={elementrio}
                            customImage="/Elementrio.png"
                            typeCount={3}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
