/**
 * Animation variants for use with Framer Motion
 */

/**
 * Basic fade animations
 */
export const fadeVariants = {
    standard: {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.4 } },
        exit: { opacity: 0, transition: { duration: 0.3 } },
    },

    fadeUp: {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
    },

    fadeDown: {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
        exit: { opacity: 0, y: 10, transition: { duration: 0.3 } },
    },

    fadeScale: {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
    },
};

/**
 * Container animations with staggered children
 */
export const containerVariants = {
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
 * Item animations for children of containers
 */
export const itemVariants = {
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
    scale: {
        initial: { scale: 1 },
        hover: { scale: 1.05, transition: { duration: 0.2 } },
    },

    lift: {
        initial: { y: 0 },
        hover: { y: -5, transition: { duration: 0.2 } },
    },

    scaleLift: {
        initial: { y: 0, scale: 1 },
        hover: {
            y: -5,
            scale: 1.05,
            transition: { duration: 0.2 },
        },
    },

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
 * Pokemon card-specific animations
 */
export const pokemonCardVariants = {
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

    card: {
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

    image: {
        initial: {
            scale: 1,
            rotate: 0,
        },
        hover: {
            scale: 1.05,
            rotate: [0, -1, 1, -1, 1, 0], // Wiggle effect
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

    badge: {
        initial: { scale: 1 },
        hover: { scale: 1.05, transition: { duration: 0.2, delay: 0.1 } },
    },

    accent: {
        initial: { opacity: 1 },
        hover: { opacity: 0, transition: { duration: 0.4 } },
    },

    border: {
        initial: { opacity: 0 },
        hover: { opacity: 1, transition: { duration: 0.4 } },
    },

    stats: {
        initial: { y: 0 },
        hover: {
            y: -3,
            transition: {
                duration: 0.2,
            },
        },
    },

    typeBadge: {
        initial: { y: 0, scale: 1 },
        hover: {
            y: -3,
            scale: 1.05,
            transition: {
                duration: 0.2,
            },
        },
    },
};

/**
 * Loading animation variants
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
 * Filter animations
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
 * List animations
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
