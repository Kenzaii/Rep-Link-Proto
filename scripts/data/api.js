/**
 * API
 * Resilient API layer with fallback users for prototype
 */

'use strict';

function rootPrefix() {
    // If we're on /pages/*.html, root is everything before "/pages/"
    const p = location.pathname;
    const i = p.indexOf('/pages/');
    return i >= 0 ? p.slice(0, i) : '';
}

async function getJSONWithFallback(paths) {
    for (const url of paths) {
        try {
            const r = await fetch(url, { cache: 'no-store' });
            if (r.ok) return await r.json();
        } catch (_) { /* try next */ }
    }
    throw new Error('all-paths-failed');
}

// Fallback users — works even without /mock/users.json (prototype only)
const FALLBACK_USERS = [
    {
        id: 'u-rep-001',
        name: 'Demo Rep',
        email: 'rep@replink.dev',
        role: 'rep',
        avatar: '/assets/img/rep1.svg',
        phone: '+65 9123 4567',
        nric: 'S1234567A',
        address: '123 Main Street, Singapore 123456',
        bio: 'Experienced sales representative with 5+ years in B2B sales',
        singpassLinked: true,
        createdAt: '2024-01-15T08:00:00.000Z'
    },
    {
        id: 'u-biz-001',
        name: 'Demo Business',
        email: 'business@replink.dev',
        role: 'business',
        avatar: '/assets/img/rep2.svg',
        company: 'Rep-Link Demo Co.',
        phone: '+65 9876 5432',
        address: '456 Business Ave, Singapore 654321',
        bio: 'Business owner with 10+ years in technology sector',
        singpassLinked: true,
        createdAt: '2024-01-10T09:00:00.000Z'
    }
];

export const api = {
    async getUsers() {
        const root = rootPrefix();
        const candidates = [
            `${root}/mock/users.json`,   // absolute from site root
            `/mock/users.json`,          // hard absolute (when root is '/')
            `../mock/users.json`,        // relative if inside /pages/
            `./mock/users.json`          // same dir (last resort)
        ];
        try {
            return await getJSONWithFallback(candidates);
        } catch (e) {
            // Use fallback list when JSON not reachable
            console.warn('[api] Using FALLBACK_USERS (mock)', e);
            // include passwords only in-memory to keep JSON clean
            return FALLBACK_USERS.map(u => ({
                ...u,
                // assign prototype password here
                __pw: 'RepLink#2025'
            }));
        }
    },

    async login(email, password) {
        const users = await this.getUsers();
        const em = String(email || '').trim().toLowerCase();
        const pw = String(password || '');

        const u = users.find(x => String(x.email).toLowerCase() === em);
        // support both JSON file with "password" field or fallback "__pw"
        const expected = u?.password ?? u?.__pw;

        // Tiny UX delay
        await new Promise(r => setTimeout(r, 200));

        if (!u) throw new Error('No such user');
        if (String(expected) !== pw) throw new Error('Incorrect password');

        // return safe user object
        const { password: _pw, __pw: _p2, ...safe } = u;
        return safe;
    }
};