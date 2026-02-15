// Suggestie-service: analyseert het archief en retourneert populaire gerechten

import * as Store from '../store.js';

/**
 * Haal de meest gegeten gerechten op, gesorteerd op frequentie.
 * @param {number} limit - Maximaal aantal suggesties (standaard 20)
 * @returns {Array<{displayName: string, count: number}>}
 */
export function getTopMeals(limit = 20) {
    const archief = Store.get('archief');
    const freq = new Map(); // genormaliseerde naam -> { displayName, count }

    for (const row of archief) {
        const raw = (row[0] || '').trim();
        if (!raw) continue;

        const key = raw.toLowerCase();

        if (freq.has(key)) {
            freq.get(key).count++;
        } else {
            freq.set(key, {
                displayName: raw,
                count: 1,
            });
        }
    }

    // Sorteer op frequentie (aflopend), dan alfabetisch
    return [...freq.values()]
        .sort((a, b) => b.count - a.count || a.displayName.localeCompare(b.displayName, 'nl'))
        .slice(0, limit);
}

/**
 * Filter suggesties op basis van een zoekterm.
 * @param {string} query - Zoekterm
 * @param {number} limit - Maximaal aantal resultaten
 * @returns {Array<{displayName: string, count: number}>}
 */
export function searchMeals(query, limit = 20) {
    const all = getTopMeals(100);
    if (!query || !query.trim()) return all.slice(0, limit);

    const q = query.toLowerCase().trim();
    return all
        .filter(m => m.displayName.toLowerCase().includes(q))
        .slice(0, limit);
}
