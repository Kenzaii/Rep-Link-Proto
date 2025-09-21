/**
 * Authentication Guards
 * Route protection and role-based access control
 */

import { store } from '../data/store.js';

export function guard(role) {
    const a = store.get('auth');
    if (!a?.isAuthed) {
        location.href = '/pages/login.html';
        return false;
    }
    if (role && a.user?.role !== role) {
        location.href = a.user?.role === 'business' 
            ? '/pages/business-dashboard.html' 
            : '/pages/rep-dashboard.html';
        return false;
    }
    return true;
}

export function requireAuth() {
    return guard();
}

export function requireRep() {
    return guard('rep');
}

export function requireBusiness() {
    return guard('business');
}
