// Google OAuth 2.0 authenticatie module

let tokenClient = null;
let accessToken = null;
let refreshTimer = null;
let onAuthChanged = null;

/**
 * Initialiseer de authenticatie.
 * Wordt aangeroepen nadat zowel gapi als GIS geladen zijn.
 */
export function initAuth(callback) {
    onAuthChanged = callback;

    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CONFIG.CLIENT_ID,
        scope: CONFIG.SCOPES,
        callback: handleTokenResponse,
    });
}

/**
 * Start de login flow (opent Google consent scherm).
 */
export function login() {
    if (!tokenClient) return;
    tokenClient.requestAccessToken({ prompt: 'consent' });
}

/**
 * Log uit en wis de token.
 */
export function logout() {
    if (accessToken) {
        google.accounts.oauth2.revoke(accessToken, () => {});
    }
    accessToken = null;
    clearTimeout(refreshTimer);
    if (onAuthChanged) {
        onAuthChanged(false);
    }
}

/**
 * Geeft true als er een geldige access token is.
 */
export function isAuthenticated() {
    return accessToken !== null;
}

/**
 * Probeer de token te vernieuwen (stilletjes, zonder consent scherm).
 */
export function refreshToken() {
    if (!tokenClient) return;
    tokenClient.requestAccessToken({ prompt: '' });
}

/**
 * Handler voor token response van Google.
 */
function handleTokenResponse(response) {
    if (response.error) {
        console.error('Auth error:', response.error);
        if (onAuthChanged) {
            onAuthChanged(false);
        }
        return;
    }

    accessToken = response.access_token;

    // Plan token refresh 5 minuten voor expiry
    const expiresInMs = (response.expires_in - 300) * 1000;
    clearTimeout(refreshTimer);
    if (expiresInMs > 0) {
        refreshTimer = setTimeout(() => {
            refreshToken();
        }, expiresInMs);
    }

    if (onAuthChanged) {
        onAuthChanged(true);
    }
}
