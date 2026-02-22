// Vriezer item rij component

import { escapeHtml, debounce } from '../utils.js';

/**
 * Maak een vriezer-item rij element.
 * @param {Object} config
 * @param {string} config.name - Item naam
 * @param {string} config.dateAdded - Datum toegevoegd
 * @param {Function} config.onEditName - Callback(value) bij naam wijziging
 * @param {Function} config.onDelete - Callback bij verwijderen
 * @returns {HTMLElement}
 */
export function createFreezerItem(config) {
    const item = document.createElement('div');
    item.className = 'freezer-item';

    item.innerHTML = `
        <div class="freezer-item__info">
            <input type="text"
                   class="freezer-item__name editable-input"
                   value="${escapeHtml(config.name)}"
                   autocomplete="off">
            <div class="freezer-item__meta">${escapeHtml(config.dateAdded || '')}</div>
        </div>
        <div class="freezer-item__actions">
            <button class="btn btn-icon btn-danger freezer-item__delete" title="Verwijderen">
                &#x2715;
            </button>
        </div>
    `;

    // Event handlers
    const nameInput = item.querySelector('.freezer-item__name');
    const deleteBtn = item.querySelector('.freezer-item__delete');

    if (config.onEditName) {
        const debouncedName = debounce((value) => config.onEditName(value), 1500);
        nameInput.addEventListener('input', (e) => debouncedName(e.target.value));
    }

    if (config.onDelete) {
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            config.onDelete();
        });
    }

    return item;
}
