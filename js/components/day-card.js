// Dag-kaart component voor weekplanning

import { escapeHtml, debounce } from '../utils.js';
import { showMealPicker } from './meal-picker.js';

/**
 * Maak een dag-kaart element.
 * @param {Object} config
 * @param {string} config.dayName - Naam van de dag ("Maandag", etc.)
 * @param {string} config.dateLabel - Datum label ("3 feb")
 * @param {string} config.dateStr - Datum string voor sheets ("03-02-2026")
 * @param {string} config.dish - Huidige gerechtnaam
 * @param {string} config.note - Huidige bereidingsnotitie
 * @param {boolean} config.isToday - Is het vandaag?
 * @param {boolean} config.isPast - Is de datum verstreken?
 * @param {Function} config.onEdit - Callback(field, value) bij wijziging
 * @returns {HTMLElement}
 */
export function createDayCard(config) {
    const card = document.createElement('div');
    const classes = ['day-card'];
    if (config.isToday) classes.push('day-card--today');
    if (config.isPast) classes.push('day-card--past');
    card.className = classes.join(' ');

    card.innerHTML = `
        <div class="day-card__header">
            <span class="day-card__name">${escapeHtml(config.dayName)}</span>
            <span class="day-card__date">${escapeHtml(config.dateLabel)}</span>
        </div>
        <div class="day-card__body">
            <div class="day-card__dish-row">
                <input type="text"
                       class="day-card__dish editable-input"
                       placeholder="Wat eten we?"
                       value="${escapeHtml(config.dish)}"
                       data-field="dish"
                       autocomplete="off">
                <button class="day-card__fav-btn" type="button" title="Favorieten" aria-label="Kies uit favorieten">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="8" cy="8" r="6.5"/>
                        <polyline points="8,4 8,8 11,10"/>
                    </svg>
                </button>
            </div>
            <input type="text"
                   class="day-card__note editable-input"
                   placeholder="Bereidingsnotitie..."
                   value="${escapeHtml(config.note)}"
                   data-field="note"
                   autocomplete="off">
        </div>
    `;

    // Debounced save handlers
    if (config.onEdit) {
        const debouncedDish = debounce((value) => {
            config.onEdit('dish', value);
        }, 1500);

        const debouncedNote = debounce((value) => {
            config.onEdit('note', value);
        }, 1500);

        const dishInput = card.querySelector('.day-card__dish');
        const noteInput = card.querySelector('.day-card__note');

        dishInput.addEventListener('input', (e) => debouncedDish(e.target.value));
        noteInput.addEventListener('input', (e) => debouncedNote(e.target.value));

        // Favorieten knop handler
        const favBtn = card.querySelector('.day-card__fav-btn');
        favBtn.addEventListener('click', () => {
            showMealPicker((mealName) => {
                dishInput.value = mealName;
                config.onEdit('dish', mealName);
            });
        });
    }

    return card;
}
