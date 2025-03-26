/**
 * Enhanced Pokemon caching system
 * Works in both server and client environments
 */
const PokemonCache = {
    // Cache storage
    imageCache: new Map(),
    customPokemonNames: new Set(),

    // Configuration
    MAX_CACHE_SIZE: 100,
    DEFAULT_EXPIRATION: 60,

    // Track if we're in a browser environment
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
     * Registers a Pokemon name as custom to avoid unnecessary database queries
     */
    registerCustom(name) {
        if (!name) return;

        const nameLower = String(name).toLowerCase();
        if (!this.customPokemonNames.has(nameLower)) {
            console.log(`Registering ${name} as a custom Pokemon`);
            this.customPokemonNames.add(nameLower);

            // Only try to use sessionStorage in the browser
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
     * Load custom Pokemon names from sessionStorage when initializing
     */
    loadStoredCustomPokemon() {
        // Skip this on the server
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
     * Checks if a name is already registered as a custom Pokemon
     */
    isCustomName(name) {
        if (!name) return false;
        const cacheKey = String(name).toLowerCase().trim();
        return this.customPokemonNames.has(cacheKey);
    },

    /**
     * Standardizes a name or ID into a consistent cache key
     */
    getCacheKey(nameOrId) {
        return String(nameOrId).toLowerCase().trim();
    },

    /**
     * Gets an image from cache (memory first, then sessionStorage)
     */
    getImageFromCache(key) {
        const cacheKey = this.getCacheKey(key);
        const now = Date.now();

        // Check memory cache first (fastest)
        if (this.imageCache.has(cacheKey)) {
            const cachedData = this.imageCache.get(cacheKey);

            // Check if data has expired
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

                    // Check if data has expired
                    if (!parsedData.expires || parsedData.expires > now) {
                        // Add back to memory cache and return
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

        // Not found in any cache
        return null;
    },

    /**
     * Adds an image to both memory cache and sessionStorage
     */
    cacheImage(key, imageUrl, expirationMinutes = this.DEFAULT_EXPIRATION) {
        if (!key || !imageUrl) return;

        const cacheKey = this.getCacheKey(key);

        // Calculate expiration time (null means never expire)
        const expires = expirationMinutes
            ? Date.now() + expirationMinutes * 60 * 1000
            : null;

        // Create cache entry
        const cacheEntry = { url: imageUrl, expires };

        // Manage memory cache size limit
        if (this.imageCache.size >= this.MAX_CACHE_SIZE) {
            // Remove oldest entry (first item in the Map)
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
     * Clears all cached data from memory and sessionStorage
     */
    clearAll() {
        // Clear memory caches
        this.imageCache.clear();
        this.customPokemonNames.clear();

        // Clear sessionStorage items (browser only)
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
     * Safe to use on both server and client
     */
    init() {
        // Only load from storage in the browser
        if (this.isBrowser) {
            this.loadStoredCustomPokemon();
        }
        return this;
    },
};

// Initialize the cache when the module loads
export default PokemonCache.init();
