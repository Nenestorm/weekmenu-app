// Weekplanning view - "Deze week" en "Volgende week"

import * as Store from '../store.js';
import * as SheetsAPI from '../sheets-api.js';
import { createDayCard } from '../components/day-card.js';
import {
    getMondayOfWeek, getWeekDates, getWeekNumber,
    formatDateSheet, formatDateShort, DAY_NAMES, DAY_NAMES_SHORT,
    todayStart, isSameDay,
} from '../utils.js';

/**
 * Render de weekplanning view.
 */
export function render() {
    const today = todayStart();
    const thisMonday = getMondayOfWeek(today);
    const nextMonday = new Date(thisMonday);
    nextMonday.setDate(nextMonday.getDate() + 7);

    const thisWeekDates = getWeekDates(thisMonday);
    const nextWeekDates = getWeekDates(nextMonday);

    const thisWeekNum = getWeekNumber(thisMonday);
    const nextWeekNum = getWeekNumber(nextMonday);

    // Week nummers tonen
    const cwn = document.getElementById('current-week-number');
    const nwn = document.getElementById('next-week-number');
    if (cwn) cwn.textContent = `(week ${thisWeekNum})`;
    if (nwn) nwn.textContent = `(week ${nextWeekNum})`;

    const allRows = Store.get('weekplanning');

    renderWeek('current-week-grid', thisWeekDates, allRows, today, 'Deze week');
    renderWeek('next-week-grid', nextWeekDates, allRows, today, 'Volgende week');
}

/**
 * Render een enkele week (7 dagkaarten).
 */
function renderWeek(containerId, dates, allRows, today, weekLabel) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    dates.forEach((date, dayIndex) => {
        const dateStr = formatDateSheet(date);
        const dateLabel = formatDateShort(date);
        const isToday = isSameDay(date, today);
        const isPast = date < today;

        // Zoek bestaande rij voor deze datum
        const rowIndex = allRows.findIndex(row => row[2] === dateStr);
        const existingRow = rowIndex >= 0 ? allRows[rowIndex] : null;
        const dish = existingRow ? (existingRow[3] || '') : '';
        const note = existingRow ? (existingRow[4] || '') : '';

        // Sheet rij nummer (1-based, +1 voor header)
        const sheetRowNum = rowIndex >= 0 ? rowIndex + 2 : null;

        const card = createDayCard({
            dayName: DAY_NAMES[dayIndex],
            dateLabel: dateLabel,
            dateStr: dateStr,
            dish: dish,
            note: note,
            isToday: isToday,
            isPast: isPast,
            onEdit: (field, value) => {
                handleEdit(dateStr, field, value, sheetRowNum, weekLabel, DAY_NAMES_SHORT[dayIndex], allRows);
            },
        });

        container.appendChild(card);
    });
}

/**
 * Verwerk een bewerking van een dag-kaart.
 */
async function handleEdit(dateStr, field, value, sheetRowNum, weekLabel, dayShort, allRows) {
    if (sheetRowNum) {
        // Rij bestaat: update de specifieke cel
        const col = field === 'dish' ? 'D' : 'E';
        const range = `'Weekplanning'!${col}${sheetRowNum}`;
        Store.markDirty(range, [[value]]);

        // Update ook de lokale cache
        const rowIndex = sheetRowNum - 2;
        if (allRows[rowIndex]) {
            if (field === 'dish') {
                allRows[rowIndex][3] = value;
            } else {
                allRows[rowIndex][4] = value;
            }
        }
    } else {
        // Rij bestaat nog niet: maak een nieuwe aan
        const newRow = [weekLabel, dayShort, dateStr, '', ''];
        if (field === 'dish') {
            newRow[3] = value;
        } else {
            newRow[4] = value;
        }

        try {
            await SheetsAPI.appendRow('Weekplanning', newRow);
            // Herlaad data om correcte rij-indices te krijgen
            await Store.loadAll();
            // Re-render om de nieuwe rij-index te gebruiken
            render();
        } catch (err) {
            console.error('Failed to create new row:', err);
        }
    }
}
