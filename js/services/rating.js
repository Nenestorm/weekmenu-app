// Rating service: beoordelingen opslaan en ophalen per gerecht

import * as Store from '../store.js';
import * as SheetsAPI from '../sheets-api.js';

/**
 * Update de beoordeling voor alle archiefrijen van een gerecht.
 * @param {string} dishName - Gerechtnaam
 * @param {string} rating - Emoji rating string
 */
export async function updateRatingForDish(dishName, rating) {
    const archief = Store.get('archief');
    const key = dishName.trim().toLowerCase();
    const updates = [];

    archief.forEach((row, index) => {
        const rowKey = (row[0] || '').trim().toLowerCase();
        if (rowKey === key) {
            const sheetRow = index + 2; // 1-based + header
            updates.push({
                range: `'Archief'!D${sheetRow}`,
                values: [[rating]],
            });
        }
    });

    if (updates.length > 0) {
        await SheetsAPI.batchUpdateValues(updates);
        await Store.loadAll();
    }
}

/**
 * Haal de rating op voor een gerecht (eerste niet-lege match).
 * @param {string} dishName - Gerechtnaam
 * @returns {string|null} - Rating emoji of null
 */
export function getRatingForDish(dishName) {
    const archief = Store.get('archief');
    const key = dishName.trim().toLowerCase();

    for (const row of archief) {
        const rowKey = (row[0] || '').trim().toLowerCase();
        if (rowKey === key && row[3]) {
            return row[3];
        }
    }
    return null;
}
