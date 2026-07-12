(function(window) {
    'use strict';

    const AUTH_PROFILE_KEYS = ['isLoggedIn', 'userName', 'userEmail'];
    const SUPABASE_PROJECT_REFS = [
        'hfliuepqksujzfigdbil',
        'biyyiobvozlgmuphsrph'
    ];
    const ADMIN_EMAILS = ['admin@doczone.com'];

    function normalizeEmail(email) {
        return (email || '').trim().toLowerCase();
    }

    function isAdminEmail(email) {
        return ADMIN_EMAILS.includes(normalizeEmail(email));
    }

    function readStoredProfile() {
        return {
            isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
            userName: localStorage.getItem('userName') || '',
            userEmail: localStorage.getItem('userEmail') || ''
        };
    }

    function syncAdminState(profile) {
        const nextProfile = profile || readStoredProfile();
        const isAdmin = Boolean(nextProfile.isLoggedIn && isAdminEmail(nextProfile.userEmail));

        if (isAdmin) {
            sessionStorage.setItem('isAdmin', 'true');
        } else {
            sessionStorage.removeItem('isAdmin');
        }

        return isAdmin;
    }

    function writeStoredProfile(profile) {
        const nextProfile = {
            isLoggedIn: Boolean(profile && profile.isLoggedIn),
            userName: profile && profile.userName ? String(profile.userName) : '',
            userEmail: profile && profile.userEmail ? String(profile.userEmail) : ''
        };

        localStorage.setItem('isLoggedIn', nextProfile.isLoggedIn ? 'true' : 'false');
        localStorage.setItem('userName', nextProfile.userName);
        localStorage.setItem('userEmail', nextProfile.userEmail);
        syncAdminState(nextProfile);

        return nextProfile;
    }

    function removeKnownAuthTokens(storageBucket) {
        const keysToRemove = [];
        const keyPrefixes = SUPABASE_PROJECT_REFS.map(function(projectRef) {
            return 'sb-' + projectRef + '-auth-token';
        });

        for (let index = 0; index < storageBucket.length; index++) {
            const storageKey = storageBucket.key(index);
            if (!storageKey) continue;
            if (storageKey === 'supabase.auth.token') {
                keysToRemove.push(storageKey);
                continue;
            }
            if (keyPrefixes.some(function(prefix) { return storageKey.indexOf(prefix) === 0; })) {
                keysToRemove.push(storageKey);
            }
        }

        keysToRemove.forEach(function(storageKey) {
            storageBucket.removeItem(storageKey);
        });
    }

    function clearAuthProfile() {
        AUTH_PROFILE_KEYS.forEach(function(key) {
            localStorage.removeItem(key);
        });
        sessionStorage.removeItem('isAdmin');
        removeKnownAuthTokens(localStorage);
        removeKnownAuthTokens(sessionStorage);
    }

    function applyAuthProfile(profile) {
        const nextProfile = writeStoredProfile(profile);
        return {
            profile: nextProfile,
            isAdmin: syncAdminState(nextProfile)
        };
    }

    function ensureAdminFromStoredProfile() {
        return syncAdminState(readStoredProfile());
    }

    window.AuthUtils = {
        readStoredProfile: readStoredProfile,
        writeStoredProfile: writeStoredProfile,
        applyAuthProfile: applyAuthProfile,
        clearAuthProfile: clearAuthProfile,
        syncAdminState: syncAdminState,
        ensureAdminFromStoredProfile: ensureAdminFromStoredProfile,
        isAdminEmail: isAdminEmail,
        normalizeEmail: normalizeEmail
    };
})(window);