// Simpele hash-based tab router

let currentTab = 'weekplanning';
let onTabChange = null;

/**
 * Initialiseer de router.
 * @param {Function} callback - Callback(tabName) bij tab-wissel
 */
export function init(callback) {
    onTabChange = callback;

    // Tab knoppen
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            navigateTo(btn.dataset.tab);
        });
    });

    // Browser back/forward
    window.addEventListener('hashchange', () => {
        const tab = location.hash.slice(1) || 'weekplanning';
        navigateTo(tab, false);
    });

    // Initieel route
    const initial = location.hash.slice(1) || 'weekplanning';
    navigateTo(initial, false);
}

/**
 * Navigeer naar een tab.
 * @param {string} tab - Tab naam ('weekplanning', 'freezer', 'archive')
 * @param {boolean} updateHash - Update de URL hash?
 */
export function navigateTo(tab, updateHash = true) {
    // Verberg alle views
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
    });

    // Toon target view
    const target = document.getElementById(`view-${tab}`);
    if (target) {
        target.classList.add('active');
    }

    // Update tab knop styling
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // Update hash
    if (updateHash) {
        location.hash = tab;
    }

    currentTab = tab;

    // Trigger callback voor view-specifieke acties
    if (onTabChange) {
        onTabChange(tab);
    }
}

/**
 * Geeft de huidige tab naam.
 */
export function getCurrentTab() {
    return currentTab;
}
