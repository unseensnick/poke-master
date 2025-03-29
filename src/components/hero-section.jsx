"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Interactive hero section with cursor-following light effect
 */
export function HeroSection({
    lightColor = "bg-purple-500/20",
    lightSize = 600,
    blurAmount = "120px",
    animationPreset = "instant",
    customAnimation = null,
    initialX = -160,
    initialY = 500,
}) {
    const containerRef = useRef(null);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [lightPosition, setLightPosition] = useState({
        x: initialX,
        y: initialY,
    });

    // Animation presets
    const animationPresets = {
        instant: { type: "tween", duration: 0.1 },
        responsive: { type: "spring", damping: 40, stiffness: 800, mass: 0.2 },
        smooth: { type: "spring", damping: 25, stiffness: 300, mass: 0.5 },
        floaty: { type: "spring", damping: 15, stiffness: 150, mass: 1 },
    };

    const animationConfig =
        customAnimation ||
        animationPresets[animationPreset] ||
        animationPresets.instant;

    /**
     * Update light position based on cursor movement
     */
    const handleMouseMove = (e) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;

        setLightPosition({
            x: cursorX - lightSize / 2,
            y: cursorY - lightSize / 2,
        });

        if (!hasInteracted) {
            setHasInteracted(true);
        }
    };

    const scrollToFeatures = () => {
        const featuresSection = document.getElementById("features-section");
        if (featuresSection) {
            featuresSection.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    useEffect(() => {
        const currentContainer = containerRef.current;
        return () => {};
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full min-h-[800px] overflow-hidden bg-background dark:bg-background"
            onMouseMove={handleMouseMove}
        >
            {/* Light effect */}
            <motion.div
                className={`absolute rounded-full ${lightColor} pointer-events-none`}
                style={{
                    width: lightSize,
                    height: lightSize,
                    filter: `blur(${blurAmount})`,
                }}
                animate={{
                    x: hasInteracted ? lightPosition.x : initialX,
                    y: hasInteracted ? lightPosition.y : initialY,
                }}
                transition={animationConfig}
                initial={{ x: initialX, y: initialY }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-[800px] px-4 py-16">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
                        Discover the World of Pokémon
                    </h1>

                    <p className="text-lg md:text-xl text-foreground/80 mb-10">
                        Browse, explore and learn about all Pokémon species with
                        our modern, minimalist Pokédex application.
                    </p>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Button variant="pokemon" size="lg" asChild>
                            <Link href="/explore">Start Exploring</Link>
                        </Button>

                        <Button
                            variant="pokemonOutline"
                            size="lg"
                            onClick={scrollToFeatures}
                        >
                            View Features
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HeroSection;
