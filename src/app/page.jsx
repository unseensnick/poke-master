import { FeaturedPokemon } from "@/components/featured-pokemon";
import { FeaturesSection } from "@/components/features";
import { HeroSection } from "@/components/hero-section";

export default function HomePage() {
    return (
        <main>
            {/* 
        Animation presets available:
        - "tight": Closely follows cursor with minimal lag
        - "smooth": Balanced following with slight lag
        - "floaty": Slow, drifting movement with significant lag
        
        Or provide custom settings with animationConfig:
        animationConfig={{ damping: 15, stiffness: 250, mass: 0.3 }}
        
        Other customizable props:
        - lightColor: CSS color class (e.g., "bg-indigo-500/20")
        - lightSize: Size in pixels (e.g., 600)
        - initialPosition: Starting position (e.g., { x: 0, y: 300 })
      */}
            <HeroSection
                animationPreset="tight"
                lightColor="bg-purple-500/20"
                lightSize={500}
            />
            {/* Other page content */}
            <FeaturedPokemon />
            <FeaturesSection />
            <footer className="py-10 text-center text-md text-muted-foreground">
                <p>
                    &copy; 2025 PokéMaster. All Pokémon and respective names are
                    trademarks of Nintendo.
                </p>
            </footer>
        </main>
    );
}
