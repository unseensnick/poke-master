"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * HeroSection component with a light effect that precisely follows the cursor
 *
 * Features:
 * - Interactive light effect that follows the cursor exactly
 * - Configurable animation presets for different following behaviors
 * - Customizable light appearance (color, size, blur)
 * - Maintains last position when cursor leaves the section
 * - Starts at a defined initial position
 * - Uses shadcn/ui Button components with proper variants
 */
export function HeroSection({
    // Light appearance
    lightColor = "bg-purple-500/20",
    lightSize = 600,
    blurAmount = "120px",

    // Animation behavior
    animationPreset = "instant",
    customAnimation = null,

    // Initial position (off-screen by default)
    initialX = -160,
    initialY = 500,
}) {
    // Reference to the container element
    const containerRef = useRef(null);

    // Track if mouse has entered the container
    const [hasInteracted, setHasInteracted] = useState(false);

    // Current light position (starts at initial position)
    const [lightPosition, setLightPosition] = useState({
        x: initialX,
        y: initialY,
    });

    // Animation presets - different follow behaviors
    const animationPresets = {
        // Direct cursor tracking with minimal delay
        instant: {
            type: "tween",
            duration: 0.1,
        },
        // Fast but with slight elasticity
        responsive: {
            type: "spring",
            damping: 40,
            stiffness: 800,
            mass: 0.2,
        },
        // Smooth, natural following
        smooth: {
            type: "spring",
            damping: 25,
            stiffness: 300,
            mass: 0.5,
        },
        // Significant lag with bouncy feel
        floaty: {
            type: "spring",
            damping: 15,
            stiffness: 150,
            mass: 1,
        },
    };

    // Get the selected animation configuration
    const animationConfig =
        customAnimation ||
        animationPresets[animationPreset] ||
        animationPresets.instant;

    /**
     * Handle mouse movement within the container
     * Updates the light position to follow the cursor
     */
    const handleMouseMove = (e) => {
        // Ensure container reference exists
        if (!containerRef.current) return;

        // Get container's position relative to viewport
        const rect = containerRef.current.getBoundingClientRect();

        // Calculate cursor position relative to container
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;

        // Update light position
        setLightPosition({
            // We want the center of the light to be at the cursor position,
            // so we subtract half the light's size from the cursor coordinates
            x: cursorX - lightSize / 2,
            y: cursorY - lightSize / 2,
        });

        // Flag that user has interacted with the component
        if (!hasInteracted) {
            setHasInteracted(true);
        }
    };

    // Set up event cleanup for mouse events
    useEffect(() => {
        // Keep reference to current container for cleanup
        const currentContainer = containerRef.current;

        // Nothing to clean up if container doesn't exist
        if (!currentContainer) return;

        // Return cleanup function
        return () => {
            // No event listeners to remove in this implementation
            // as we're using React's onMouseMove directly on the div
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full min-h-[800px] overflow-hidden bg-background dark:bg-background"
            onMouseMove={handleMouseMove}
        >
            {/* 
              Light effect that follows cursor
              - Uses motion.div for smooth animation
              - Position is calculated to center light on cursor
              - Maintains position when mouse leaves
            */}
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

            {/* Main content - centered in container with z-index to appear above light */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-[800px] px-4 py-16">
                <div className="max-w-3xl mx-auto text-center">
                    {/* Heading - no animation */}
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
                        Discover the World of Pokémon
                    </h1>

                    {/* Description - no animation */}
                    <p className="text-lg md:text-xl text-foreground/80 mb-10">
                        Browse, explore and learn about all Pokémon species with
                        our modern, minimalist Pokédex application.
                    </p>

                    {/* Buttons - using our new Pokemon-themed button variants */}
                    <div className="flex flex-wrap gap-4 justify-center">
                        {/* Primary action button */}
                        <Button variant="pokemon" size="lg" asChild>
                            <Link href="/explore">Start Exploring</Link>
                        </Button>

                        {/* Secondary action button */}
                        <Button variant="pokemonOutline" size="lg" asChild>
                            <Link href="/features">View Features</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HeroSection;
