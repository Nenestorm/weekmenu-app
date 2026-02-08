// In-memory data store met debounced auto-save naar Google Sheets

import * as SheetsAPI from './sheets-api.js';
import { showToast } from './components/toast.js';

// Sheet namen -> keys mapping
const SHEET_KEYS = {
    'Weekplanning': 'weekplanning',
    'Voorraad Vriezer': 'voorraadVriezer',
    'Restjes Vriezer': 'restjesVriezer',
    'Archief': 'archief',
    'Receptendatabase': 'receptendatabase',
    'Kookboeken': 'kookboeken',
};

const KEYS_TO_SHEETS = Object.fromEntries(
    Object.entries(SHEET_KEYS).map(([k, v]) => [v, k])
);

// Interne state
const data = {
    weekplanning: [],
    voorraadVriezer: [],
    restjesVriezer: [],
    archief: [],
    receptendatabase: [],
    kookboeken: [],
};

let sheetIds = {};
let dirty = new Map(); // range -> values
let saveTimer = null;
let saving = false;
let onSaveStatusChange = null;

/**
 * Stel een callback in voor save-status veranderingen.
 * callback('saving') | callback('saved') | callback('error') | callback('idle')
 */
export function onSaveStatus(callback) {
    onSaveStatusChange = callback;
}

/**
 * Laad alle data uit Google Sheets.
 */
export async function loadAll() {
    // Haal sheet metadata op (voor numerieke sheetIds)
    sheetIds = await SheetsAPI.getSheetMetadata();

    // Haal alle 6 sheets parallel op
    const [wp, vv, rv, ar, rd, kb] = await Promise.all([
        SheetsAPI.getSheetData('Weekplanning'),
        SheetsAPI.getSheetData('Voorraad Vriezer'),
        SheetsAPI.getSheetData('Restjes Vriezer'),
        SheetsAPI.getSheetData('Archief'),
        SheetsAPI.getSheetData('Receptendatabase'),
        SheetsAPI.getSheetData('Kookboeken'),
    ]);

    // Sla data op zonder header rij (rij 0)
    data.weekplanning = wp.length > 1 ? wp.slice(1) : [];
    data.voorraadVriezer = vv.length > 1 ? vv.slice(1) : [];
    data.restjesVriezer = rv.length > 1 ? rv.slice(1) : [];
    data.archief = ar.length > 1 ? ar.slice(1) : [];
    data.receptendatabase = rd.length > 1 ? rd.slice(1) : [];
    data.kookboeken = kb.length > 1 ? kb.slice(1) : [];
}

/**
 * Haal data op voor een specifieke sheet key.
 */
export function get(sheetKey) {
    return data[sheetKey] || [];
}

/**
 * Geef de numerieke sheetId voor een sheetnaam.
 */
export function getSheetId(sheetName) {
    return sheetIds[sheetName];
}

/**
 * Geef de sheetnaam voor een key.
 */
export function getSheetName(key) {
    return KEYS_TO_SHEETS[key];
}

/**
 * Markeer een bereik als dirty (gewijzigd) en plan een save.
 */
export function markDirty(range, values) {
    dirty.set(range, values);
    scheduleSave();
}

/**
 * Plan een debounced save (1500ms na laatste wijziging).
 */
function scheduleSave() {
    clearTimeout(saveTimer);
    if (onSaveStatusChange) onSaveStatusChange('saving');
    saveTimer = setTimeout(() => flush(), 1500);
}

/**
 * Flush alle dirty wijzigingen naar Google Sheets.
 */
async function flush() {
    if (dirty.size === 0) return;
    if (saving) {
        // Er loopt al een save, plan opnieuw
        scheduleSave();
        return;
    }

    saving = true;
    const entries = [...dirty.entries()];
    dirty.clear();

    const batchData = entries.map(([range, values]) => ({ range, values }));

    try {
        await SheetsAPI.batchUpdateValues(batchData);
        if (onSaveStatusChange) onSaveStatusChange('saved');
        // Reset naar idle na 2 seconden
        setTimeout(() => {
            if (!saving && dirty.size === 0 && onSaveStatusChange) {
                onSaveStatusChange('idle');
            }
        }, 2000);
    } catch (err) {
        console.error('Save failed:', err);
        // Zet items terug in dirty voor retry
        entries.forEach(([range, values]) => {
            if (!dirty.has(range)) {
                dirty.set(range, values);
            }
        });
        if (onSaveStatusChange) onSaveStatusChange('error');
        showToast('Opslaan mislukt - probeer opnieuw', 'error');
    } finally {
        saving = false;
    }
}

/**
 * Forceer een onmiddellijke save (bijv. voor navigatie).
 */
export async function flushNow() {
    clearTimeout(saveTimer);
    await flush();
}
