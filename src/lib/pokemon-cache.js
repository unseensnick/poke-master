/**
 * Pokemon caching system for browser and server
 * Reduces API calls by storing Pokemon data locally
 */
const PokemonCache = {
    // Storage for cached data
    imageCache: new Map(),
    customPokemonNames: new Set(),

    // Configuration settings
    MAX_CACHE_SIZE: 100,
    DEFAULT_EXPIRATION: 60, // Minutes

    // Check if in browser environment
    isBrowser: typeof window !== "undefined",

    /**
     * Checks if a Pokemon ID is custom (not from standard database)
     *
     * @param {string|number} id - Pokemon ID to check
     * @returns {boolean} True if custom ID
     */
    isCustomId(id) {
        if (!id) return false;
        if (String(id).includes("?")) return true;

        const numId = parseInt(id);
        return !isNaN(numId) && numId > 2000;
    },

    /**
     * Adds a Pokemon to the custom registry
     *
     * @param {string} name - Pokemon name to register
     */
    registerCustom(name) {
        if (!name) return;

        const nameLower = String(name).toLowerCase();
        if (!this.customPokemonNames.has(nameLower)) {
            console.log(`Registering ${name} as a custom Pokemon`);
            this.customPokemonNames.add(nameLower);

            // Save to sessionStorage in browser
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
     * Loads custom Pokemon from sessionStorage
     */
    loadStoredCustomPokemon() {
        // Skip on server
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
     *
     * @param {string} name - Pokemon name to check
     * @returns {boolean} True if registered as custom
     */
    isCustomName(name) {
        if (!name) return false;
        const cacheKey = String(name).toLowerCase().trim();
        return this.customPokemonNames.has(cacheKey);
    },

    /**
     * Creates a standardized cache key
     *
     * @param {string|number} nameOrId - Pokemon name or ID
     * @returns {string} Standardized cache key
     */
    getCacheKey(nameOrId) {
        return String(nameOrId).toLowerCase().trim();
    },

    /**
     * Gets an image from cache
     *
     * @param {string} key - Cache key to look up
     * @returns {string|null} Image URL or null if not found
     */
    getImageFromCache(key) {
        const cacheKey = this.getCacheKey(key);
        const now = Date.now();

        // Check memory cache first
        if (this.imageCache.has(cacheKey)) {
            const cachedData = this.imageCache.get(cacheKey);

            // Check if expired
            if (!cachedData.expires || cachedData.expires > now) {
                return cachedData.url;
            } else {
                // Remove expired data
                this.imageCache.delete(cacheKey);
            }
        }

        // Try sessionStorage next (browser only)
        if (this.isBrowser) {
            try {
                const storageKey = `pokemon_img_${cacheKey}`;
                const storedData = sessionStorage.getItem(storageKey);

                if (storedData) {
                    const parsedData = JSON.parse(storedData);

                    // Check if expired
                    if (!parsedData.expires || parsedData.expires > now) {
                        // Add back to memory cache
                        this.imageCache.set(cacheKey, parsedData);
                        return parsedData.url;
                    } else {
                        // Remove expired data
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

        // Not found in cache
        return null;
    },

    /**
     * Adds an image to cache
     *
     * @param {string} key - Cache key
     * @param {string} imageUrl - Image URL to cache
     * @param {number} expirationMinutes - Minutes until expiration
     */
    cacheImage(key, imageUrl, expirationMinutes = this.DEFAULT_EXPIRATION) {
        if (!key || !imageUrl) return;

        const cacheKey = this.getCacheKey(key);

        // Calculate expiration (null = never expire)
        const expires = expirationMinutes
            ? Date.now() + expirationMinutes * 60 * 1000
            : null;

        // Create cache entry
        const cacheEntry = { url: imageUrl, expires };

        // If cache is full, remove oldest entry
        if (this.imageCache.size >= this.MAX_CACHE_SIZE) {
            const oldestKey = this.imageCache.keys().next().value;
            this.imageCache.delete(oldestKey);
        }

        // Add to memory cache
        this.imageCache.set(cacheKey, cacheEntry);

        // Store in sessionStorage (browser only)
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

        // Clear sessionStorage (browser only)
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
     * Initialize the cache system
     */
    init() {
        // Only load from storage in browser
        if (this.isBrowser) {
            this.loadStoredCustomPokemon();
        }
        return this;
    },
};

// Initialize cache when module loads
export default PokemonCache.init();
