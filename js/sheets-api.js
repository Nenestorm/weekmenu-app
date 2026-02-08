// Google Sheets API wrapper - alle CRUD operaties

/**
 * Lees alle rijen van een named sheet.
 * Geeft een array van arrays terug (inclusief header rij).
 */
export async function getSheetData(sheetName) {
    const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        range: `'${sheetName}'!A:Z`,
    });
    return response.result.values || [];
}

/**
 * Update een specifiek bereik (één cel of meerdere cellen).
 */
export async function updateRange(range, values) {
    return gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        range: range,
        valueInputOption: 'USER_ENTERED',
        resource: { values: values },
    });
}

/**
 * Batch update: meerdere bereiken tegelijk bijwerken.
 * data = Array van { range: string, values: string[][] }
 */
export async function batchUpdateValues(data) {
    return gapi.client.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        resource: {
            data: data,
            valueInputOption: 'USER_ENTERED',
        },
    });
}

/**
 * Voeg een nieuwe rij toe aan het einde van een sheet.
 */
export async function appendRow(sheetName, rowValues) {
    return gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        range: `'${sheetName}'!A:A`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: { values: [rowValues] },
    });
}

/**
 * Voeg meerdere rijen tegelijk toe.
 */
export async function appendRows(sheetName, rows) {
    return gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        range: `'${sheetName}'!A:A`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: { values: rows },
    });
}

/**
 * Verwijder een specifieke rij (0-based index).
 * Vereist de numerieke sheetId (niet de sheetnaam).
 */
export async function deleteRow(sheetId, rowIndex) {
    return gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        resource: {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId: sheetId,
                        dimension: 'ROWS',
                        startIndex: rowIndex,
                        endIndex: rowIndex + 1,
                    },
                },
            }],
        },
    });
}

/**
 * Verwijder meerdere rijen (0-based indices).
 * Verwijdert van onder naar boven zodat indices niet verschuiven.
 */
export async function deleteRows(sheetId, rowIndices) {
    if (rowIndices.length === 0) return;

    // Sorteer aflopend zodat lagere rijen eerst verwijderd worden
    const sorted = [...rowIndices].sort((a, b) => b - a);
    const requests = sorted.map(idx => ({
        deleteDimension: {
            range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: idx,
                endIndex: idx + 1,
            },
        },
    }));

    return gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        resource: { requests },
    });
}

/**
 * Haal sheet metadata op (sheetnamen -> numerieke sheetIds).
 * Nodig voor delete operaties.
 */
export async function getSheetMetadata() {
    const response = await gapi.client.sheets.spreadsheets.get({
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        fields: 'sheets.properties',
    });

    const map = {};
    response.result.sheets.forEach(s => {
        map[s.properties.title] = s.properties.sheetId;
    });
    return map;
}
