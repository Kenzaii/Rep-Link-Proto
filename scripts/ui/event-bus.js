/**
 * Event Bus
 * Simple event system for component communication
 */

'use strict';

/**
 * Event Bus Class
 * Provides a centralized event system for the application
 */
export class EventBus {
    constructor() {
        this.events = new Map();
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     * @param {Object} options - Subscription options
     * @returns {Function} Unsubscribe function
     */
    on(event, callback, options = {}) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }

        const subscription = {
            callback,
            once: options.once || false,
            priority: options.priority || 0,
            context: options.context || null
        };

        this.events.get(event).push(subscription);
        
        // Sort by priority (higher priority first)
        this.events.get(event).sort((a, b) => b.priority - a.priority);

        // Return unsubscribe function
        return () => {
            this.off(event, callback);
        };
    }

    /**
     * Subscribe to an event once
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     * @param {Object} options - Subscription options
     * @returns {Function} Unsubscribe function
     */
    once(event, callback, options = {}) {
        return this.on(event, callback, { ...options, once: true });
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {Function} callback - Event callback to remove
     */
    off(event, callback) {
        if (!this.events.has(event)) return;

        const subscriptions = this.events.get(event);
        const index = subscriptions.findIndex(sub => sub.callback === callback);
        
        if (index > -1) {
            subscriptions.splice(index, 1);
        }

        // Clean up empty event arrays
        if (subscriptions.length === 0) {
            this.events.delete(event);
        }
    }

    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {...any} args - Event arguments
     */
    emit(event, ...args) {
        if (!this.events.has(event)) return;

        const subscriptions = [...this.events.get(event)]; // Copy to avoid issues with modifications during iteration
        
        subscriptions.forEach(subscription => {
            try {
                if (subscription.context) {
                    subscription.callback.apply(subscription.context, args);
                } else {
                    subscription.callback(...args);
                }

                // Remove one-time subscriptions
                if (subscription.once) {
                    this.off(event, subscription.callback);
                }
            } catch (error) {
                console.error(`Error in event handler for "${event}":`, error);
            }
        });
    }

    /**
     * Remove all listeners for an event
     * @param {string} event - Event name
     */
    removeAllListeners(event) {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
    }

    /**
     * Get all event names
     * @returns {Array<string>}
     */
    getEventNames() {
        return Array.from(this.events.keys());
    }

    /**
     * Get listener count for an event
     * @param {string} event - Event name
     * @returns {number}
     */
    getListenerCount(event) {
        return this.events.has(event) ? this.events.get(event).length : 0;
    }

    /**
     * Check if an event has listeners
     * @param {string} event - Event name
     * @returns {boolean}
     */
    hasListeners(event) {
        return this.events.has(event) && this.events.get(event).length > 0;
    }

    /**
     * Create a namespaced event bus
     * @param {string} namespace - Namespace prefix
     * @returns {Object} Namespaced event bus
     */
    namespace(namespace) {
        return {
            on: (event, callback, options) => this.on(`${namespace}:${event}`, callback, options),
            once: (event, callback, options) => this.once(`${namespace}:${event}`, callback, options),
            off: (event, callback) => this.off(`${namespace}:${event}`, callback),
            emit: (event, ...args) => this.emit(`${namespace}:${event}`, ...args),
            removeAllListeners: (event) => this.removeAllListeners(event ? `${namespace}:${event}` : null)
        };
    }
}

// Create global event bus instance
export const eventBus = new EventBus();
