// Archief view - read-only lijst met zoekfunctie

import * as Store from '../store.js';
import { escapeHtml, debounce } from '../utils.js';

let searchQuery = '';

/**
 * Initialiseer de archief view (event listeners).
 */
export function init() {
    const searchInput = document.getElementById('archive-search');
    if (searchInput) {
        const debouncedSearch = debounce((value) => {
            searchQuery = value.toLowerCase();
            render();
        }, 300);

        searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));
    }
}

/**
 * Render de archieflijst.
 */
export function render() {
    const items = Store.get('archief');
    const container = document.getElementById('archive-list');
    if (!container) return;

    // Filter op zoekterm
    let filtered = items;
    if (searchQuery) {
        filtered = items.filter(item => {
            const dish = (item[0] || '').toLowerCase();
            const note = (item[2] || '').toLowerCase();
            return dish.includes(searchQuery) || note.includes(searchQuery);
        });
    }

    // Sorteer op datum (nieuwste eerst)
    filtered.sort((a, b) => {
        const dateA = parseDateForSort(a[1]);
        const dateB = parseDateForSort(b[1]);
        return dateB - dateA;
    });

    container.innerHTML = '';

    if (filtered.length === 0) {
        const msg = searchQuery ? 'Geen resultaten gevonden' : 'Geen gearchiveerde gerechten';
        container.innerHTML = `<p class="empty-state">${msg}</p>`;
        return;
    }

    filtered.forEach(item => {
        const el = document.createElement('div');
        el.className = 'archive-item';

        let html = `<div class="archive-item__dish">${escapeHtml(item[0] || '')}</div>`;
        if (item[1]) {
            html += `<div class="archive-item__meta">${escapeHtml(item[1])}</div>`;
        }
        if (item[2]) {
            html += `<div class="archive-item__note">${escapeHtml(item[2])}</div>`;
        }

        el.innerHTML = html;
        container.appendChild(el);
    });
}

/**
 * Parse "dd-mm-yyyy" voor sortering.
 */
function parseDateForSort(str) {
    if (!str) return 0;
    const parts = str.split('-');
    if (parts.length !== 3) return 0;
    const [d, m, y] = parts.map(Number);
    return new Date(y, m - 1, d).getTime();
}
