// Vriezer beheer view - Voorraad en Restjes

import * as Store from '../store.js';
import * as SheetsAPI from '../sheets-api.js';
import { createFreezerItem } from '../components/freezer-item.js';
import { showModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { formatDateSheet } from '../utils.js';

let activeTab = 'voorraad'; // 'voorraad' of 'restjes'

/**
 * Initialiseer de vriezer view (event listeners).
 */
export function init() {
    // Sub-tab knoppen
    document.querySelectorAll('.freezer-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            activeTab = btn.dataset.freezer;
            document.querySelectorAll('.freezer-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            render();
        });
    });

    // Toevoegen knop
    const addBtn = document.getElementById('btn-add-freezer');
    if (addBtn) {
        addBtn.addEventListener('click', showAddModal);
    }
}

/**
 * Render de vriezerlijst.
 */
export function render() {
    const storeKey = activeTab === 'voorraad' ? 'voorraadVriezer' : 'restjesVriezer';
    const sheetName = activeTab === 'voorraad' ? 'Voorraad Vriezer' : 'Restjes Vriezer';
    const items = Store.get(storeKey);
    const container = document.getElementById('freezer-list');
    if (!container) return;

    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = `<p class="empty-state">Geen items in ${activeTab === 'voorraad' ? 'de voorraad' : 'restjes'}</p>`;
        return;
    }

    items.forEach((item, index) => {
        const sheetRowNum = index + 2; // 1-based + header

        const row = createFreezerItem({
            name: item[0] || '',
            dateAdded: item[2] || item[1] || '',
            onEditName: (value) => {
                const range = `'${sheetName}'!A${sheetRowNum}`;
                Store.markDirty(range, [[value]]);
                item[0] = value;
            },
            onDelete: () => {
                confirmDelete(item[0], sheetName, sheetRowNum);
            },
        });

        container.appendChild(row);
    });
}

/**
 * Toon de modal om een nieuw item toe te voegen.
 */
function showAddModal() {
    showModal({
        title: 'Item toevoegen',
        body: `
            <div class="form-group">
                <label class="form-label" for="freezer-add-name">Naam</label>
                <input id="freezer-add-name" class="input" type="text" placeholder="Bijv. Lasagne" autofocus>
            </div>
        `,
        confirmText: 'Toevoegen',
        onConfirm: async () => {
            const name = document.getElementById('freezer-add-name')?.value?.trim();

            if (!name) {
                showToast('Vul een naam in', 'warning');
                return;
            }

            const sheetName = activeTab === 'voorraad' ? 'Voorraad Vriezer' : 'Restjes Vriezer';
            const dateAdded = formatDateSheet(new Date());

            try {
                await SheetsAPI.appendRow(sheetName, [name, '', dateAdded]);
                await Store.loadAll();
                render();
                showToast('Item toegevoegd', 'success');
            } catch (err) {
                console.error('Failed to add freezer item:', err);
                showToast('Toevoegen mislukt', 'error');
            }
        },
    });
}

/**
 * Bevestig verwijdering van een item.
 */
function confirmDelete(itemName, sheetName, sheetRowNum) {
    showModal({
        title: 'Item verwijderen?',
        body: `<p>Weet je zeker dat je <strong>${itemName || 'dit item'}</strong> wilt verwijderen?</p>`,
        confirmText: 'Verwijderen',
        danger: true,
        onConfirm: async () => {
            try {
                const sheetId = Store.getSheetId(sheetName);
                // deleteRow gebruikt 0-based index
                await SheetsAPI.deleteRow(sheetId, sheetRowNum - 1);
                await Store.loadAll();
                render();
                showToast('Item verwijderd', 'success');
            } catch (err) {
                console.error('Failed to delete freezer item:', err);
                showToast('Verwijderen mislukt', 'error');
            }
        },
    });
}
