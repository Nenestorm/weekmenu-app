// Auto-archivering service
// Verplaatst verlopen dagen van Weekplanning naar Archief

import * as Store from '../store.js';
import * as SheetsAPI from '../sheets-api.js';
import { showToast } from '../components/toast.js';
import { parseDate, todayStart } from '../utils.js';

/**
 * Draai de auto-archivering.
 * Wordt eenmalig bij app startup aangeroepen.
 *
 * Logica:
 * 1. Zoek rijen in Weekplanning waar datum < vandaag EN er een gerecht is
 * 2. Append die gerechten naar het Archief
 * 3. Verwijder de rijen uit Weekplanning (van onder naar boven)
 * 4. Herlaad alle data
 */
export async function runArchiver() {
    const allRows = Store.get('weekplanning');
    const today = todayStart();

    // Vind rijen die gearchiveerd moeten worden
    const toArchive = [];
    const toDelete = []; // 0-based sheet rij indices

    allRows.forEach((row, index) => {
        const dateStr = row[2]; // Datum kolom
        const dish = row[3];    // Gerecht kolom

        if (!dateStr || !dish || !dish.trim()) return; // Sla lege rijen over

        const rowDate = parseDate(dateStr);
        if (!rowDate) return;

        if (rowDate < today) {
            toArchive.push({
                gerecht: dish,
                datumGegeten: dateStr,
                bereidingsnotitie: row[4] || '',
            });
            // Sheet rij index: data-index + 1 (header rij)
            toDelete.push(index + 1);
        }
    });

    if (toArchive.length === 0) return;

    try {
        // Stap 1: Voeg toe aan Archief (VOOR verwijderen = data-veiligheid)
        const archiveRows = toArchive.map(item => [
            item.gerecht,
            item.datumGegeten,
            item.bereidingsnotitie,
        ]);
        await SheetsAPI.appendRows('Archief', archiveRows);

        // Stap 2: Verwijder uit Weekplanning (van onder naar boven)
        const wpSheetId = Store.getSheetId('Weekplanning');
        await SheetsAPI.deleteRows(wpSheetId, toDelete);

        // Stap 3: Herlaad data
        await Store.loadAll();

        // Meld aan gebruiker
        const count = toArchive.length;
        showToast(
            `${count} ${count === 1 ? 'gerecht' : 'gerechten'} gearchiveerd`,
            'info'
        );
    } catch (err) {
        console.error('Archiver failed:', err);
        showToast('Archivering mislukt', 'error');
    }
}
