// Weekmenu App - Hoofdmodule
// Bootstrapt de app: laadt Google libraries, auth, data en views.

import * as Auth from './auth.js';
import * as Store from './store.js';
import * as Router from './router.js';
import * as WeekplanningView from './views/weekplanning.js';
import * as FreezerView from './views/freezer.js';
import * as ArchiveView from './views/archive.js';
import { runArchiver } from './services/archiver.js';
import { showToast } from './components/toast.js';

// ========== State ==========
let gapiLoaded = false;
let gisLoaded = false;

// ========== DOM Elementen ==========
const loginScreen = document.getElementById('login-screen');
const appShell = document.getElementById('app-shell');
const loginBtn = document.getElementById('btn-login');
const logoutBtn = document.getElementById('btn-logout');
const loginStatus = document.getElementById('login-status');
const saveIndicator = document.getElementById('save-indicator');
const userName = document.getElementById('user-name');

// ========== Google Libraries Laden ==========

// gapi laden (Sheets API client)
function onGapiLoad() {
    gapi.load('client', async () => {
        try {
            await gapi.client.init({
                apiKey: CONFIG.API_KEY,
                discoveryDocs: [CONFIG.DISCOVERY_DOC],
            });
            gapiLoaded = true;
            maybeEnableLogin();
        } catch (err) {
            console.error('gapi init failed:', err);
            if (loginStatus) loginStatus.textContent = 'Fout bij laden Google API';
        }
    });
}

// Google Identity Services laden
function onGisLoad() {
    gisLoaded = true;
    maybeEnableLogin();
}

// Beide geladen? Dan login inschakelen.
function maybeEnableLogin() {
    if (gapiLoaded && gisLoaded) {
        Auth.initAuth(onAuthChanged);
        if (loginBtn) {
            loginBtn.disabled = false;
            if (loginStatus) loginStatus.textContent = '';
        }
    }
}

// ========== Authenticatie ==========

loginBtn?.addEventListener('click', () => {
    Auth.login();
});

logoutBtn?.addEventListener('click', () => {
    Auth.logout();
});

/**
 * Wordt aangeroepen wanneer de auth status verandert.
 */
async function onAuthChanged(authenticated) {
    if (authenticated) {
        showApp();
        await loadData();
    } else {
        showLogin();
    }
}

function showLogin() {
    if (loginScreen) {
        loginScreen.style.display = 'flex';
        loginScreen.classList.add('active');
    }
    if (appShell) {
        appShell.style.display = 'none';
        appShell.classList.remove('active');
    }
}

function showApp() {
    if (loginScreen) {
        loginScreen.style.display = 'none';
        loginScreen.classList.remove('active');
    }
    if (appShell) {
        appShell.style.display = 'block';
        appShell.classList.add('active');
    }
}

// ========== Data Laden ==========

async function loadData() {
    try {
        if (loginStatus) loginStatus.textContent = 'Data laden...';
        showToast('Data laden...', 'info', 2000);

        await Store.loadAll();

        // Auto-archivering draaien
        await runArchiver();

        // Views initialiseren
        FreezerView.init();
        ArchiveView.init();

        // Router initialiseren
        Router.init(onTabChange);

        // Render de huidige view
        renderCurrentView();

        // Save status indicator
        Store.onSaveStatus((status) => {
            if (!saveIndicator) return;
            saveIndicator.className = 'save-indicator';
            switch (status) {
                case 'saving':
                    saveIndicator.textContent = 'Opslaan...';
                    saveIndicator.classList.add('saving');
                    break;
                case 'saved':
                    saveIndicator.textContent = 'Opgeslagen';
                    saveIndicator.classList.add('saved');
                    break;
                case 'error':
                    saveIndicator.textContent = 'Fout bij opslaan';
                    saveIndicator.classList.add('saving');
                    break;
                case 'idle':
                    saveIndicator.textContent = '';
                    break;
            }
        });

    } catch (err) {
        console.error('Failed to load data:', err);
        showToast('Data laden mislukt - controleer je config.js', 'error', 5000);
    }
}

// ========== Tab Navigatie ==========

function onTabChange(tab) {
    renderCurrentView();
}

function renderCurrentView() {
    const tab = Router.getCurrentTab();
    switch (tab) {
        case 'weekplanning':
            WeekplanningView.render();
            break;
        case 'freezer':
            FreezerView.render();
            break;
        case 'archive':
            ArchiveView.render();
            break;
    }
}

// ========== Initialisatie ==========

// Wacht op de Google libraries
// De scripts in index.html zijn async, dus we moeten wachten
function waitForLibraries() {
    // Check of gapi al beschikbaar is
    if (typeof gapi !== 'undefined') {
        onGapiLoad();
    } else {
        // Poll elke 100ms
        const gapiTimer = setInterval(() => {
            if (typeof gapi !== 'undefined') {
                clearInterval(gapiTimer);
                onGapiLoad();
            }
        }, 100);
        // Timeout na 10 seconden
        setTimeout(() => {
            clearInterval(gapiTimer);
            if (!gapiLoaded) {
                if (loginStatus) loginStatus.textContent = 'Google API kon niet geladen worden';
            }
        }, 10000);
    }

    // Check of Google Identity Services al beschikbaar is
    if (typeof google !== 'undefined' && google.accounts) {
        onGisLoad();
    } else {
        const gisTimer = setInterval(() => {
            if (typeof google !== 'undefined' && google.accounts) {
                clearInterval(gisTimer);
                onGisLoad();
            }
        }, 100);
        setTimeout(() => {
            clearInterval(gisTimer);
            if (!gisLoaded) {
                if (loginStatus) loginStatus.textContent = 'Google Login kon niet geladen worden';
            }
        }, 10000);
    }
}

// Start!
waitForLibraries();
