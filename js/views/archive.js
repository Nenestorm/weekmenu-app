// Archief view - lijst met zoekfunctie, beoordeling en verwijderknop

import * as Store from '../store.js';
import * as SheetsAPI from '../sheets-api.js';
import { showModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { showRatingPopup } from '../components/rating-popup.js';
import { updateRatingForDish } from '../services/rating.js';
import { escapeHtml, debounce } from '../utils.js';

let searchQuery = '';
let ratingFilter = null; // null = alles, 'none' = geen beoordeling, of emoji string

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

    // Rating filter knoppen
    const filterContainer = document.getElementById('archive-rating-filter');
    if (filterContainer) {
        filterContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.rating-filter__btn');
            if (!btn) return;

            // Active state bijwerken
            filterContainer.querySelectorAll('.rating-filter__btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            ratingFilter = filter === 'all' ? null : filter;
            render();
        });
    }
}

/**
 * Render de archieflijst.
 */
export function render() {
    const items = Store.get('archief');
    const container = document.getElementById('archive-list');
    if (!container) return;

    // Maak een array met originele index (voor rijnummer in sheet)
    let indexed = items.map((item, i) => ({ item, originalIndex: i }));

    // Filter op zoekterm
    if (searchQuery) {
        indexed = indexed.filter(({ item }) => {
            const dish = (item[0] || '').toLowerCase();
            const note = (item[2] || '').toLowerCase();
            return dish.includes(searchQuery) || note.includes(searchQuery);
        });
    }

    // Filter op beoordeling
    if (ratingFilter) {
        if (ratingFilter === 'none') {
            indexed = indexed.filter(({ item }) => !item[3]);
        } else {
            indexed = indexed.filter(({ item }) => item[3] === ratingFilter);
        }
    }

    // Sorteer op datum (nieuwste eerst)
    indexed.sort((a, b) => {
        const dateA = parseDateForSort(a.item[1]);
        const dateB = parseDateForSort(b.item[1]);
        return dateB - dateA;
    });

    container.innerHTML = '';

    if (indexed.length === 0) {
        const msg = (searchQuery || ratingFilter) ? 'Geen resultaten gevonden' : 'Geen gearchiveerde gerechten';
        container.innerHTML = `<p class="empty-state">${msg}</p>`;
        return;
    }

    indexed.forEach(({ item, originalIndex }) => {
        const el = document.createElement('div');
        el.className = 'archive-item';

        const sheetRowNum = originalIndex + 2; // 1-based + header
        const rating = item[3] || '';

        let html = `
            <div class="archive-item__content">
                <div class="archive-item__dish">${escapeHtml(item[0] || '')}</div>`;
        if (item[1]) {
            html += `<div class="archive-item__meta">${escapeHtml(item[1])}</div>`;
        }
        if (item[2]) {
            html += `<div class="archive-item__note">${escapeHtml(item[2])}</div>`;
        }
        html += `</div>
            <div class="archive-item__rating" title="Beoordeling wijzigen">
                ${rating || '<span class="archive-item__rating--empty">+</span>'}
            </div>
            <div class="archive-item__actions">
                <button class="btn btn-icon btn-danger archive-item__delete" title="Verwijderen">
                    &#x2715;
                </button>
            </div>`;

        el.innerHTML = html;

        // Rating klik handler
        const ratingEl = el.querySelector('.archive-item__rating');
        ratingEl.addEventListener('click', async () => {
            const newRating = await showRatingPopup(item[0] || '', rating);
            if (newRating !== null) {
                try {
                    await updateRatingForDish(item[0], newRating);
                    render();
                    showToast('Beoordeling opgeslagen', 'success');
                } catch (err) {
                    console.error('Failed to update rating:', err);
                    showToast('Beoordeling opslaan mislukt', 'error');
                }
            }
        });

        // Verwijderknop handler
        const deleteBtn = el.querySelector('.archive-item__delete');
        deleteBtn.addEventListener('click', () => {
            confirmDelete(item[0], sheetRowNum);
        });

        container.appendChild(el);
    });
}

/**
 * Bevestig verwijdering van een archief-item.
 */
function confirmDelete(itemName, sheetRowNum) {
    showModal({
        title: 'Item verwijderen?',
        body: `<p>Weet je zeker dat je <strong>${itemName || 'dit item'}</strong> uit het archief wilt verwijderen?</p>`,
        confirmText: 'Verwijderen',
        danger: true,
        onConfirm: async () => {
            try {
                const sheetId = Store.getSheetId('Archief');
                await SheetsAPI.deleteRow(sheetId, sheetRowNum - 1);
                await Store.loadAll();
                render();
                showToast('Item verwijderd', 'success');
            } catch (err) {
                console.error('Failed to delete archive item:', err);
                showToast('Verwijderen mislukt', 'error');
            }
        },
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
