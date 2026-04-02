// src/utils/storageProxy.js
/**
 * Monkey-patches localStorage to provide role-based isolation of 'token' and 'user' keys.
 * This allows concurrent logins of different account types (admin, buyer, builder) 
 * in different tabs without overwriting each other.
 */

const originalGet = localStorage.getItem.bind(localStorage);
const originalSet = localStorage.setItem.bind(localStorage);
const originalRemove = localStorage.removeItem.bind(localStorage);

const resolveKey = (key) => {
    if (key === 'token' || key === 'user') {
        // Determine context based on sessionStorage (preferred for tab isolation)
        // or by current URL path as a fallback.
        let role = sessionStorage.getItem('activeRole');

        if (!role) {
            if (window.location.pathname.startsWith('/admin-dashboard')) {
                role = 'admin';
            } else if (window.location.pathname.startsWith('/builder-dashboard')) {
                role = 'builder';
            } else if (
                window.location.pathname.startsWith('/buyer-dashboard') ||
                window.location.pathname.startsWith('/buy') ||
                window.location.pathname.startsWith('/property') ||
                window.location.pathname.startsWith('/blog') ||
                window.location.pathname.startsWith('/contactUs') ||
                window.location.pathname.startsWith('/about')
            ) {
                role = 'buyer';
            }
        }

        if (role) return `${role}_${key}`;
    }
    return key;
};

localStorage.getItem = (key) => originalGet(resolveKey(key));
localStorage.setItem = (key, value) => originalSet(resolveKey(key), value);
localStorage.removeItem = (key) => originalRemove(resolveKey(key));
