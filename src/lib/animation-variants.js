/**
 * Shared animation variants for consistent motion throughout the application
 * These can be imported and used with Framer Motion components
 */

/**
 * Fade animations for elements entering and exiting the DOM
 */
export const fadeVariants = {
    // Basic fade with configurable duration
    standard: {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.4 } },
        exit: { opacity: 0, transition: { duration: 0.3 } },
    },

    // Fade with slight upward movement
    fadeUp: {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
    },

    // Fade with slight downward movement
    fadeDown: {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
        exit: { opacity: 0, y: 10, transition: { duration: 0.3 } },
    },

    // Fade with scale effect
    fadeScale: {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
    },
};

/**
 * Container animations for staggered children
 */
export const containerVariants = {
    // Standard container animation with staggered children
    standard: {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
        exit: { opacity: 0 },
    },

    // Grid container for card layouts
    grid: {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1,
            },
        },
        exit: { opacity: 0, transition: { staggerChildren: 0.03 } },
    },
};

/**
 * Item animations for children of container elements
 */
export const itemVariants = {
    // Standard item animation with spring physics
    standard: {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 24,
            },
        },
        exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
    },

    // Card animation with subtle scale effect
    card: {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        show: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 24,
            },
        },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
    },
};

/**
 * Hover animations for interactive elements
 */
export const hoverVariants = {
    // Subtle scale increase
    scale: {
        initial: { scale: 1 },
        hover: { scale: 1.05, transition: { duration: 0.2 } },
    },

    // Lift effect
    lift: {
        initial: { y: 0 },
        hover: { y: -5, transition: { duration: 0.2 } },
    },

    // Combined scale and lift
    scaleLift: {
        initial: { y: 0, scale: 1 },
        hover: {
            y: -5,
            scale: 1.05,
            transition: { duration: 0.2 },
        },
    },

    // Emphasized effect for buttons or calls to action
    emphasis: {
        initial: {
            y: 0,
            boxShadow: "0px 0px 0px rgba(0,0,0,0)",
        },
        hover: {
            y: -8,
            boxShadow: "0px 10px 15px rgba(0,0,0,0.2)",
            transition: {
                duration: 0.3,
                ease: "easeOut",
            },
        },
    },
};

/**
 * Pokemon Card specific animations
 */
export const pokemonCardVariants = {
    // Container for the whole card
    container: {
        exit: {
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.2, ease: "easeIn" },
        },
        enter: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3, ease: "easeOut" },
        },
    },

    // Main card element
    card: {
        initial: {
            y: 0,
            boxShadow: "0px 0px 0px rgba(0,0,0,0)",
        },
        hover: {
            y: -8, // Move up 8px
            boxShadow: "0px 10px 15px rgba(0,0,0,0.2)",
            transition: {
                duration: 0.3,
                ease: "easeOut",
            },
        },
    },

    // Pokemon image animation
    image: {
        initial: {
            scale: 1,
            rotate: 0,
        },
        hover: {
            scale: 1.05,
            rotate: [0, -1, 1, -1, 1, 0], // Sequence creates wiggle effect
            transition: {
                scale: { duration: 0.2 },
                rotate: {
                    duration: 1,
                    repeat: 1,
                    repeatType: "mirror",
                },
            },
        },
    },

    // Badge animation
    badge: {
        initial: { scale: 1 },
        hover: { scale: 1.05, transition: { duration: 0.2, delay: 0.1 } },
    },

    // Accent elements animation
    accent: {
        initial: { opacity: 1 },
        hover: { opacity: 0, transition: { duration: 0.4 } },
    },

    // Border animation
    border: {
        initial: { opacity: 0 },
        hover: { opacity: 1, transition: { duration: 0.4 } },
    },

    // Stats animation - fixed to work with custom property instead of function call
    stats: {
        initial: { y: 0 },
        hover: {
            y: -3,
            transition: {
                duration: 0.2,
                // Delay will come from custom prop in Framer Motion
            },
        },
    },

    // Type badge animation - fixed to work with custom property instead of function call
    typeBadge: {
        initial: { y: 0, scale: 1 },
        hover: {
            y: -3,
            scale: 1.05,
            transition: {
                duration: 0.2,
                // Delay will be calculated based on index via custom prop
            },
        },
    },
};

/**
 * Loading spinner animations
 */
export const spinnerVariants = {
    spin: {
        animate: {
            rotate: 360,
            transition: {
                duration: 1,
                repeat: Infinity,
                ease: "linear",
            },
        },
    },

    pulse: {
        animate: {
            scale: [1, 1.1, 1],
            opacity: [0.6, 1, 0.6],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
            },
        },
    },
};

/**
 * Page transition animations
 */
export const pageTransitionVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.5,
            when: "beforeChildren",
            staggerChildren: 0.1,
        },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.3,
            when: "afterChildren",
            staggerChildren: 0.05,
        },
    },
};

/**
 * Modal and dialog animations
 */
export const modalVariants = {
    overlay: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.2 },
        },
        exit: {
            opacity: 0,
            transition: {
                delay: 0.1,
                duration: 0.2,
            },
        },
    },

    content: {
        hidden: {
            opacity: 0,
            scale: 0.9,
            y: 20,
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 500,
            },
        },
        exit: {
            opacity: 0,
            scale: 0.9,
            y: 20,
            transition: { duration: 0.2 },
        },
    },
};

/**
 * Filter and search component animations
 */
export const filterVariants = {
    container: {
        collapsed: { height: 0, opacity: 0 },
        expanded: {
            height: "auto",
            opacity: 1,
            transition: {
                height: { duration: 0.3 },
                opacity: { duration: 0.3 },
            },
        },
    },

    item: {
        hidden: { opacity: 0, x: -10 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.2 },
        },
    },
};

/**
 * List animations for search results or dynamic content
 */
export const listVariants = {
    container: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    },

    item: {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 500,
            },
        },
    },
};
