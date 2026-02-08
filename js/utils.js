// Datumhelpers, debounce en Nederlandse locale utilities

export const DAY_NAMES = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];
export const DAY_NAMES_SHORT = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

/**
 * Geeft de maandag van de week waarin de gegeven datum valt.
 */
export function getMondayOfWeek(date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay(); // 0 = zondag, 1 = maandag, ...
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d;
}

/**
 * Geeft een array van 7 datums (Ma-Zo) vanaf een maandag.
 */
export function getWeekDates(monday) {
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(d.getDate() + i);
        return d;
    });
}

/**
 * Format datum als "dd-mm-yyyy" (voor opslag in Google Sheets).
 */
export function formatDateSheet(date) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
}

/**
 * Format datum als "3 feb" (kort formaat voor UI).
 */
export function formatDateShort(date) {
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}

/**
 * Parse "dd-mm-yyyy" string naar Date object.
 */
export function parseDate(str) {
    if (!str) return null;
    const parts = str.split('-');
    if (parts.length !== 3) return null;
    const [d, m, y] = parts.map(Number);
    return new Date(y, m - 1, d);
}

/**
 * Geeft het ISO weeknummer.
 */
export function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Geeft de start van vandaag (middernacht) als Date.
 */
export function todayStart() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * Check of twee datums dezelfde dag zijn.
 */
export function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
}

/**
 * Debounce functie.
 */
export function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Escape HTML om XSS te voorkomen.
 */
export function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}
