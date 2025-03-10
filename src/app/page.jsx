import PokemonCard from "@/components/PokemonCard";

export default function HomePage() {
    const elementrio = {
        id: "???",
        name: "Elementrio",
        weight: "45.2",
        height: "1.3",
        types: ["Water", "Fire", "Electric"],
    };

    return (
        <div className="py-12 bg-[#1a1a1a] min-h-screen">
            <h1 className="text-3xl font-bold text-center mb-10 text-white">
                Pokémon Card Showcase
            </h1>
            <div className="container mx-auto px-4">
                <div className="flex flex-wrap justify-center gap-10">
                    {/* Using pokemonIdOrName prop (by ID) */}
                    <div>
                        <div className="text-center text-[18px] font-bold mb-[15px] text-[#ddd]">
                            By ID (Single-Type)
                        </div>
                        <PokemonCard pokemonIdOrName="25" />
                    </div>

                    {/* Using pokemonIdOrName prop (by name) */}
                    <div>
                        <div className="text-center text-[18px] font-bold mb-[15px] text-[#ddd]">
                            By Name (Dual-Type)
                        </div>
                        <PokemonCard pokemonIdOrName="bulbasaur" />
                    </div>

                    {/* Using pokemon object prop (original approach) */}
                    <div>
                        <div className="text-center text-[18px] font-bold mb-[15px] text-[#ddd]">
                            Custom Pokémon (Triple-Type)
                        </div>
                        <PokemonCard pokemon={elementrio} typeCount={3} />
                    </div>
                </div>
            </div>
        </div>
    );
}
