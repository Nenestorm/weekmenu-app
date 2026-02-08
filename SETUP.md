# Weekmenu App - Setup Instructies

## 1. Google Cloud Project aanmaken

1. Ga naar [Google Cloud Console](https://console.cloud.google.com/)
2. Klik op **Nieuw project** (of "New Project")
3. Naam: bijv. "Weekmenu App"
4. Klik op **Maken**

## 2. Google Sheets API inschakelen

1. Ga naar **APIs & Services > Bibliotheek** (Library)
2. Zoek naar "Google Sheets API"
3. Klik erop en klik **Inschakelen** (Enable)

## 3. OAuth Consent Screen configureren

1. Ga naar **APIs & Services > OAuth consent screen**
2. Kies **Extern** (External) als user type
3. Vul in:
   - App naam: "Weekmenu"
   - Support email: jouw e-mailadres
   - Developer contact: jouw e-mailadres
4. Klik **Opslaan en doorgaan**
5. Bij **Scopes**: klik "Add or Remove Scopes"
   - Zoek en selecteer: `https://www.googleapis.com/auth/spreadsheets`
   - Klik **Bijwerken** en dan **Opslaan**
6. Bij **Test users**: voeg beide Google-accounts toe die de app mogen gebruiken
7. Klik **Opslaan**

## 4. OAuth 2.0 Credentials aanmaken

1. Ga naar **APIs & Services > Credentials**
2. Klik **+ Create Credentials > OAuth client ID**
3. Application type: **Web application**
4. Naam: "Weekmenu Web Client"
5. Bij **Authorized JavaScript origins** voeg toe:
   - `http://localhost:8080`
6. Klik **Maken**
7. Kopieer de **Client ID** (iets als `123456789.apps.googleusercontent.com`)

## 5. API Key aanmaken

1. Ga naar **APIs & Services > Credentials**
2. Klik **+ Create Credentials > API key**
3. Kopieer de API key
4. (Optioneel maar aanbevolen) Klik op de key en beperk tot:
   - **API restrictions**: Google Sheets API

## 6. Google Spreadsheet aanmaken

1. Ga naar [Google Sheets](https://sheets.google.com)
2. Maak een nieuwe spreadsheet aan, naam: "Weekmenu"
3. Maak 6 tabbladen (sheets) aan met exact deze namen:
   - `Weekplanning`
   - `Voorraad Vriezer`
   - `Restjes Vriezer`
   - `Archief`
   - `Receptendatabase`
   - `Kookboeken`
4. Voeg in elk tabblad de header-rij toe:
   - **Weekplanning**: `Week` | `Dag` | `Datum` | `Gerecht` | `Bereidingsnotitie`
   - **Voorraad Vriezer**: `Item` | `Porties` | `Datum Toegevoegd`
   - **Restjes Vriezer**: `Item` | `Porties` | `Datum Toegevoegd`
   - **Archief**: `Gerecht` | `Datum Gegeten` | `Bereidingsnotitie`
   - **Receptendatabase**: `Titel` | `Bron` | `Link`
   - **Kookboeken**: `Titel` | `Auteur` | `Notities`
5. Deel de spreadsheet met de tweede gebruiker (Editor-rechten)
6. Kopieer het **Spreadsheet ID** uit de URL:
   `https://docs.google.com/spreadsheets/d/HIER_STAAT_HET_ID/edit`

## 7. Config invullen

Open `config.js` en vul de drie waarden in:

```javascript
const CONFIG = {
    CLIENT_ID: 'jouw-client-id.apps.googleusercontent.com',
    API_KEY: 'jouw-api-key',
    SPREADSHEET_ID: 'jouw-spreadsheet-id',
    ...
};
```

## 8. App starten

```bash
chmod +x serve.sh
./serve.sh
```

Open `http://localhost:8080` in je browser.
