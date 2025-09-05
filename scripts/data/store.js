/**
 * Store
 * Local storage backed data store for the application
 */

'use strict';

/**
 * Store Class
 * Manages application state with localStorage persistence
 */
export class Store {
    constructor() {
        this.data = new Map();
        this.subscribers = new Map();
        this.storageKey = 'rep-link-store';
        this.autoSave = true;
        this.saveDebounce = null;
    }

    /**
     * Initialize the store
     */
    async init() {
        try {
            // Load data from localStorage
            await this.load();
            
            // Set up auto-save
            if (this.autoSave) {
                this.setupAutoSave();
            }
            
            console.log('Store initialized successfully');
        } catch (error) {
            console.error('Failed to initialize store:', error);
            throw error;
        }
    }

    /**
     * Set up auto-save functionality
     */
    setupAutoSave() {
        // Debounced save function
        this.saveDebounce = this.debounce(() => {
            this.save();
        }, 1000);
        
        // Listen for data changes
        this.on('data:changed', this.saveDebounce);
    }

    /**
     * Load data from localStorage
     */
    async load() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.data = new Map(Object.entries(parsed));
            }
            
            // Initialize default data if empty
            if (this.data.size === 0) {
                this.initializeDefaultData();
            }
            
        } catch (error) {
            console.error('Failed to load store data:', error);
            this.initializeDefaultData();
        }
    }

    /**
     * Save data to localStorage
     */
    async save() {
        try {
            const serialized = Object.fromEntries(this.data);
            localStorage.setItem(this.storageKey, JSON.stringify(serialized));
            this.emit('store:saved');
        } catch (error) {
            console.error('Failed to save store data:', error);
            this.emit('store:error', error);
        }
    }

    /**
     * Initialize default data structure
     */
    initializeDefaultData() {
        const defaultData = {
            // Authentication
            auth: {
                token: null,
                user: null,
                isAuthenticated: false,
                lastLogin: null
            },
            
            // Users
            users: [],
            
            // Businesses
            businesses: [],
            
            // Opportunities
            opportunities: [],
            
            // Proposals
            proposals: [],
            
            // Contracts
            contracts: [],
            
            // Messages
            messages: [],
            
            // Application state
            app: {
                theme: 'light',
                language: 'en',
                notifications: true,
                lastSync: null
            },
            
            // UI state
            ui: {
                sidebarOpen: false,
                currentPage: null,
                filters: {},
                searchQuery: ''
            }
        };
        
        Object.entries(defaultData).forEach(([key, value]) => {
            this.data.set(key, value);
        });
        
        this.emit('store:initialized');
    }

    /**
     * Get data by key
     * @param {string} key - Data key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any}
     */
    get(key, defaultValue = null) {
        return this.data.has(key) ? this.data.get(key) : defaultValue;
    }

    /**
     * Set data by key
     * @param {string} key - Data key
     * @param {any} value - Value to set
     */
    set(key, value) {
        const oldValue = this.data.get(key);
        this.data.set(key, value);
        
        // Emit change event
        this.emit('data:changed', { key, value, oldValue });
        this.emit(`data:changed:${key}`, { value, oldValue });
    }

    /**
     * Update data by key (merge with existing)
     * @param {string} key - Data key
     * @param {Object} updates - Updates to apply
     */
    update(key, updates) {
        const currentValue = this.get(key, {});
        const newValue = { ...currentValue, ...updates };
        this.set(key, newValue);
    }

    /**
     * Delete data by key
     * @param {string} key - Data key
     */
    delete(key) {
        if (this.data.has(key)) {
            const oldValue = this.data.get(key);
            this.data.delete(key);
            
            // Emit change event
            this.emit('data:changed', { key, value: null, oldValue });
            this.emit(`data:changed:${key}`, { value: null, oldValue });
        }
    }

    /**
     * Check if key exists
     * @param {string} key - Data key
     * @returns {boolean}
     */
    has(key) {
        return this.data.has(key);
    }

    /**
     * Get all data
     * @returns {Object}
     */
    getAll() {
        return Object.fromEntries(this.data);
    }

    /**
     * Clear all data
     */
    clear() {
        this.data.clear();
        this.emit('store:cleared');
    }

    /**
     * Subscribe to data changes
     * @param {string} key - Data key to watch
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, []);
        }
        
        this.subscribers.get(key).push(callback);
        
        // Return unsubscribe function
        return () => {
            const callbacks = this.subscribers.get(key);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }

    /**
     * Emit event to subscribers
     * @param {string} event - Event name
     * @param {any} data - Event data
     */
    emit(event, data) {
        // Global subscribers
        const globalSubscribers = this.subscribers.get('*');
        if (globalSubscribers) {
            globalSubscribers.forEach(callback => {
                try {
                    callback(event, data);
                } catch (error) {
                    console.error('Store subscriber error:', error);
                }
            });
        }
        
        // Specific key subscribers
        const keySubscribers = this.subscribers.get(event);
        if (keySubscribers) {
            keySubscribers.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Store subscriber error:', error);
                }
            });
        }
    }

    /**
     * Create a namespaced store
     * @param {string} namespace - Namespace prefix
     * @returns {Object} Namespaced store methods
     */
    namespace(namespace) {
        return {
            get: (key, defaultValue) => this.get(`${namespace}:${key}`, defaultValue),
            set: (key, value) => this.set(`${namespace}:${key}`, value),
            update: (key, updates) => this.update(`${namespace}:${key}`, updates),
            delete: (key) => this.delete(`${namespace}:${key}`),
            has: (key) => this.has(`${namespace}:${key}`),
            subscribe: (key, callback) => this.subscribe(`${namespace}:${key}`, callback)
        };
    }

    /**
     * Get store statistics
     * @returns {Object}
     */
    getStats() {
        return {
            size: this.data.size,
            keys: Array.from(this.data.keys()),
            subscribers: Array.from(this.subscribers.keys()).length,
            lastSaved: localStorage.getItem(`${this.storageKey}:lastSaved`)
        };
    }

    /**
     * Export store data
     * @returns {string} JSON string of store data
     */
    export() {
        return JSON.stringify(this.getAll(), null, 2);
    }

    /**
     * Import store data
     * @param {string} jsonData - JSON string of store data
     */
    import(jsonData) {
        try {
            const imported = JSON.parse(jsonData);
            this.data = new Map(Object.entries(imported));
            this.emit('store:imported');
            this.save();
        } catch (error) {
            console.error('Failed to import store data:', error);
            throw error;
        }
    }

    /**
     * Debounce utility function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function}
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Create a reactive computed value
     * @param {Array} dependencies - Array of data keys to watch
     * @param {Function} compute - Computation function
     * @returns {Object} Reactive computed value
     */
    computed(dependencies, compute) {
        let value = null;
        let isDirty = true;
        const subscribers = [];
        
        const update = () => {
            if (isDirty) {
                const deps = dependencies.map(dep => this.get(dep));
                value = compute(...deps);
                isDirty = false;
                
                // Notify subscribers
                subscribers.forEach(callback => callback(value));
            }
        };
        
        // Subscribe to dependencies
        const unsubscribers = dependencies.map(dep => 
            this.subscribe(`data:changed:${dep}`, () => {
                isDirty = true;
                update();
            })
        );
        
        // Initial computation
        update();
        
        return {
            get value() {
                update();
                return value;
            },
            subscribe: (callback) => {
                subscribers.push(callback);
                return () => {
                    const index = subscribers.indexOf(callback);
                    if (index > -1) {
                        subscribers.splice(index, 1);
                    }
                };
            },
            destroy: () => {
                unsubscribers.forEach(unsub => unsub());
                subscribers.length = 0;
            }
        };
    }
}
