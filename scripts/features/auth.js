/**
 * Authentication Feature
 * Handles user authentication and session management
 */

'use strict';

import { store } from '../data/store.js';
import { API } from '../data/api.js';
import { api } from '../data/api.js';
import { EventBus } from '../ui/event-bus.js';
import { Toast } from '../ui/components.js';
import { FormValidator, ValidationRules } from '../ui/forms.js';
import { dashboardHrefFor } from '../app.js';

/**
 * Authentication Manager
 * Handles login, logout, registration, and session management
 */
export class Auth {
    constructor(storeInstance, api, eventBus) {
        this.store = storeInstance;
        this.api = api;
        this.eventBus = eventBus;
        this.toast = new Toast();
        
        this.currentUser = null;
        this.isAuthenticated = false;
        this.sessionTimeout = null;
    }

    /**
     * Initialize authentication
     */
    async init() {
        try {
            // Check for existing session in store
            const auth = this.store.get('auth');
            
            if (auth?.isAuthed && auth.user) {
                this.currentUser = auth.user;
                this.isAuthenticated = true;
                console.log('Restored authentication state for:', auth.user.name);
            }
            
            // Set up event listeners
            this.setupEventListeners();
            
            console.log('Auth initialized successfully');
        } catch (error) {
            console.error('Auth initialization failed:', error);
            this.logout();
        }
    }

    /**
     * Handle successful login
     */
    async handleLoginSuccess(user) {
        this.store.setAuth({ isAuthed: true, user, token: 'dev' });
        
        // Update local state
        this.currentUser = user;
        this.isAuthenticated = true;
        
        // Emit login event
        this.eventBus.emit('auth:login', user);
        
        // Optional: honor ?next= param, else go to dashboard
        const params = new URLSearchParams(location.search);
        const next = params.get('next');
        location.href = next || dashboardHrefFor(user);
    }

    /**
     * Set up authentication event listeners
     */
    setupEventListeners() {
        // Listen for auth events
        this.eventBus.on('auth:login', this.handleLogin.bind(this));
        this.eventBus.on('auth:logout', this.handleLogout.bind(this));
        this.eventBus.on('auth:register', this.handleRegister.bind(this));
        
        // Listen for storage changes (multi-tab sync)
        window.addEventListener('storage', this.handleStorageChange.bind(this));
        
        // Listen for page visibility changes (session timeout)
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    /**
     * Login user
     */
    async login(email, password, role = 'rep') {
        try {
            const response = await this.api.request('auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password, role })
            });

            if (response.success) {
                const { user, token, expiresAt } = response.data;
                
                // Store session data
                localStorage.setItem('auth-token', token);
                localStorage.setItem('user-data', JSON.stringify(user));
                localStorage.setItem('session-expires', expiresAt);
                
                // Update state
                this.currentUser = user;
                this.isAuthenticated = true;
                
                // Update store
                this.store.set('auth', {
                    token,
                    user,
                    isAuthenticated: true,
                    lastLogin: new Date().toISOString()
                });
                
                // Set session timeout
                this.setSessionTimeout(expiresAt);
                
                // Emit events
                this.eventBus.emit('auth:login', user);
                
                this.toast.show(`Welcome back, ${user.name}!`, 'success');
                
                return { success: true, user };
            } else {
                throw new Error(response.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.toast.show(error.message || 'Login failed', 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * Register new user
     */
    async register(userData) {
        try {
            const response = await this.api.request('auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });

            if (response.success) {
                const { user, token, expiresAt } = response.data;
                
                // Store session data
                localStorage.setItem('auth-token', token);
                localStorage.setItem('user-data', JSON.stringify(user));
                localStorage.setItem('session-expires', expiresAt);
                
                // Update state
                this.currentUser = user;
                this.isAuthenticated = true;
                
                // Update store
                this.store.set('auth', {
                    token,
                    user,
                    isAuthenticated: true,
                    lastLogin: new Date().toISOString()
                });
                
                // Set session timeout
                this.setSessionTimeout(expiresAt);
                
                // Emit events
                this.eventBus.emit('auth:register', user);
                
                this.toast.show(`Welcome to Rep-Link, ${user.name}!`, 'success');
                
                return { success: true, user };
            } else {
                throw new Error(response.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.toast.show(error.message || 'Registration failed', 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            // Call logout API
            await this.api.request('auth/logout', { method: 'POST' });
        } catch (error) {
            console.warn('Logout API call failed:', error);
        } finally {
            // Clear local data using store
            this.store.clearAuth();
            
            // Clear session timeout
            if (this.sessionTimeout) {
                clearTimeout(this.sessionTimeout);
                this.sessionTimeout = null;
            }
            
            // Update state
            this.currentUser = null;
            this.isAuthenticated = false;
            
            // Emit events
            this.eventBus.emit('auth:logout');
            
            this.toast.show('You have been logged out', 'info');
        }
    }

    /**
     * Verify token and refresh session
     */
    async verifyToken(token) {
        try {
            const response = await this.api.request('auth/verify', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.success && response.data.valid) {
                const { user } = response.data;
                
                // Update state
                this.currentUser = user;
                this.isAuthenticated = true;
                
                // Update store
                this.store.set('auth', {
                    token,
                    user,
                    isAuthenticated: true,
                    lastLogin: new Date().toISOString()
                });
                
                // Set session timeout
                const expiresAt = localStorage.getItem('session-expires');
                if (expiresAt) {
                    this.setSessionTimeout(expiresAt);
                }
                
                return true;
            } else {
                throw new Error('Invalid token');
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            this.logout();
            return false;
        }
    }

    /**
     * Mock Singpass integration
     */
    async signInWithSingpass() {
        try {
            // Simulate Singpass authentication
            const mockSingpassData = {
                name: 'John Doe',
                uin: 'S1234567A',
                email: 'john.doe@singpass.sg',
                phone: '+65 9123 4567'
            };
            
            // Show mock data in modal
            this.showSingpassModal(mockSingpassData);
            
            return { success: true, data: mockSingpassData };
        } catch (error) {
            console.error('Singpass authentication failed:', error);
            this.toast.show('Singpass authentication failed', 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * Show Singpass data modal
     */
    showSingpassModal(data) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal__backdrop"></div>
            <div class="modal__content">
                <div class="modal__header">
                    <h2 class="modal__title">Singpass Data Retrieved</h2>
                    <button class="modal__close" aria-label="Close modal">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="modal__body">
                    <div class="singpass-data">
                        <h3>Personal Information</h3>
                        <div class="data-grid">
                            <div class="data-item">
                                <label>Name:</label>
                                <span>${data.name}</span>
                            </div>
                            <div class="data-item">
                                <label>NRIC (Masked):</label>
                                <span>${data.uin}</span>
                            </div>
                            <div class="data-item">
                                <label>Email:</label>
                                <span>${data.email}</span>
                            </div>
                            <div class="data-item">
                                <label>Phone:</label>
                                <span>${data.phone}</span>
                            </div>
                        </div>
                        <p class="note">This is mock data for prototype purposes only.</p>
                    </div>
                </div>
                <div class="modal__footer">
                    <button class="btn btn--secondary" onclick="this.closest('.modal').remove()">Close</button>
                    <button class="btn btn--primary" onclick="this.useSingpassData()">Use This Data</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.modal__close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('.modal__backdrop').addEventListener('click', () => {
            modal.remove();
        });
        
        // Use data function
        window.useSingpassData = () => {
            this.useSingpassData(data);
            modal.remove();
        };
    }

    /**
     * Use Singpass data for registration
     */
    useSingpassData(data) {
        // Populate registration form with Singpass data
        const form = document.querySelector('#signup-form');
        if (form) {
            const nameField = form.querySelector('[name="name"]');
            const emailField = form.querySelector('[name="email"]');
            const phoneField = form.querySelector('[name="phone"]');
            
            if (nameField) nameField.value = data.name;
            if (emailField) emailField.value = data.email;
            if (phoneField) phoneField.value = data.phone;
            
            this.toast.show('Singpass data populated successfully', 'success');
        }
    }

    /**
     * Set session timeout
     */
    setSessionTimeout(expiresAt) {
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
        }
        
        const expires = new Date(expiresAt);
        const now = new Date();
        const timeUntilExpiry = expires.getTime() - now.getTime();
        
        if (timeUntilExpiry > 0) {
            this.sessionTimeout = setTimeout(() => {
                this.toast.show('Your session has expired. Please log in again.', 'warning');
                this.logout();
            }, timeUntilExpiry);
        }
    }

    /**
     * Handle storage changes (multi-tab sync)
     */
    handleStorageChange(event) {
        if (event.key === 'auth-token' && !event.newValue) {
            // Token was removed in another tab
            this.logout();
        }
    }

    /**
     * Handle visibility changes
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden, could implement session pause logic here
        } else {
            // Page is visible, check session validity
            const token = localStorage.getItem('auth-token');
            if (token && this.isAuthenticated) {
                this.verifyToken(token);
            }
        }
    }

    /**
     * Handle login event
     */
    handleLogin(user) {
        console.log('User logged in:', user);
        // Update UI elements that depend on authentication state
        this.updateAuthUI();
    }

    /**
     * Handle logout event
     */
    handleLogout() {
        console.log('User logged out');
        // Update UI elements that depend on authentication state
        this.updateAuthUI();
    }

    /**
     * Handle register event
     */
    handleRegister(user) {
        console.log('User registered:', user);
        // Update UI elements that depend on authentication state
        this.updateAuthUI();
    }

    /**
     * Update UI elements based on authentication state
     */
    updateAuthUI() {
        const authElements = document.querySelectorAll('[data-auth]');
        authElements.forEach(el => {
            const authState = el.dataset.auth;
            const isVisible = (authState === 'authenticated' && this.isAuthenticated) ||
                            (authState === 'anonymous' && !this.isAuthenticated);
            
            el.style.display = isVisible ? 'block' : 'none';
        });
        
        // Update user info in header
        const userInfo = document.querySelector('.user-info');
        if (userInfo) {
            if (this.isAuthenticated && this.currentUser) {
                userInfo.innerHTML = `
                    <span class="user-name">${this.currentUser.name}</span>
                    <span class="user-role">${this.currentUser.role}</span>
                `;
            } else {
                userInfo.innerHTML = '';
            }
        }
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is authenticated
     */
    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    /**
     * Check if user has specific role
     */
    hasRole(role) {
        return this.isAuthenticated && this.currentUser && this.currentUser.role === role;
    }

    /**
     * Check if user has any of the specified roles
     */
    hasAnyRole(roles) {
        return this.isAuthenticated && this.currentUser && roles.includes(this.currentUser.role);
    }

    /**
     * Get user's Rep-Link Success Score (RSS)
     */
    getRSS() {
        return this.currentUser?.rss || 0;
    }

    /**
     * Get user's ratings
     */
    getRatings() {
        return this.currentUser?.ratings || { average: 0, count: 0 };
    }
}

import { api } from '../data/api.js';
import { store } from '../data/store.js';
import { dashboardHrefFor } from '../app.js';

function q(id) { return document.getElementById(id) || document.querySelector(`#${id}, [name="${id}"]`); }

// Debug: Check if form exists when script loads
console.log('Auth script loaded');
setTimeout(() => {
    const form = document.getElementById('loginForm');
    const emailField = q('loginEmail');
    const passwordField = q('loginPassword');
    console.log('Form check:', { form, emailField, passwordField });
}, 100);

// Test login function for debugging
async function testLogin() {
    console.log('Test login function called');
    try {
        const user = await api.login('rep@replink.dev', 'RepLink#2025');
        console.log('Test login successful:', user);
        store.setAuth({ isAuthed: true, user, token: 'dev' });
        location.href = dashboardHrefFor(user);
    } catch (err) {
        console.error('Test login failed:', err);
        alert('Test login failed: ' + err.message);
    }
}

// Add event listener for test button
document.addEventListener('click', (e) => {
    if (e.target.id === 'testLoginBtn') {
        e.preventDefault();
        testLogin();
    }
});

document.addEventListener('submit', async (e) => {
    console.log('Form submit event triggered:', e.target);
    const form = e.target.closest('#loginForm');
    console.log('Found form:', form);
    
    if (!form) {
        console.log('No loginForm found, ignoring submit');
        return;
    }
    
    e.preventDefault();
    console.log('Prevented default form submission');

    const email = q('loginEmail')?.value?.trim() || '';
    const password = q('loginPassword')?.value || '';
    
    console.log('Form data:', { email, password: '***' });

    if (!email || password.length < 3) {
        console.log('Validation failed');
        showError(form, 'Enter a valid email and password.');
        return;
    }

    console.log('Starting login process...');
    setBusy(form, true);
    try {
        const user = await api.login(email, password);
        console.log('Login successful, user:', user);
        store.setAuth({ isAuthed: true, user, token: 'dev' });
        console.log('Redirecting to:', dashboardHrefFor(user));
        location.href = dashboardHrefFor(user);
    } catch (err) {
        console.error('[login]', err);
        showError(form, err.message || 'Login failed.');
    } finally {
        setBusy(form, false);
    }
});

function setBusy(form, busy) {
    const btn = form.querySelector('#btnLogin') || form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = !!busy; btn.textContent = busy ? 'Logging in…' : 'Log in'; }
}
function showError(form, msg) {
    let el = form.querySelector('.form-error');
    if (!el) { el = document.createElement('div'); el.className = 'form-error'; form.prepend(el); }
    el.textContent = msg;
}

// Quick-fill buttons for mock accounts
document.addEventListener('click', (e) => {
    console.log('Click event:', e.target);
    const btn = e.target.closest('[data-fill-login]');
    console.log('Fill button found:', btn);
    
    if (!btn) return;
    
    const email = btn.dataset.email;
    const pass = btn.dataset.pass;
    
    console.log('Quick-fill clicked:', { email, pass: '***' });
    
    const emailField = q('loginEmail');
    const passwordField = q('loginPassword');
    
    console.log('Fields found:', { emailField, passwordField });
    
    if (emailField) {
        emailField.value = email;
        console.log('Email field filled with:', email);
    } else {
        console.error('Email field not found');
    }
    
    if (passwordField) {
        passwordField.value = pass;
        console.log('Password field filled');
    } else {
        console.error('Password field not found');
    }
});
