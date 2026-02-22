// Rating popup component
// Toont een popup met drie emoji-knoppen voor het beoordelen van gerechten.

import { escapeHtml } from '../utils.js';

const RATINGS = [
    { emoji: '\u2764\uFE0F', label: 'Lekker' },
    { emoji: '\uD83D\uDE0A', label: 'Ok\u00E9' },
    { emoji: '\uD83D\uDC4B\uD83C\uDFFB', label: 'Niet meer' },
];

/**
 * Toon een rating popup.
 * @param {string} dishName - Naam van het gerecht
 * @param {string} [currentRating] - Huidige beoordeling (emoji) om te markeren
 * @returns {Promise<string|null>} - Gekozen rating emoji of null bij overslaan
 */
export function showRatingPopup(dishName, currentRating) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('modal-overlay');
        if (!overlay) { resolve(null); return; }

        const buttonsHTML = RATINGS.map(r => {
            const activeClass = currentRating === r.emoji ? ' rating-popup__btn--active' : '';
            return `
                <button class="rating-popup__btn${activeClass}" data-rating="${r.emoji}" type="button">
                    <span class="rating-popup__emoji">${r.emoji}</span>
                    <span class="rating-popup__text">${r.label}</span>
                </button>`;
        }).join('');

        overlay.innerHTML = `
            <div class="modal">
                <div class="modal__header">
                    <h3>${escapeHtml(dishName)}</h3>
                </div>
                <div class="modal__body">
                    <p class="rating-popup__label">Hoe was dit gerecht?</p>
                    <div class="rating-popup__options">
                        ${buttonsHTML}
                    </div>
                </div>
                <div class="modal__footer" style="justify-content: center;">
                    <button class="btn btn-ghost rating-popup__skip" type="button">Overslaan</button>
                </div>
            </div>
        `;

        overlay.classList.remove('hidden');

        // Emoji knoppen
        overlay.querySelectorAll('.rating-popup__btn').forEach(btn => {
            btn.addEventListener('click', () => {
                close();
                resolve(btn.dataset.rating);
            });
        });

        // Overslaan
        overlay.querySelector('.rating-popup__skip').addEventListener('click', () => {
            close();
            resolve(null);
        });

        // Backdrop klik
        function handleBackdrop(e) {
            if (e.target === overlay) {
                close();
                resolve(null);
            }
        }
        overlay.addEventListener('click', handleBackdrop);

        function close() {
            overlay.removeEventListener('click', handleBackdrop);
            overlay.classList.add('hidden');
            overlay.innerHTML = '';
        }
    });
}
