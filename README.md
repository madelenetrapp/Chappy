# Chappy

Chappy är en chattapplikation där användare kan skriva meddelanden i olika kanaler och skicka privata meddelanden till varandra. Det går att använda öppna kanaler utan att logga in, medan låsta kanaler och privata meddelanden kräver inloggning.

Projektet är byggt med React, TypeScript, Node.js, Express och AWS DynamoDB.

## Innehållsförteckning

- [Förord](#förord)
- [Tekniker](#tekniker)
- [Kom igång](#kom-igång)
- [Funktioner](#funktioner)
- [API](#api)
- [Databastabell](#databastabell)
- [Projektstruktur](#projektstruktur)
- [Status och testning](#status och testning)

---

## Förord

Chappy är ett fullstackprojekt där frontend och backend arbetar tillsammans.

Frontend är byggd med React och TypeScript och används för att visa chattar, användare, kanaler och meddelanden.

Backend är byggd med Node.js, Express och TypeScript. Den tar emot anrop från frontend, hanterar användare och meddelanden och kommunicerar med databasen.

AWS DynamoDB används för att spara information så att den finns kvar när sidan laddas om.

Projektet har också funktioner för registrering, inloggning och privata meddelanden.

## Tekniker

| Teknik | Användning |
|---|---|
| React | Bygger gränssnittet |
| TypeScript | Används i frontend och backend |
| Vite | Utvecklingsmiljö för frontend |
| Node.js | Kör backend |
| Express | Hanterar API-anrop |
| AWS DynamoDB | Sparar användare, kanaler och meddelanden |
| Zod | Validerar data |
| bcrypt | Hashar lösenord |
| JWT | Används för autentisering |
| React Router | Hanterar navigering mellan sidor |
| CSS | Används för design och responsiv layout |

## Kom igång

Installera projektets beroenden från projektets rotmapp:

```bash
npm install
```

Skapa `backend/.env` med följande miljövariabler:

```env
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=DIN_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=DIN_AWS_SECRET_KEY
```

Använd dina egna AWS-uppgifter.

Skapa `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:3001
```

Starta backend och frontend i var sin terminal från projektets rotmapp.

**Backend:**

```bash
npm run dev -w backend
```

**Frontend:**

```bash
npm run dev -w frontend
```

Frontend körs lokalt på:

`http://localhost:5173`

Backend körs lokalt på:

`http://localhost:3001`

Bygg projektets delar:

```bash
npm run build -w backend
npm run build -w frontend
```

DynamoDB-tabellen `Chappy` behöver finnas i det AWS-konto som används.

Lägg aldrig lösenord, AWS-nycklar eller andra hemligheter i GitHub.

---

## Funktioner

### Användare

Chappy har funktioner för att registrera användare och logga in.

Vid registrering kontrolleras informationen innan den sparas i databasen. Lösenord hashats med bcrypt och sparas inte som vanlig text.

Vid inloggning används JWT för att kontrollera att användaren är inloggad.

### Kanaler

Chappy har två typer av kanaler:

- **Öppna kanaler:** Gäster och inloggade användare kan läsa och skriva meddelanden.
- **Låsta kanaler:** Användaren behöver vara inloggad för att läsa och skriva meddelanden.

Alla inloggade användare ska ha tillgång till de låsta kanalerna.

### Privata meddelanden

Inloggade användare kan skicka privata meddelanden, även kallade DM.

Privata meddelanden ska bara kunna läsas av de användare som deltar i konversationen.

### Meddelanden

Meddelanden skickas från frontend till backend med HTTP-anrop.

Backend tar emot meddelandet och sparar det i DynamoDB.

När en användare öppnar en chatt hämtas meddelandena från databasen och visas i frontend.

### Språk

Chappy har ett språkval i gränssnittet.

Projektet omfattar även AI-baserade språkfunktioner. Dessa behöver dokumenteras när det är bekräftat vilka funktioner som är färdiga och hur de används.

### Responsiv design

Gränssnittet är byggt med React och CSS och anpassas efter olika skärmstorlekar.

På större skärmar visas chatten tillsammans med sidopaneler för kanaler, kontakter och inställningar.

På mindre skärmar används en anpassad layout där sidopanelernas innehåll kan visas separat.

---

## API

Frontend kommunicerar med backend genom ett REST API.

API:et används för att hämta och spara information i databasen samt hantera användare och meddelanden.

### Health

| Endpoint | Metod | Funktion |
|---|---|---|
| `/api/health` | GET | Kontrollerar att backend svarar |

#### GET /api/health

Kontrollerar att Express-servern svarar. Endpointen testar inte anslutningen till DynamoDB.

**Response:**

```json
{
  "status": "ok"
}
```

**Statuskoder:**

| Status | Beskrivning |
|---|---|
| 200 OK | Backend svarar |

### Messages

| Endpoint | Metod | Funktion |
|---|---|---|
| `/api/messages` | GET | Hämtar sparad chatthistorik |
| `/api/messages` | POST | Skapar och sparar ett meddelande |

#### GET /api/messages

Hämtar meddelanden från DynamoDB.

I den ursprungliga versionen användes den tillfälligt hårdkodade chatten `CHAT#456`.

**Exempel på response:**

```json
[
  {
    "pk": "CHAT#456",
    "sk": "MESSAGE#2026-10-30T14:56:56.768Z#4b04f0f1-9a44-44ce-903b-78f66b3aa5ec",
    "id": "4b04f0f1-9a44-44ce-903b-78f66b3aa5ec",
    "text": "Hej!",
    "sender": "user"
  }
]
```

**Statuskoder:**

| Status | Beskrivning |
|---|---|
| 200 OK | Meddelandena hämtades |
| 500 Internal Server Error | Meddelandena kunde inte hämtas |

#### POST /api/messages

Tar emot ett meddelande, validerar texten och sparar det i DynamoDB.

**Request body:**

```json
{
  "text": "Hej!"
}
```

**Exempel på anrop:**

```javascript
const payload = { text: "Hej!" };

const res = await fetch("http://localhost:3001/api/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
});

const message = await res.json();
```

Texten måste vara en sträng som inte är tom.

**Exempel på response:**

```json
{
  "id": "4b04f0f1-9a44-44ce-903b-78f66b3aa5ec",
  "text": "Hej!",
  "sender": "user"
}
```

Servern skapar ett nytt unikt ID för varje meddelande.

**Statuskoder:**

| Status | Beskrivning |
|---|---|
| 201 Created | Meddelandet sparades |
| 400 Bad Request | Meddelandet innehåller felaktig data |
| 500 Internal Server Error | Meddelandet kunde inte sparas |

### Övriga API-funktioner

Projektet innehåller också arbete med API-funktioner för:

- Registrering av användare
- Inloggning
- Hämtning av användare
- Hämtning av kanaler
- Meddelanden i öppna och låsta kanaler
- Privata meddelanden

De exakta endpoint-adresserna och statuskoderna behöver kontrolleras mot den senaste backendkoden innan de läggs till här.

---

## Databastabell

Chappy använder AWS DynamoDB för att lagra information.

Databastabellen heter `Chappy` och använder två nycklar:

- **pk (partition key):** Anger vilken användare eller chatt informationen tillhör.
- **sk (sort key):** Anger vilken typ av information som sparas.

Exempel från den ursprungliga databasen:

| pk | sk | Information |
|---|---|---|
| CHAT#456 | METADATA | Information om chatten |
| CHAT#456 | MESSAGE#tidpunkt#uuid | Meddelande |
| USER#123 | PROFILE | Användaruppgifter |
| USER#123 | SETTINGS | Användarinställningar |

Genom att använda `pk` och `sk` kan backend hämta information som hör till en viss användare eller chatt.

Projektet har även utökats med hantering av kanaler och privata meddelanden. Den fullständiga nyckelstrukturen behöver kontrolleras mot den aktuella databasen.

---

## Projektstruktur

Projektet är uppdelat i frontend, backend och en gemensam del.

```text
Chappy/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── schemas/
│   │   └── server.ts
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── schemas/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── shared/
└── package.json
```

*Strukturen ovan visar projektets huvudsakliga uppdelning. Alla mappnamn behöver jämföras med den senaste versionen av projektet.*

### Backend

Backend innehåller servern, API-routes, databaskopplingen och hanteringen av användare och meddelanden.

### Frontend

Frontend innehåller sidor, komponenter, API-anrop och CSS.

Gränssnittet är uppdelat i mindre komponenter för exempelvis chattmeddelanden, skrivfält, sidopaneler och språkval.

### Shared

Den gemensamma delen är avsedd för kod och typer som kan användas av både frontend och backend.

---

## Status och testning

Chappy är färdigutvecklat och testat.

Backendens API-endpoints har testats med Insomnia för att kontrollera att de fungerar som de ska.

Följande funktioner är färdiga och testade:

- Registrering och inloggning.
- Lösenordshantering med bcrypt och autentisering med JWT.
- Visa användare och kanaler.
- Läsa och skriva meddelanden i öppna kanaler utan inloggning.
- Läsa och skriva meddelanden i låsta kanaler som inloggad.
- Skicka och läsa privata meddelanden (DM).
- Kontrollera att privata meddelanden bara är tillgängliga för deltagarna.
- Spara och hämta meddelanden från DynamoDB.
- Kommunikation mellan frontend och backend.

API:et har testats med både giltiga och ogiltiga anrop för att kontrollera att det returnerar rätt svar och statuskoder.

---

## Om projektet

Chappy är byggt som ett utbildningsprojekt inom frontendutveckling.

Syftet är att arbeta med både frontend och backend och förstå hur de olika delarna av en fullstackapplikation fungerar tillsammans.

Projektet omfattar bland annat React, TypeScript, API-anrop, databashantering, autentisering och responsiv design.