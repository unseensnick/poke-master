import { FeaturedPokemon } from "@/components/featured-pokemon";
import { FeaturesSection } from "@/components/features";
import { HeroSection } from "@/components/hero-section";
import { getHomePageData } from "@/services/pokemon-service";

/**
 * Prefetches featured Pokémon data to eliminate client-side loading
 * @returns {JSX.Element} The rendered homepage
 */
export default async function HomePage() {
    // Fetch initial data at build/request time
    const data = await getHomePageData();

    return (
        <main>
            {/* 
              HeroSection configuration options:
              - animationPreset: "tight" | "smooth" | "floaty" - Controls cursor following behavior
              - animationConfig: Custom animation settings: { damping: number, stiffness: number, mass: number }
              - lightColor: CSS color class for glow effect 
              - lightSize: Diameter in pixels for light effect
              - initialX: Starting X position for light effect
              - initialY: Starting Y position for light effect
            */}
            <HeroSection
                animationPreset="tight"
                lightColor="bg-purple-500/20"
                lightSize={500}
            />
            <FeaturedPokemon initialPokemon={data.featuredPokemon} />
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
