/**
 * Pokemon caching system for browser and server environments
 */
const PokemonCache = {
    // Storage containers
    imageCache: new Map(),
    customPokemonNames: new Set(),

    // Configuration
    MAX_CACHE_SIZE: 100,
    DEFAULT_EXPIRATION: 60, // Minutes

    // Environment detection
    isBrowser: typeof window !== "undefined",

    /**
     * Checks if a Pokemon ID is custom (not from standard database)
     */
    isCustomId(id) {
        if (!id) return false;
        if (String(id).includes("?")) return true;

        const numId = parseInt(id);
        return !isNaN(numId) && numId > 2000;
    },

    /**
     * Registers a Pokemon in the custom registry
     */
    registerCustom(name) {
        if (!name) return;

        const nameLower = String(name).toLowerCase();
        if (!this.customPokemonNames.has(nameLower)) {
            console.log(`Registering ${name} as a custom Pokemon`);
            this.customPokemonNames.add(nameLower);

            if (this.isBrowser) {
                try {
                    const storedNames = JSON.parse(
                        sessionStorage.getItem("pokemon_custom_names") || "[]"
                    );
                    if (!storedNames.includes(nameLower)) {
                        storedNames.push(nameLower);
                        sessionStorage.setItem(
                            "pokemon_custom_names",
                            JSON.stringify(storedNames)
                        );
                    }
                } catch (error) {
                    console.warn(
                        "Failed to save custom Pokemon to sessionStorage:",
                        error
                    );
                }
            }
        }
    },

    /**
     * Loads custom Pokemon from browser storage
     */
    loadStoredCustomPokemon() {
        if (!this.isBrowser) return;

        try {
            const storedNames = JSON.parse(
                sessionStorage.getItem("pokemon_custom_names") || "[]"
            );
            storedNames.forEach((name) => this.customPokemonNames.add(name));
            console.log(
                `Loaded ${storedNames.length} custom Pokemon from sessionStorage`
            );
        } catch (error) {
            console.warn(
                "Failed to load custom Pokemon from sessionStorage:",
                error
            );
        }
    },

    /**
     * Checks if a name is registered as custom
     */
    isCustomName(name) {
        if (!name) return false;
        const cacheKey = String(name).toLowerCase().trim();
        return this.customPokemonNames.has(cacheKey);
    },

    /**
     * Creates standardized cache key
     */
    getCacheKey(nameOrId) {
        return String(nameOrId).toLowerCase().trim();
    },

    /**
     * Retrieves an image from cache
     */
    getImageFromCache(key) {
        const cacheKey = this.getCacheKey(key);
        const now = Date.now();

        // Check memory cache
        if (this.imageCache.has(cacheKey)) {
            const cachedData = this.imageCache.get(cacheKey);

            if (!cachedData.expires || cachedData.expires > now) {
                return cachedData.url;
            } else {
                this.imageCache.delete(cacheKey);
            }
        }

        // Check session storage
        if (this.isBrowser) {
            try {
                const storageKey = `pokemon_img_${cacheKey}`;
                const storedData = sessionStorage.getItem(storageKey);

                if (storedData) {
                    const parsedData = JSON.parse(storedData);

                    if (!parsedData.expires || parsedData.expires > now) {
                        this.imageCache.set(cacheKey, parsedData);
                        return parsedData.url;
                    } else {
                        sessionStorage.removeItem(storageKey);
                    }
                }
            } catch (error) {
                console.warn(
                    "Error retrieving image from sessionStorage:",
                    error
                );
            }
        }

        return null;
    },

    /**
     * Stores an image in cache
     */
    cacheImage(key, imageUrl, expirationMinutes = this.DEFAULT_EXPIRATION) {
        if (!key || !imageUrl) return;

        const cacheKey = this.getCacheKey(key);
        const expires = expirationMinutes
            ? Date.now() + expirationMinutes * 60 * 1000
            : null;
        const cacheEntry = { url: imageUrl, expires };

        // Remove oldest item if cache is full
        if (this.imageCache.size >= this.MAX_CACHE_SIZE) {
            const oldestKey = this.imageCache.keys().next().value;
            this.imageCache.delete(oldestKey);
        }

        // Update memory cache
        this.imageCache.set(cacheKey, cacheEntry);

        // Update session storage
        if (this.isBrowser) {
            try {
                const storageKey = `pokemon_img_${cacheKey}`;
                sessionStorage.setItem(storageKey, JSON.stringify(cacheEntry));
            } catch (error) {
                console.warn("Failed to cache image in sessionStorage:", error);
            }
        }
    },

    /**
     * Clears all cached data
     */
    clearAll() {
        // Clear memory caches
        this.imageCache.clear();
        this.customPokemonNames.clear();

        // Clear session storage
        if (this.isBrowser) {
            try {
                Object.keys(sessionStorage).forEach((key) => {
                    if (key.startsWith("pokemon_")) {
                        sessionStorage.removeItem(key);
                    }
                });
            } catch (error) {
                console.warn("Error clearing sessionStorage cache:", error);
            }
        }

        console.log("Pokemon cache cleared");
    },

    /**
     * Initializes the cache system
     */
    init() {
        if (this.isBrowser) {
            this.loadStoredCustomPokemon();
        }
        return this;
    },
};

// Initialize cache on module load
export default PokemonCache.init();
