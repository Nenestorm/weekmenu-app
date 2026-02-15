// Meal picker bottom sheet component

import { getTopMeals, searchMeals } from '../services/suggester.js';
import { escapeHtml } from '../utils.js';

/**
 * Toon de meal picker bottom sheet.
 * @param {Function} onSelect - Callback(mealName) wanneer een gerecht wordt gekozen
 */
export function showMealPicker(onSelect) {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return;

    const meals = getTopMeals(30);

    overlay.innerHTML = buildSheetHTML(meals);
    overlay.classList.remove('hidden');
    overlay.style.alignItems = 'flex-end';

    const sheet = overlay.querySelector('.meal-picker');
    const searchInput = overlay.querySelector('.meal-picker__search');
    const listContainer = overlay.querySelector('.meal-picker__list');
    const emptyEl = overlay.querySelector('.meal-picker__empty');

    // Slide-up animatie
    requestAnimationFrame(() => {
        sheet.classList.add('meal-picker--visible');
    });

    // Zoek-filtering
    searchInput.addEventListener('input', (e) => {
        const filtered = searchMeals(e.target.value, 30);
        renderList(listContainer, emptyEl, filtered, selectAndClose);
    });

    // Item selectie
    function selectAndClose(name) {
        onSelect(name);
        closePicker();
    }

    // Klik-handlers voor initiële lijst
    attachItemHandlers(listContainer, selectAndClose);

    // Sluit bij klik op achtergrond
    overlay.addEventListener('click', handleBackdropClick);

    // Focus zoekbalk (kleine vertraging voor iOS)
    setTimeout(() => searchInput.focus(), 100);

    function handleBackdropClick(e) {
        if (e.target === overlay) {
            closePicker();
        }
    }

    function closePicker() {
        sheet.classList.remove('meal-picker--visible');
        overlay.removeEventListener('click', handleBackdropClick);
        setTimeout(() => {
            overlay.classList.add('hidden');
            overlay.innerHTML = '';
            overlay.style.alignItems = '';
        }, 250);
    }
}

function buildSheetHTML(meals) {
    const hasItems = meals.length > 0;

    return `
        <div class="meal-picker">
            <div class="meal-picker__handle"></div>
            <div class="meal-picker__header">
                <h3>Favoriete gerechten</h3>
                <input type="search"
                       class="meal-picker__search input"
                       placeholder="Zoek gerecht..."
                       autocomplete="off">
            </div>
            <div class="meal-picker__list">${hasItems ? buildItemsHTML(meals) : ''}</div>
            <div class="meal-picker__empty" ${hasItems ? 'style="display:none"' : ''}>
                Nog geen gerechten in je archief.<br>
                Na het eten worden maaltijden hier automatisch opgeslagen.
            </div>
        </div>
    `;
}

function buildItemsHTML(meals) {
    return meals.map(m => `
        <button class="meal-picker__item" type="button" data-name="${escapeHtml(m.displayName)}">
            <span class="meal-picker__item-name">${escapeHtml(m.displayName)}</span>
            <span class="badge badge--muted">${m.count}x</span>
        </button>
    `).join('');
}

function renderList(container, emptyEl, meals, onSelect) {
    if (meals.length === 0) {
        container.innerHTML = '';
        emptyEl.textContent = 'Geen gerechten gevonden';
        emptyEl.style.display = '';
        return;
    }
    emptyEl.style.display = 'none';
    container.innerHTML = buildItemsHTML(meals);
    attachItemHandlers(container, onSelect);
}

function attachItemHandlers(container, onSelect) {
    container.querySelectorAll('.meal-picker__item').forEach(btn => {
        btn.addEventListener('click', () => {
            onSelect(btn.dataset.name);
        });
    });
}
