"use client";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { MoveRight, Timer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/**
 * Main features showcase with cards for each application capability
 */
export function FeaturesSection() {
    const features = [
        {
            title: "Explore Pokémon",
            description:
                "Discover, filter, and search through all Pokémon with detailed information, stats, and types.",
            image: "/pokemon-explore.svg",
            altText: "Pokémon exploration illustration",
            link: "/explore",
            color: "var(--color-pokemon-grass)",
            comingSoon: false,
        },
        {
            title: "Battle Simulator",
            description:
                "Test your team's strength in simulated battles with customizable opponents and battle mechanics.",
            image: "/pokemon-battle-v4.svg",
            altText: "Pokémon battle simulator illustration",
            link: "/battle",
            color: "var(--color-pokemon-fire)",
            comingSoon: true,
        },
        {
            title: "Team Builder",
            description:
                "Create and customize your perfect Pokémon team with specific stats, moves, and held items.",
            image: "/pokemon-team-v2.svg",
            altText: "Pokémon team builder illustration",
            link: "/team",
            color: "var(--color-pokemon-water)",
            comingSoon: true,
        },
    ];

    return (
        <section
            id="features-section"
            className="w-full py-16 px-4 md:py-24 bg-card/60"
        >
            <div className="max-w-7xl mx-auto">
                {/* Section heading */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                        Features
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Everything you need to become a Pokémon Master.
                    </p>
                </div>

                {/* Feature cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className={`rounded-xl overflow-hidden border border-border/40 
                            ${
                                feature.comingSoon
                                    ? "opacity-80"
                                    : "hover:border-primary/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                            }`}
                        >
                            <div className="h-48 relative bg-muted/30 overflow-hidden">
                                {/* Feature image */}
                                <div
                                    className="absolute inset-0 flex items-center justify-center"
                                    style={{
                                        background: `linear-gradient(135deg, rgb(from ${feature.color} r g b / 0.2) 0%, rgb(from ${feature.color} r g b / 0.05) 100%)`,
                                    }}
                                >
                                    <Image
                                        src={feature.image}
                                        width={160}
                                        height={160}
                                        alt={feature.altText}
                                        className="object-contain size-auto max-h-40 p-4"
                                    />
                                </div>

                                {/* Coming soon badge */}
                                {feature.comingSoon && (
                                    <div className="absolute top-0 right-0 bg-background/80 px-3 py-1 rounded-bl-lg flex items-center">
                                        <Timer className="mr-1 size-3 text-foreground/70" />
                                        <span className="text-xs font-medium text-foreground/70">
                                            Coming Soon
                                        </span>
                                    </div>
                                )}
                            </div>

                            <CardHeader className="pt-6">
                                <CardTitle className="text-2xl font-bold text-foreground">
                                    {feature.title}
                                    {feature.comingSoon && (
                                        <span className="sr-only">
                                            (Coming Soon)
                                        </span>
                                    )}
                                </CardTitle>
                            </CardHeader>

                            <CardContent>
                                <p className="text-muted-foreground">
                                    {feature.description}
                                </p>
                            </CardContent>

                            <CardFooter className="pt-2 pb-6">
                                {feature.comingSoon ? (
                                    <div
                                        className="flex items-center text-sm font-medium text-primary/50 cursor-not-allowed"
                                        onClick={(e) => e.preventDefault()}
                                    >
                                        Coming soon
                                        <Timer className="ml-1 size-4" />
                                    </div>
                                ) : (
                                    <Link
                                        href={feature.link}
                                        className="flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                    >
                                        Learn more
                                        <MoveRight className="ml-1 size-4" />
                                    </Link>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default FeaturesSection;
