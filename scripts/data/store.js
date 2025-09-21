/**
 * Store
 * Centralized state management with localStorage persistence
 */

'use strict';

const KEY = 'replink_state_v1';

const DEFAULT_STATE = {
    auth: { isAuthed: false, user: null, token: null },
    users: [],
    businesses: [],
    opportunities: [],
    proposals: [],
    contracts: [],
    messages: [],
    faq: []
};

/**
 * Store Class
 * Manages application state with localStorage persistence and auth event broadcasting
 */
export class Store {
    constructor() {
        const raw = localStorage.getItem(KEY);
        this.state = raw ? JSON.parse(raw) : DEFAULT_STATE;
        this.subscribers = new Map();
    }

    /**
     * Save state to localStorage
     */
    save() {
        localStorage.setItem(KEY, JSON.stringify(this.state));
    }

    /**
     * Get data from store
     */
    get(path) {
        if (path === 'auth') return this.state.auth;
        return this.state[path];
    }

    /**
     * Set data in store
     */
    set(path, value) {
        this.state[path] = value;
        this.save();
        
        // Broadcast auth changes
        if (path === 'auth') {
            window.dispatchEvent(new CustomEvent('auth:changed', { detail: value }));
        }
    }

    /**
     * Set authentication state
     */
    setAuth(auth) {
        this.set('auth', auth);
    }

    /**
     * Clear authentication state
     */
    clearAuth() {
        this.set('auth', { isAuthed: false, user: null, token: null });
    }

    /**
     * Update user data
     */
    updateUser(patch) {
        const auth = this.get('auth');
        if (!auth?.user) return;
        this.setAuth({ ...auth, user: { ...auth.user, ...patch } });
    }

    /**
     * Subscribe to store changes
     */
    subscribe(path, callback) {
        if (!this.subscribers.has(path)) {
            this.subscribers.set(path, new Set());
        }
        this.subscribers.get(path).add(callback);
        
        // Return unsubscribe function
        return () => {
            const callbacks = this.subscribers.get(path);
            if (callbacks) {
                callbacks.delete(callback);
            }
        };
    }

    /**
     * Initialize store (legacy compatibility)
     */
    async init() {
        console.log('Store initialized successfully');
        return Promise.resolve();
    }

    /**
     * Load data from localStorage (legacy compatibility)
     */
    async load() {
        // Data is already loaded in constructor
        return Promise.resolve();
    }

    /**
     * Save data to localStorage (legacy compatibility)
     */
    async saveData() {
        this.save();
        return Promise.resolve();
    }

    /**
     * Get all data (legacy compatibility)
     */
    getAll() {
        return this.state;
    }

    /**
     * Set all data (legacy compatibility)
     */
    setAll(data) {
        this.state = { ...DEFAULT_STATE, ...data };
        this.save();
    }

    /**
     * Clear all data
     */
    clear() {
        this.state = { ...DEFAULT_STATE };
        this.save();
    }

    /**
     * Check if store has data
     */
    has(path) {
        return this.state.hasOwnProperty(path);
    }

    /**
     * Get store size
     */
    size() {
        return Object.keys(this.state).length;
    }

    /**
     * Get store keys
     */
    keys() {
        return Object.keys(this.state);
    }

    /**
     * Get store values
     */
    values() {
        return Object.values(this.state);
    }

    /**
     * Get store entries
     */
    entries() {
        return Object.entries(this.state);
    }

    /**
     * For each entry in store
     */
    forEach(callback) {
        Object.entries(this.state).forEach(([key, value]) => {
            callback(value, key, this.state);
        });
    }

    /**
     * Map over store entries
     */
    map(callback) {
        return Object.entries(this.state).map(([key, value]) => {
            return callback(value, key, this.state);
        });
    }

    /**
     * Filter store entries
     */
    filter(callback) {
        const result = {};
        Object.entries(this.state).forEach(([key, value]) => {
            if (callback(value, key, this.state)) {
                result[key] = value;
            }
        });
        return result;
    }

    /**
     * Reduce over store entries
     */
    reduce(callback, initialValue) {
        return Object.entries(this.state).reduce((acc, [key, value]) => {
            return callback(acc, value, key, this.state);
        }, initialValue);
    }

    /**
     * Find entry in store
     */
    find(callback) {
        for (const [key, value] of Object.entries(this.state)) {
            if (callback(value, key, this.state)) {
                return { key, value };
            }
        }
        return null;
    }

    /**
     * Check if any entry matches callback
     */
    some(callback) {
        return Object.entries(this.state).some(([key, value]) => {
            return callback(value, key, this.state);
        });
    }

    /**
     * Check if all entries match callback
     */
    every(callback) {
        return Object.entries(this.state).every(([key, value]) => {
            return callback(value, key, this.state);
        });
    }
}

// Create and export singleton instance
export const store = new Store();