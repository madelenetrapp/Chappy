## Innehållsförteckning:

- [Förord] (#Förord)
- [Kom igång] (#Kom igång)
- [Health] (#Health)
- [Messages] (#Messages)
- [Databastabell] (#Databastabell)
- [Projektstruktur] (#Projektstruktur)
- [Status och begrensningar] (#Status och begrensningar)

## Förord
Chappy är en chattapplikation byggd med React, TypeScript, Node.js, Express och AWS DynamoDB. Frontend skickar HTTP-anrop till backend, som sparar och hämtar meddelanden i DynamoDB.

Alla lokala API-anrop görs mot bas-URL:en http://localhost:3001. Frontend körs lokalt på http://localhost:5173.

Denna dokumentation beskriver de API-endpoints som är implementerade i projektets nuvarande version.

## Kom igång
Installera projektets beroenden från projektets rotmapp:
npm install

Skapa backend/.env med följande miljövariabler (använd egna AWS-uppgifter):
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=DIN_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=DIN_AWS_SECRET_KEY

Skapa frontend/.env.local:
VITE_API_URL=http://localhost:3001

Starta backend och frontend i var sin terminal, från projektets rotmapp:
npm run dev -w backend
npm run dev -w frontend

Bygg projektets delar:
npm run build -w backend
npm run build -w frontend

## Health
| Endpoint        | Method | Funktionalitet                 |
| /api/health     | GET    | Kontrollera att backend svarar |

GET /api/health
Kontrollerar att Express-servern svarar. Endpointen testar inte DynamoDB-anslutningen.

Request
Parameter	Typ	Krav	Description
—	        —	  —	    Inga parametrar eller request body krävs.

Response 

JSON
{
  "status": "ok"
}

Statuskoder
Status	Description
200 OK	Backend svarar.

## Messages
Endpoint	     Method	   Funktionalitet
/api/messages	 GET	     Hämta sparad chatthistorik
/api/messages	 POST	     Skapa och spara ett meddelande

GET /api/messages
Hämtar meddelanden från DynamoDB för den tillfälligt hårdkodade chatten CHAT#456. Endast poster vars sorteringsnyckel börjar med MESSAGE# hämtas, inte chattens metadata. 

Request
Parameter	Typ	Krav	Description
—	        —	  —	    Inga parametrar eller request body krävs.

Response
[
  {
    "pk": "CHAT#456",
    "sk": "MESSAGE#2026-10-30T14:56:56.768Z#4b04f0f1-9a44-44ce-903b-78f66b3aa5ec",
    "id": "4b04f0f1-9a44-44ce-903b-78f66b3aa5ec",
    "text": "Hej!",
    "sender": "user"
  }
]

API:et returnerar de råa DynamoDB-posterna. Äldre testdata kan ha andra fält än id, text och sender. Frontend filtrerar för närvarande bort poster som inte har dessa fält i förväntat format.

Statuskoder
Status	                       Description
200 OK	                       Chatthistoriken hämtades.
500 Internal Server Error	     Chatthistoriken kunde inte hämtas.

POST /api/messages
Validerar texten, skapar ett unikt ID och sparar meddelandet i DynamoDB innan det returneras till klienten.

Request
Request body 

JSON
{
  "text": "Hej!"
}

Exempel:
const payload = { text: "Hej!" };

const res = await fetch("http://localhost:3001/api/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
});

const message = await res.json();

Fältet text måste vara en sträng som inte är tom efter att inledande och avslutande blanksteg tagits bort.

ID:t ovan är ett exempel; servern genererar ett nytt UUID för varje meddelande. 

Statuskoder
Status	                             Description
201 Created	                         Meddelandet sparades och returnerades.
400 Bad Request	text saknas, 
har fel typ eller är tomt.
500 Internal Server Error	           Meddelandet kunde inte sparas i DynamoDB.

## Databastabell
DynamoDB-tabellen heter Chappy och använder en sammansatt primärnyckel.

pk (partition key)	             sk (sort key)	                             Övriga attribut	                                   Funktion
CHAT#456	                       METADATA	                                   Chattmetadata	                                     Befintlig testdata
CHAT#456	                       MESSAGE#<tidpunkt>#<uuid>	                 id, text, sender	                                   Meddelanden skapade via API:et
CHAT#456	                       MESSAGE#<tidpunkt>#<id>	                   Exempelvis senderId, originalText, translatedText	 Äldre testmeddelanden med annan struktur
USER#123	                       PROFILE	                                   Användaruppgifter	                                 Befintlig testdata
USER#123	                       SETTINGS	                                   Användarinställningar	                             Befintlig testdata


pk identifierar vilken chatt eller användare en post tillhör. sk identifierar postens typ och gör att meddelanden kan hämtas i tidsordning. CHAT#456 används tillfälligt under utvecklingen.

## Projektstruktur
Chappy/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   └── dynamoDB.ts       # Anslutning till DynamoDB
│   │   └── server.ts             # Express och API-endpoints
│   ├── .env                      # Lokala hemligheter (ska inte committas)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── healthApi.ts      # Anrop till /api/health
│   │   │   └── messagesApi.ts    # Anrop till /api/messages
│   │   ├── components/
│   │   │   ├── ChatInput.tsx     # Skriva och skicka meddelanden
│   │   │   └── ChatMessage.tsx   # Visa ett meddelande
│   │   ├── types/
│   │   │   └── ChatMessage.ts    # Meddelandetyp
│   │   ├── App.tsx               # Chattflöde och tillstånd
│   │   └── main.tsx              # Startar React
│   ├── .env.local                # Lokal API-adress
│   └── package.json
├── shared/
└── package.json                 # npm workspaces

## Status och begränsningar
Meddelanden kan skickas, sparas i DynamoDB och hämtas igen efter omladdning av frontend.
API:et använder tills vidare en hårdkodad chatt (CHAT#456).
Användarregistrering, inloggning, kanaler, direktmeddelanden och AI-översättning ingår i projektets planerade funktionalitet men dokumenteras inte som implementerade här.
Backend har för närvarande CORS-inställningen http://localhost:5173. Kommunikation med en publicerad frontend kräver att den publicerade adressen tillåts.
Inga användarbehörigheter kontrolleras ännu i de dokumenterade meddelande-endpointsen.
